"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addBookmarkedRepo,
  analyzeRepository,
  checkHealth,
  fetchAllReports,
  getStoredUser,
  generateHandoverReport,
  type AnalyzeResponse,
  type HandoverReport,
  type HealthResponse,
  type ReportSummary,
  type UserProfile,
} from "@/lib/api";
import RepoConnectForm from "@/components/RepoConnectForm";
import RepoSummaryCard from "@/components/RepoSummaryCard";
import ActivityTabs from "@/components/ActivityTabs";
import HandoverReportView from "@/components/HandoverReportView";
import { relativeDate } from "@/lib/utils";

type BackendStatus = "checking" | "ok" | "error";
type StepState =
  | "idle"
  | "fetching_repo"
  | "ready_to_generate"
  | "generating_report"
  | "report_ready"
  | "error";

export default function WorkspacePage() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [recentReports, setRecentReports] = useState<ReportSummary[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string>("");

  function loadRecentReports() {
    fetchAllReports()
      .then((reports) => setRecentReports(reports))
      .catch(() => {});
  }

  const [step, setStep] = useState<StepState>("idle");
  const [repoData, setRepoData] = useState<AnalyzeResponse | null>(null);
  const [handoverReport, setHandoverReport] = useState<HandoverReport | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleAnalyze(url: string) {
    setStep("fetching_repo");
    setRepoData(null);
    setHandoverReport(null);
    setErrorMessage("");
    setBookmarkFeedback("");

    try {
      const data = await analyzeRepository(url);
      setRepoData(data);
      setStep("ready_to_generate");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStep("error");
    }
  }

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    window.addEventListener("handoveriq-auth-change", syncUser);

    checkHealth()
      .then((d) => {
        setHealthData(d);
        setBackendStatus("ok");
        loadRecentReports();
      })
      .catch(() => setBackendStatus("error"));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const repoParam = params.get("repo");
      if (repoParam && repoParam.trim()) {
        handleAnalyze(repoParam.trim());
      }
    }

    return () => window.removeEventListener("handoveriq-auth-change", syncUser);
  }, []);

  async function handleGenerateReport() {
    if (!repoData) return;
    setStep("generating_report");
    setErrorMessage("");

    try {
      const report = await generateHandoverReport(repoData.repository_url);
      setHandoverReport(report);
      setStep("report_ready");
      loadRecentReports();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStep("error");
    }
  }

  async function handleBookmarkCurrentRepo() {
    if (!repoData) return;
    if (!user) {
      setBookmarkFeedback("Sign in to bookmark repositories to your account.");
      return;
    }
    try {
      const updated = await addBookmarkedRepo({
        repo_name: repoData.repo.full_name,
        repo_url: repoData.repository_url,
        notes: repoData.repo.description || "Pinned from Analyzer Workspace",
      });
      setUser(updated);
      setBookmarkFeedback(`Pinned ${repoData.repo.full_name} to your account`);
    } catch {
      setBookmarkFeedback("Could not bookmark repository.");
    }
  }

  function handleReset() {
    setStep("idle");
    setRepoData(null);
    setHandoverReport(null);
    setErrorMessage("");
    setBookmarkFeedback("");
    loadRecentReports();
  }

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Top Breadcrumb & Live Engine Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#EBEBE8] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#6B6B67]">
          <Link href="/" className="hover:text-[#171717] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#171717]">
            Handover Analyzer Workspace
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {user && (
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E2] bg-white px-3 py-1 text-[11px] font-medium text-[#171717] hover:border-[#171717] transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Workspace: {user.name}</span>
            </Link>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E2] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#4A4A47] shadow-sm">
            <StatusDot status={backendStatus} />
            <span>
              {backendStatus === "checking" && "Connecting to engine…"}
              {backendStatus === "ok" &&
                `Engine Ready · ${healthData?.service ?? "handoveriq-api"}`}
              {backendStatus === "error" &&
                "Backend offline — run start-all.bat"}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Header & Input */}
      {step !== "report_ready" && (
        <section className="space-y-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#6B6B67]">
              Interactive Intelligence Terminal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Connect a GitHub Repository
            </h1>
            <p className="text-sm text-[#6B6B67] leading-relaxed">
              Enter any public repository URL or{" "}
              <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-[#EBEBE8]">
                owner/repo
              </code>{" "}
              slug to collect real commit history, pull requests, and issues for
              handover synthesis.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E5E2] bg-dot-grid p-4 sm:p-6 shadow-sm">
            <div className="rounded-xl border border-[#EBEBE8] bg-white/95 backdrop-blur-sm p-4 sm:p-5 space-y-4">
              <RepoConnectForm
                onSubmit={handleAnalyze}
                loading={
                  step === "fetching_repo" || step === "generating_report"
                }
              />

              {/* Signed-in User Bookmarks Strip */}
              {user && user.bookmarked_repos.length > 0 && (
                <div className="pt-3 border-t border-[#F0EFEA] flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A85]">
                    Your pinned repos:
                  </span>
                  {user.bookmarked_repos.map((bm) => (
                    <button
                      key={bm.repo_name}
                      type="button"
                      disabled={
                        step === "fetching_repo" || step === "generating_report"
                      }
                      onClick={() => handleAnalyze(bm.repo_url)}
                      className="font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-900 hover:text-white transition-all disabled:opacity-50"
                    >
                      ★ {bm.repo_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Loading: Fetching GitHub Activity */}
      {step === "fetching_repo" && (
        <div className="rounded-2xl border border-[#EBEBE8] bg-white p-12 shadow-sm text-center space-y-3 animate-fadeIn">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#EBEBE8] border-t-[#171717]" />
          <p className="text-sm text-[#171717] font-medium">
            Collecting live repository activity from GitHub…
          </p>
          <p className="text-xs text-[#8A8A85]">
            Indexing commits, pull requests, issues, and contributor history.
          </p>
        </div>
      )}

      {/* Loading: Synthesizing Handover Report */}
      {step === "generating_report" && (
        <div className="rounded-2xl border border-[#EBEBE8] bg-white p-12 shadow-sm text-center space-y-3 animate-fadeIn">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#EBEBE8] border-t-[#171717]" />
          <p className="text-sm text-[#171717] font-semibold">
            Synthesizing 5-Pillar Handover Dossier…
          </p>
          <p className="text-xs text-[#8A8A85] max-w-md mx-auto">
            Mapping contributor ownership, tracking unfinished tasks, and
            linking every insight to verifiable GitHub sources.
          </p>
        </div>
      )}

      {/* Error state */}
      {step === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 shadow-sm flex items-start justify-between gap-4 animate-fadeIn">
          <div className="space-y-1">
            <p className="font-semibold text-red-800 text-xs uppercase tracking-wider">
              Analysis Error
            </p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
          <button
            onClick={() => setStep(repoData ? "ready_to_generate" : "idle")}
            className="text-xs font-medium text-red-700 hover:text-red-900 px-3 py-1 rounded-lg border border-red-200 bg-white shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step: Repo fetched, ready to generate report */}
      {step === "ready_to_generate" && repoData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Callout Bar */}
          <div className="rounded-2xl border border-[#171717] bg-[#171717] text-[#F5F5F4] p-6 shadow-md flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="font-semibold text-sm tracking-tight">
                  Repository Activity Indexed — Ready for Handover Synthesis
                </h3>
              </div>
              <p className="text-xs text-[#A3A39E]">
                Collected {repoData.activity.commits_fetched} commits,{" "}
                {repoData.activity.pull_requests_fetched} pull requests, and{" "}
                {repoData.activity.issues_fetched} issues from{" "}
                <span className="text-white font-mono">
                  {repoData.repo.full_name}
                </span>
                .
              </p>
              {bookmarkFeedback && (
                <p className="text-xs text-emerald-300 font-mono pt-1">
                  ✓ {bookmarkFeedback}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleBookmarkCurrentRepo}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all"
              >
                ★ Pin to Account
              </button>
              <button
                onClick={handleGenerateReport}
                className="rounded-full bg-[#F5F5F4] px-5 py-2.5 text-xs font-bold text-[#171717] shadow-sm hover:bg-white transition-all hover:-translate-y-0.5 flex items-center gap-2 shrink-0"
              >
                <span>Generate Handover Dossier</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CountCard
              label="Commits Analyzed"
              value={repoData.activity.commits_fetched}
            />
            <CountCard
              label="Pull Requests"
              value={repoData.activity.pull_requests_fetched}
            />
            <CountCard
              label="Issues Indexed"
              value={repoData.activity.issues_fetched}
            />
            <CountCard
              label="Open Issues"
              value={repoData.activity.open_issues}
              accent
            />
          </div>

          <RepoSummaryCard
            repo={repoData.repo}
            repoUrl={repoData.repository_url}
          />

          <ActivityTabs
            commits={repoData.commits}
            pullRequests={repoData.pull_requests}
            issues={repoData.issues}
            activity={repoData.activity}
          />
        </div>
      )}

      {/* Step: Handover Report Ready */}
      {step === "report_ready" && handoverReport && (
        <HandoverReportView report={handoverReport} onReset={handleReset} />
      )}

      {/* Recent Handover Dossiers */}
      {step === "idle" && recentReports.length > 0 && (
        <section className="space-y-4 pt-2 animate-fadeIn-delayed">
          <div className="flex items-center justify-between border-b border-[#EBEBE8] pb-3">
            <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#6B6B67] font-semibold">
              Saved Handover Dossiers
            </h2>
            <span className="text-xs text-[#8A8A85] font-mono">
              {recentReports.length} archived
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {recentReports.map((r) => (
              <Link
                key={r.report_id}
                href={`/report/${r.report_id}`}
                className="group rounded-2xl border border-[#EBEBE8] bg-white p-5 shadow-sm hover:border-[#171717]/40 hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#171717] truncate">
                      {r.repo_name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#6B6B67] border border-[#EBEBE8]">
                      {r.generator.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8A8A85]">
                    <span>{r.insights_count} insights</span>
                    <span>·</span>
                    <span>{r.unresolved_gaps} pending gaps</span>
                    <span>·</span>
                    <span>{relativeDate(r.generated_at)}</span>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#6B6B67] group-hover:text-[#171717] group-hover:translate-x-1 transition-all shrink-0">
                  View →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: BackendStatus }) {
  const color =
    status === "checking"
      ? "bg-amber-400"
      : status === "ok"
      ? "bg-emerald-500"
      : "bg-red-500";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color} shrink-0`}
      aria-hidden
    />
  );
}

function CountCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        accent
          ? "border-amber-200/80 bg-amber-50/40"
          : "border-[#EBEBE8] bg-white"
      }`}
    >
      <p
        className={`text-2xl font-bold tracking-tight font-mono ${
          accent ? "text-amber-800" : "text-[#171717]"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[#6B6B67] mt-1">{label}</p>
    </div>
  );
}

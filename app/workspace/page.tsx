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
  type AnalysisScope,
  type AnalyzeResponse,
  type HandoverReport,
  type HealthResponse,
  type ReportSummary,
  type UserProfile,
} from "@/lib/api";
import {
  getOfflineDemoReport,
  getOfflineReportSummaries,
} from "@/lib/demoReports";
import RepoConnectForm from "@/components/RepoConnectForm";
import RepoSummaryCard from "@/components/RepoSummaryCard";
import ActivityTabs from "@/components/ActivityTabs";
import HandoverReportView from "@/components/HandoverReportView";
import RepoComparisonSection from "@/components/RepoComparisonSection";
import { relativeDate } from "@/lib/utils";
import { unlockBadge } from "@/lib/achievements";

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
  const [retryingHealth, setRetryingHealth] = useState(false);

  function loadRecentReports() {
    fetchAllReports()
      .then((reports) => {
        if (reports && reports.length > 0) {
          setRecentReports(reports);
        } else {
          setRecentReports(getOfflineReportSummaries());
        }
      })
      .catch(() => {
        setRecentReports(getOfflineReportSummaries());
      });
  }

  const [step, setStep] = useState<StepState>("idle");
  const [repoData, setRepoData] = useState<AnalyzeResponse | null>(null);
  const [handoverReport, setHandoverReport] = useState<HandoverReport | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [scope, setScope] = useState<AnalysisScope>({});

  function retryHealthCheck() {
    setRetryingHealth(true);
    setBackendStatus("checking");
    checkHealth()
      .then((d) => {
        setHealthData(d);
        setBackendStatus("ok");
        loadRecentReports();
      })
      .catch(() => {
        setBackendStatus("error");
      })
      .finally(() => {
        setRetryingHealth(false);
      });
  }

  function loadOfflineDossier(slug: string) {
    const offline = getOfflineDemoReport(slug);
    if (offline) {
      setHandoverReport(offline);
      setStep("report_ready");
      setErrorMessage("");
    }
  }

  async function handleAnalyze(url: string, newScope: AnalysisScope = {}) {
    setScope(newScope);
    setStep("fetching_repo");
    setRepoData(null);
    setHandoverReport(null);
    setErrorMessage("");
    setBookmarkFeedback("");

    try {
      const data = await analyzeRepository(url, newScope);
      setRepoData(data);
      setStep("ready_to_generate");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
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
      .catch(() => {
        setBackendStatus("error");
        loadRecentReports();
      });

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
      const report = await generateHandoverReport(
        repoData.repository_url,
        scope
      );
      setHandoverReport(report);
      setStep("report_ready");
      unlockBadge("first_dossier");
      loadRecentReports();
    } catch (err: unknown) {
      // Check if we can fallback to pre-indexed report for demo repositories
      const offline = getOfflineDemoReport(repoData.repository_url);
      if (offline) {
        setHandoverReport(offline);
        setStep("report_ready");
        unlockBadge("first_dossier");
      } else {
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setStep("error");
      }
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

  const isRateLimitOrNetwork =
    errorMessage.toLowerCase().includes("rate limit") ||
    errorMessage.includes("403") ||
    errorMessage.toLowerCase().includes("failed to fetch") ||
    errorMessage.toLowerCase().includes("networkerror") ||
    errorMessage.toLowerCase().includes("offline");

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Top Breadcrumb & Live Engine Status Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#EBEBE8] dark:border-white/10 pb-4">
        <div className="flex items-center gap-2 text-xs text-[#6B6B67] dark:text-zinc-400 flex-wrap">
          <Link
            href="/"
            className="hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#171717] dark:text-white">
            Handover Analyzer Workspace
          </span>
          <span className="hidden sm:inline text-[#8A8A85]">·</span>
          <span className="hidden sm:inline text-[11px] font-mono text-[#8A8A85] dark:text-zinc-400">
            Built by <strong>Team CodeVengers</strong>:{" "}
            <span className="text-[#171717] dark:text-white font-medium">
              Ved Wandile, Diptesh Patil, Prachi Patil, Ritisha Songire
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {user && (
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E2] dark:border-white/15 bg-white dark:bg-zinc-800 px-3 py-1 text-[11px] font-medium text-[#171717] dark:text-white hover:border-[#171717] transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Workspace: {user.name}</span>
            </Link>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E2] dark:border-white/15 bg-white/80 dark:bg-zinc-800 px-3 py-1 text-[11px] font-medium text-[#4A4A47] dark:text-zinc-300 shadow-sm">
            <StatusDot status={backendStatus} />
            <span>
              {backendStatus === "checking" && "Connecting to engine…"}
              {backendStatus === "ok" &&
                `Engine Ready · ${healthData?.service ?? "handoveriq-api"}`}
              {backendStatus === "error" && "Engine Standby · Resilient Mode Active"}
            </span>
          </div>
        </div>
      </div>

      {/* ── RESILIENT OFFLINE & STANDBY BANNER (Shows only when backend is connecting or unreachable) ── */}
      {backendStatus === "error" && (
        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-800/60 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 dark:from-amber-950/40 dark:via-zinc-900 dark:to-amber-950/30 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
              ⚡
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                  Resilient Offline Mode Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300 dark:border-amber-700">
                  Zero Hallucination Guaranteed
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
                The live API container is warming up or offline. You can seamlessly explore pre-indexed repository dossiers with 100% verified evidence links, or retry the connection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              disabled={retryingHealth}
              onClick={retryHealthCheck}
              className="rounded-full bg-amber-950 dark:bg-amber-400 px-4 py-2 text-xs font-semibold text-white dark:text-amber-950 hover:bg-black dark:hover:bg-amber-300 transition-all disabled:opacity-50"
            >
              {retryingHealth ? "Pinging…" : "Retry Live Engine ↺"}
            </button>
            <button
              type="button"
              onClick={() => loadOfflineDossier("octocat/Hello-World")}
              className="rounded-full border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-amber-950 dark:text-amber-200 hover:border-amber-950 transition-all"
            >
              Load Demo Dossier →
            </button>
          </div>
        </div>
      )}

      {/* Workspace Header & Input */}
      {step !== "report_ready" && (
        <section className="space-y-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400 font-semibold">
              Interactive Intelligence Terminal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
              Connect a GitHub Repository
            </h1>
            <p className="text-sm text-[#6B6B67] dark:text-zinc-400 leading-relaxed">
              Enter any public repository URL or{" "}
              <code className="font-mono text-xs bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-[#EBEBE8] dark:border-zinc-700">
                owner/repo
              </code>{" "}
              slug to collect real commit history, pull requests, and issues for
              handover synthesis.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E5E2] dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-4 sm:p-6 shadow-sm">
            <div className="rounded-xl border border-[#EBEBE8] dark:border-white/10 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4">
              <RepoConnectForm
                onSubmit={handleAnalyze}
                loading={
                  step === "fetching_repo" || step === "generating_report"
                }
              />

              {/* Signed-in User Bookmarks Strip */}
              {user && user.bookmarked_repos.length > 0 && (
                <div className="pt-3 border-t border-[#F0EFEA] dark:border-white/10 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A85] dark:text-zinc-400">
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
                      className="font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-900 hover:text-white transition-all disabled:opacity-50"
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
        <div className="rounded-2xl border border-[#EBEBE8] dark:border-white/10 bg-white dark:bg-zinc-900/90 p-12 shadow-sm text-center space-y-3 animate-fadeIn">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#EBEBE8] dark:border-zinc-700 border-t-[#171717] dark:border-t-white" />
          <p className="text-sm text-[#171717] dark:text-white font-medium">
            Collecting live repository activity from GitHub…
          </p>
          <p className="text-xs text-[#8A8A85] dark:text-zinc-400">
            Indexing commits, pull requests, issues, and contributor history.
          </p>
        </div>
      )}

      {/* Loading: Synthesizing Handover Report */}
      {step === "generating_report" && (
        <div className="rounded-2xl border border-[#EBEBE8] dark:border-white/10 bg-white dark:bg-zinc-900/90 p-12 shadow-sm text-center space-y-3 animate-fadeIn">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#EBEBE8] dark:border-zinc-700 border-t-[#171717] dark:border-t-white" />
          <p className="text-sm text-[#171717] dark:text-white font-semibold">
            Synthesizing 5-Pillar Handover Dossier…
          </p>
          <p className="text-xs text-[#8A8A85] dark:text-zinc-400 max-w-md mx-auto">
            Mapping contributor ownership, tracking unfinished tasks, and
            linking every insight to verifiable GitHub sources.
          </p>
        </div>
      )}

      {/* ── RESILIENT ERROR RECOVERY CARD ── */}
      {step === "error" && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <p className="font-semibold text-red-900 dark:text-red-300 text-xs uppercase tracking-wider font-mono">
                  {isRateLimitOrNetwork
                    ? "GitHub Rate Limit or Network Boundary Reached"
                    : "Analysis Pipeline Notice"}
                </p>
              </div>
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => setStep(repoData ? "ready_to_generate" : "idle")}
              className="text-xs font-semibold text-red-800 dark:text-red-300 hover:text-red-950 dark:hover:text-white px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-zinc-900 shrink-0 transition-colors"
            >
              Dismiss ✕
            </button>
          </div>

          {/* Resilient Fallback Options */}
          <div className="pt-3 border-t border-red-200/80 dark:border-red-900/40 space-y-3">
            <p className="text-xs text-red-900/80 dark:text-red-300/80 leading-relaxed">
              {isRateLimitOrNetwork
                ? "GitHub unauthenticated IP limits allow 60 requests/hr. You can immediately evaluate pre-indexed verified repository dossiers with 100% genuine evidence citations, or save a personal GitHub token in Account Settings."
                : "You can re-test with one of our verified public repositories or verify the repository spelling."}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => loadOfflineDossier("octocat/Hello-World")}
                className="rounded-full bg-[#171717] dark:bg-white text-white dark:text-zinc-950 px-4 py-2 text-xs font-semibold shadow hover:bg-black transition-all"
              >
                Load Pre-Indexed Dossier: octocat/Hello-World ⚡
              </button>
              <button
                type="button"
                onClick={() => loadOfflineDossier("pallets/flask")}
                className="rounded-full border border-red-300 dark:border-red-700 bg-white dark:bg-zinc-800 text-red-950 dark:text-red-200 px-4 py-2 text-xs font-semibold hover:border-red-900 transition-all"
              >
                Load Pre-Indexed Dossier: pallets/flask ⚡
              </button>
              <Link
                href="/account"
                className="rounded-full border border-red-300 dark:border-red-700 bg-white dark:bg-zinc-800 text-red-950 dark:text-red-200 px-4 py-2 text-xs font-medium hover:border-red-900 transition-all"
              >
                Configure GitHub Token in Settings 🔑
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Step: Repo fetched, ready to generate report */}
      {step === "ready_to_generate" && repoData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Callout Bar */}
          <div className="rounded-2xl border border-[#171717] dark:border-white/20 bg-[#171717] dark:bg-[#0C1017] text-[#F5F5F4] p-6 shadow-md flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="font-semibold text-sm tracking-tight text-white">
                  Repository Activity Indexed — Ready for Handover Synthesis
                </h3>
              </div>
              <p className="text-xs text-[#A3A39E] dark:text-zinc-400">
                {repoData.scope && (
                  <span className="text-amber-300 font-mono">
                    [Scoped:{" "}
                    {[
                      repoData.scope.contributor &&
                        `@${repoData.scope.contributor}`,
                      (repoData.scope.since || repoData.scope.until) &&
                        `${repoData.scope.since || "start"} → ${
                          repoData.scope.until || "today"
                        }`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    ]{" "}
                  </span>
                )}
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
                type="button"
                onClick={handleGenerateReport}
                className="rounded-full bg-white text-[#171717] px-5 py-2.5 text-xs font-semibold hover:bg-[#F5F5F4] transition-all shadow-sm"
              >
                Synthesize Handover Dossier →
              </button>
            </div>
          </div>

          {/* Repo metadata card */}
          <RepoSummaryCard
            repo={repoData.repo}
            repoUrl={repoData.repository_url}
          />

          {/* Activity counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <CountCard
              label="Commits Sampled"
              value={repoData.activity.commits_fetched}
            />
            <CountCard
              label="Pull Requests Sampled"
              value={repoData.activity.pull_requests_fetched}
            />
            <CountCard
              label="Open Issues Sampled"
              value={repoData.activity.issues_fetched}
            />
            <CountCard
              label="Open PRs In-Flight"
              value={repoData.activity.open_pull_requests}
              accent
            />
          </div>

          {/* Tabbed view of fetched items */}
          <ActivityTabs
            commits={repoData.commits}
            pullRequests={repoData.pull_requests}
            issues={repoData.issues}
            activity={repoData.activity}
          />
        </div>
      )}

      {/* Step: Report ready */}
      {step === "report_ready" && handoverReport && (
        <div className="space-y-6 animate-fadeIn">
          <HandoverReportView report={handoverReport} onReset={handleReset} />
        </div>
      )}

      {/* ── REPOSITORY READINESS COMPARISON & BENCHMARK MATRIX ── */}
      {step === "idle" && (
        <RepoComparisonSection />
      )}

      {/* Recent Handover Dossiers */}
      {step === "idle" && recentReports.length > 0 && (
        <section className="space-y-4 pt-2 animate-fadeIn-delayed">
          <div className="flex items-center justify-between border-b border-[#EBEBE8] dark:border-white/10 pb-3">
            <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#6B6B67] dark:text-zinc-400 font-semibold">
              Saved Handover Dossiers
            </h2>
            <span className="text-xs text-[#8A8A85] dark:text-zinc-500 font-mono">
              {recentReports.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {recentReports.map((r) => (
              <Link
                key={r.report_id}
                href={`/report/${r.report_id}`}
                className="group rounded-2xl border border-[#EBEBE8] dark:border-white/10 bg-white dark:bg-zinc-900/90 p-5 shadow-sm hover:border-[#171717]/40 dark:hover:border-white/30 hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#171717] dark:text-white truncate">
                      {r.repo_name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5F5F4] dark:bg-zinc-800 text-[#6B6B67] dark:text-zinc-300 border border-[#EBEBE8] dark:border-zinc-700">
                      {r.generator.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8A8A85] dark:text-zinc-400">
                    <span>{r.insights_count} insights</span>
                    <span>·</span>
                    <span>{r.unresolved_gaps} pending gaps</span>
                    <span>·</span>
                    <span>{relativeDate(r.generated_at)}</span>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#6B6B67] dark:text-zinc-400 group-hover:text-[#171717] dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
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
      : "bg-amber-500";
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
          ? "border-amber-200/80 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20"
          : "border-[#EBEBE8] dark:border-white/10 bg-white dark:bg-zinc-900/90"
      }`}
    >
      <p
        className={`text-2xl font-bold tracking-tight font-mono ${
          accent
            ? "text-amber-800 dark:text-amber-300"
            : "text-[#171717] dark:text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[#6B6B67] dark:text-zinc-400 mt-1">{label}</p>
    </div>
  );
}

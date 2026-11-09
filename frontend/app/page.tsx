"use client";

import { useEffect, useState } from "react";
import {
  checkHealth,
  analyzeRepository,
  type HealthResponse,
  type AnalyzeResponse,
} from "@/lib/api";
import RepoConnectForm from "@/components/RepoConnectForm";
import RepoSummaryCard from "@/components/RepoSummaryCard";
import ActivityTabs from "@/components/ActivityTabs";

type BackendStatus = "checking" | "ok" | "error";
type AnalysisState = "idle" | "loading" | "done" | "error";

export default function HomePage() {
  // ── Backend health ────────────────────────────────────────────
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [healthData, setHealthData]       = useState<HealthResponse | null>(null);

  useEffect(() => {
    checkHealth()
      .then((d) => { setHealthData(d); setBackendStatus("ok"); })
      .catch(() => setBackendStatus("error"));
  }, []);

  // ── Repository analysis ───────────────────────────────────────
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError]   = useState<string>("");

  async function handleAnalyze(url: string) {
    setAnalysisState("loading");
    setAnalysisResult(null);
    setAnalysisError("");
    try {
      const data = await analyzeRepository(url);
      setAnalysisResult(data);
      setAnalysisState("done");
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : String(err));
      setAnalysisState("error");
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-700">
          HandoverIQ
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Connect a GitHub repository and generate an{" "}
          <strong>evidence-linked handover report</strong> — so your successor
          knows exactly what you built, what&apos;s unfinished, and why decisions
          were made.
        </p>
      </section>

      {/* Backend status pill */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm">
          <StatusDot status={backendStatus} />
          <span className="text-gray-600">
            {backendStatus === "checking" && "Connecting to backend…"}
            {backendStatus === "ok"       && `API connected — ${healthData?.service}`}
            {backendStatus === "error"    && "Backend unreachable — start uvicorn on port 8000"}
          </span>
        </div>
      </div>

      {/* Repo input card */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Analyze a Repository</h2>
        <RepoConnectForm
          onSubmit={handleAnalyze}
          loading={analysisState === "loading"}
        />
      </section>

      {/* Loading skeleton */}
      {analysisState === "loading" && (
        <div className="rounded-xl border bg-white p-8 shadow-sm text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">
            Fetching real data from GitHub REST API…
          </p>
        </div>
      )}

      {/* Error state */}
      {analysisState === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="font-semibold text-red-700 text-sm">Analysis failed</p>
          <p className="mt-1 text-sm text-red-600">{analysisError}</p>
        </div>
      )}

      {/* Results */}
      {analysisState === "done" && analysisResult && (
        <div className="space-y-6">
          {/* Activity counts bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CountCard label="Commits"       value={analysisResult.activity.commits_fetched} />
            <CountCard label="Pull Requests" value={analysisResult.activity.pull_requests_fetched} />
            <CountCard label="Issues"        value={analysisResult.activity.issues_fetched} />
            <CountCard label="Open Issues"   value={analysisResult.activity.open_issues} accent />
          </div>

          {/* Repo metadata */}
          <RepoSummaryCard
            repo={analysisResult.repo}
            repoUrl={analysisResult.repository_url}
          />

          {/* Activity tabs */}
          <ActivityTabs
            commits={analysisResult.commits}
            pullRequests={analysisResult.pull_requests}
            issues={analysisResult.issues}
            activity={analysisResult.activity}
          />

          {/* Data provenance footer */}
          <p className="text-center text-xs text-gray-400">
            All data fetched live from{" "}
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              GitHub REST API v3
            </a>
            {" "}· source: <code>{analysisResult.source}</code>
          </p>
        </div>
      )}

      {/* Phase tracker — collapsed when results are shown */}
      {analysisState === "idle" && (
        <section className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
            Development Phases
          </h2>
          <ul className="space-y-2 text-sm">
            <PhaseRow done phase="Phase 1" label="Scaffolding — both servers running" />
            <PhaseRow done phase="Phase 2" label="GitHub data collection — real API, real data" />
            <PhaseRow      phase="Phase 3" label="Gemini AI analysis" />
            <PhaseRow      phase="Phase 4" label="Evidence-linked report viewer" />
            <PhaseRow      phase="Phase 5" label="Persistence & deployment" />
          </ul>
        </section>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function StatusDot({ status }: { status: BackendStatus }) {
  const color =
    status === "checking" ? "bg-yellow-400"
    : status === "ok"     ? "bg-green-500"
    :                       "bg-red-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color} shrink-0`} aria-hidden />;
}

function CountCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 text-center shadow-sm
      ${accent ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
      <p className={`text-2xl font-bold ${accent ? "text-amber-700" : "text-brand-700"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function PhaseRow({ phase, label, done = false }: { phase: string; label: string; done?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 text-xs font-mono px-2 py-0.5 rounded-full border
        ${done
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        {phase}
      </span>
      <span className={done ? "text-gray-700 font-medium" : "text-gray-400"}>{label}</span>
    </li>
  );
}

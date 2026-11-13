"use client";

import { FormEvent, useState } from "react";
import { fetchContributors, type AnalysisScope, type ContributorStat } from "@/lib/api";

type Props = {
  onSubmit: (url: string, scope?: AnalysisScope) => void;
  loading: boolean;
};

const QUICK_REPOS = [
  { label: "tiangolo/fastapi", value: "https://github.com/tiangolo/fastapi" },
  { label: "pallets/flask", value: "https://github.com/pallets/flask" },
  { label: "octocat/Hello-World", value: "https://github.com/octocat/Hello-World" },
];

export default function RepoConnectForm({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const [activeTab, setActiveTab] = useState<"scope" | "notes">("scope");
  const [contributor, setContributor] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [contributors, setContributors] = useState<ContributorStat[]>([]);

  const SAMPLE_SLACK_THREAD = `[#eng-handover-channel | Nov 10, 2026]
@alex.dev: "Heads up team — on the auth refactor PR #42: We switched to PBKDF2 with 100k rounds because of corporate security compliance audit RFC-88."
@ved.ops: "Where are the staging and production deployment secrets stored?"
@alex.dev: "Staging secrets are in 1Password vault 'HandoverIQ-Staging'. Production database URL is an env var in Railway dashboard. DO NOT commit .env to GitHub."
@prachi.qa: "Is there any migration script to run after pulling latest main?"
@alex.dev: "Yes, run 'alembic upgrade head' or start-all.bat. The SQLite database is now persistent under /data/handoveriq.db so reports will not get lost on container redeploy."`;

  function currentScope(): AnalysisScope {
    const sc: AnalysisScope = {};
    if (contributor.trim()) sc.contributor = contributor.trim().replace(/^@/, "");
    if (since) sc.since = since;
    if (until) sc.until = until;
    if (notes.trim()) sc.supplementary_notes = notes.trim();
    return sc;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setNotes((prev) => (prev ? prev + "\n\n" + content : content));
      }
    };
    reader.readAsText(file);
  }

  async function loadContributors() {
    const v = value.trim();
    if (!v || validate(v)) return;
    setContributors(await fetchContributors(v));
  }

  function setDatePreset(days: number | "all") {
    if (days === "all") {
      setSince("");
      setUntil("");
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setSince(start.toISOString().split("T")[0]);
    setUntil(end.toISOString().split("T")[0]);
  }

  function validate(url: string): string {
    if (!url.trim())
      return "Please enter a repository URL or owner/repo slug.";
    const githubUrl =
      /^https?:\/\/github\.com\/[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+/;
    const slug = /^[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/;
    if (!githubUrl.test(url.trim()) && !slug.test(url.trim())) {
      return "Enter a valid GitHub URL (https://github.com/owner/repo) or owner/repo slug.";
    }
    return "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate(value);
    if (err) {
      setValidationError(err);
      return;
    }
    if (since && until && since > until) {
      setValidationError("'Since' date must be on or before 'Until' date.");
      return;
    }
    setValidationError("");
    onSubmit(value.trim(), currentScope());
  }

  function handleQuickSelect(repoUrl: string) {
    if (loading) return;
    setValue(repoUrl);
    setValidationError("");
    onSubmit(repoUrl, currentScope());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── STAGE 01: REPOSITORY SOURCE ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="repo-url"
            className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] dark:bg-white text-[10px] font-bold text-white dark:text-black">
              1
            </span>
            <span>Target Repository Source</span>
          </label>
          <span className="text-[11px] font-mono text-zinc-400">
            Public Repositories · Zero Token Setup
          </span>
        </div>

        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border bg-white dark:bg-[#0C1017] p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 ${
            validationError
              ? "border-red-300 dark:border-red-500"
              : "border-black/10 dark:border-white/10"
          }`}
        >
          <div className="flex flex-1 items-center gap-3 px-3 py-1">
            <svg
              className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <input
              id="repo-url"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setValidationError("");
              }}
              placeholder="github.com/owner/repository or owner/repo (e.g. tiangolo/fastapi)"
              disabled={loading}
              className="w-full bg-transparent text-sm text-[#171717] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:text-zinc-400 font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 px-1">
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="rounded-lg bg-[#171717] dark:bg-indigo-600 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:bg-black dark:hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {validationError && (
          <p className="text-xs text-red-600 dark:text-red-400 px-1 font-mono">
            ⚠ {validationError}
          </p>
        )}

        {/* Quick presets pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] font-mono">Quick test presets:</span>
          {QUICK_REPOS.map((repo) => (
            <button
              key={repo.label}
              type="button"
              disabled={loading}
              onClick={() => handleQuickSelect(repo.value)}
              className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-black/30 dark:hover:border-white/30 transition-all disabled:opacity-50"
            >
              {repo.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STAGE 02 & 03: SYSTEMATIC SCOPE & OFF-GITHUB CONTEXT ── */}
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50/70 dark:bg-[#07090E]/60 p-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/10 pb-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("scope")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === "scope"
                ? "bg-[#171717] dark:bg-white text-white dark:text-black shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <span>2. Scoping &amp; Contributors</span>
            {(contributor || since || until) && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === "notes"
                ? "bg-[#171717] dark:bg-white text-white dark:text-black shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <span>3. Off-GitHub Context (Slack / RFCs)</span>
            {notes.trim() && (
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        </div>

        {/* Tab 1: Contributor & Date Range Scope */}
        {activeTab === "scope" && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                <span className="flex items-center justify-between">
                  <span>Author / Contributor</span>
                  {value.trim() && (
                    <button
                      type="button"
                      onClick={loadContributors}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Fetch Top Authors
                    </button>
                  )}
                </span>
                <input
                  type="text"
                  placeholder="@octocat (optional)"
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono text-[#171717] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </label>

              <label className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                <span>Since Date</span>
                <input
                  type="date"
                  value={since}
                  onChange={(e) => setSince(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </label>

              <label className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                <span>Until Date</span>
                <input
                  type="date"
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </label>
            </div>

            {/* Quick date range buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="text-[11px] font-mono">Date presets:</span>
              <button
                type="button"
                onClick={() => setDatePreset(30)}
                className="text-[11px] font-mono px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 hover:border-black/30 text-zinc-700 dark:text-zinc-300"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setDatePreset(90)}
                className="text-[11px] font-mono px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 hover:border-black/30 text-zinc-700 dark:text-zinc-300"
              >
                Last 90 Days
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("all")}
                className="text-[11px] font-mono px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 hover:border-black/30 text-zinc-700 dark:text-zinc-300"
              >
                Full Repository History
              </button>
            </div>

            {/* Top contributors chips if fetched */}
            {contributors.length > 0 && (
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Select key departing engineer:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {contributors.slice(0, 8).map((c) => (
                    <button
                      key={c.login}
                      type="button"
                      onClick={() => setContributor(c.login)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                        contributor === c.login
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                          : "border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-black/30"
                      }`}
                    >
                      @{c.login} · {Math.round(c.share * 100)}% commits
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Off-GitHub Context (Slack / Notes / RFCs) */}
        {activeTab === "notes" && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                Paste offboarding chat logs, deployment vault references, or architecture decisions.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNotes(SAMPLE_SLACK_THREAD)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                >
                  + Load Sample Slack Thread
                </button>
                <label className="cursor-pointer text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  <span>{uploadedFileName ? `✓ ${uploadedFileName}` : "Upload .txt / .md"}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste Slack handover conversation, deployment passwords / vault references, architecture decisions..."
              rows={4}
              disabled={loading}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 text-xs font-mono text-[#171717] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />

            {notes.trim() && (
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ {notes.length} characters ready to be cross-linked into Handover Dossier &amp; RAG Copilot
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNotes("");
                    setUploadedFileName("");
                  }}
                  className="text-red-500 hover:underline"
                >
                  Clear notes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

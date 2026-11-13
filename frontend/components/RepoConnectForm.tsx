"use client";

import { FormEvent, useState } from "react";
import { fetchContributors, type AnalysisScope, type ContributorStat } from "@/lib/api";

type Props = {
  onSubmit: (url: string, scope?: AnalysisScope) => void;
  loading: boolean;
};

const QUICK_REPOS = [
  { label: "tiangolo/fastapi", value: "https://github.com/tiangolo/fastapi" },
  {
    label: "octocat/Hello-World",
    value: "https://github.com/octocat/Hello-World",
  },
  { label: "pallets/flask", value: "https://github.com/pallets/flask" },
];

export default function RepoConnectForm({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showScope, setShowScope] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border bg-white dark:bg-zinc-900/90 p-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#171717]/10 dark:focus-within:ring-white/10 focus-within:border-[#171717] dark:focus-within:border-white/30 ${
            validationError ? "border-red-300 dark:border-red-500" : "border-[#E5E5E2] dark:border-white/10"
          }`}
        >
          <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
            {/* GitHub Octocat / Repo Icon */}
            <svg
              className="h-4 w-4 text-[#8A8A85] dark:text-zinc-400 shrink-0"
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
              placeholder="github.com/owner/repository or owner/repo"
              disabled={loading}
              className="w-full bg-transparent text-sm text-[#171717] dark:text-white placeholder:text-[#A3A39E] dark:placeholder:text-zinc-500 focus:outline-none disabled:text-[#A3A39E] font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="rounded-lg bg-[#171717] text-[#F5F5F4] dark:bg-white dark:text-zinc-900 px-5 py-2.5 text-xs font-semibold shadow-sm hover:bg-[#000000] dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8A8A85] border-t-white" />
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

        {validationError && (
          <p className="text-xs text-red-600 px-1">{validationError}</p>
        )}

        {/* Scope by departing contributor & date window */}
        <div className="px-1">
          <button
            type="button"
            onClick={() => {
              setShowScope(!showScope);
              if (!showScope) loadContributors();
            }}
            className="text-xs font-medium text-[#4A4A47] dark:text-zinc-300 hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            {showScope ? "▾" : "▸"} Scope by departing contributor &amp; date range
            {(contributor || since || until) && (
              <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-600/40 text-amber-800 dark:text-amber-300">
                scoped
              </span>
            )}
          </button>
          {showScope && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-xl border border-[#EBEBE8] dark:border-white/10 bg-[#FAFAF9] dark:bg-zinc-950/60 p-3">
              <label className="space-y-1 text-[11px] text-[#6B6B67] dark:text-zinc-400">
                Departing contributor (GitHub username)
                <input
                  list="contributor-options"
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  onFocus={loadContributors}
                  placeholder="e.g. octocat"
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-mono text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
                />
                <datalist id="contributor-options">
                  {contributors.map((c) => (
                    <option key={c.login} value={c.login}>
                      {c.commits} recent commits
                    </option>
                  ))}
                </datalist>
              </label>
              <label className="space-y-1 text-[11px] text-[#6B6B67] dark:text-zinc-400">
                Since
                <input
                  type="date"
                  value={since}
                  onChange={(e) => setSince(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
                />
              </label>
              <label className="space-y-1 text-[11px] text-[#6B6B67] dark:text-zinc-400">
                Until
                <input
                  type="date"
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
                />
              </label>
              {contributors.length > 0 && (
                <div className="sm:col-span-3 flex flex-wrap gap-1.5">
                  {contributors.slice(0, 6).map((c) => (
                    <button
                      key={c.login}
                      type="button"
                      onClick={() => setContributor(c.login)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                        contributor === c.login
                          ? "bg-[#171717] dark:bg-white text-white dark:text-black border-[#171717]"
                          : "border-[#E5E5E2] dark:border-white/15 bg-white dark:bg-zinc-900 text-[#4A4A47] dark:text-zinc-300 hover:border-[#171717]"
                      }`}
                    >
                      @{c.login} · {Math.round(c.share * 100)}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Multi-source off-GitHub context (Slack / Discord / Meeting Notes / Docs) */}
        <div className="px-1 pt-1 border-t border-[#F0EFEA] dark:border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs font-medium text-[#4A4A47] dark:text-zinc-300 hover:text-[#171717] dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>{showNotes ? "▾" : "▸"}</span>
              <span>Attach Off-GitHub Context (Slack threads, meeting notes, RFCs)</span>
              {notes.trim() && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-600/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {notes.trim().split("\n").length} lines attached
                </span>
              )}
            </button>

            {showNotes && (
              <button
                type="button"
                onClick={() => setNotes(SAMPLE_SLACK_THREAD)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-600/40 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
              >
                + Load Sample Slack Thread
              </button>
            )}
          </div>

          {showNotes && (
            <div className="mt-2.5 rounded-xl border border-[#EBEBE8] dark:border-white/10 bg-[#FAFAF9] dark:bg-zinc-950/60 p-3 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#6B6B67] dark:text-zinc-400">
                <p>
                  Paste chat threads, meeting transcripts, or architecture docs to cross-link with commits and PRs.
                </p>
                <label className="cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                  <span>{uploadedFileName ? `✓ ${uploadedFileName}` : "Upload .txt / .md"}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste Slack handover conversation, architecture decisions, deployment passwords/vault locations..."
                rows={4}
                disabled={loading}
                className="w-full rounded-lg border border-[#E5E5E2] dark:border-white/10 bg-white dark:bg-zinc-900 p-2.5 text-xs font-mono text-[#171717] dark:text-white placeholder:text-[#A3A39E] dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#171717]"
              />

              {notes.trim() && (
                <div className="flex items-center justify-between text-[11px] text-[#8A8A85] dark:text-zinc-400">
                  <span>{notes.length} characters ready to be indexed into RAG &amp; Handover Dossier</span>
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

      {/* Quick-try presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#8A8A85]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span>Quick presets:</span>
          {QUICK_REPOS.map((repo) => (
            <button
              key={repo.label}
              type="button"
              disabled={loading}
              onClick={() => handleQuickSelect(repo.value)}
              className="font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-[#E5E5E2] bg-[#FAFAF9] text-[#4A4A47] hover:bg-[#171717] hover:text-[#F5F5F4] hover:border-[#171717] transition-all disabled:opacity-50"
            >
              {repo.label}
            </button>
          ))}
        </div>
        <span className="hidden md:inline text-[11px] text-[#8A8A85]">
          Public repos · No token required
        </span>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (url: string) => void;
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
    setValidationError("");
    onSubmit(value.trim());
  }

  function handleQuickSelect(repoUrl: string) {
    if (loading) return;
    setValue(repoUrl);
    setValidationError("");
    onSubmit(repoUrl);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border bg-white p-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#171717]/10 focus-within:border-[#171717] ${
            validationError ? "border-red-300" : "border-[#E5E5E2]"
          }`}
        >
          <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
            {/* GitHub Octocat / Repo Icon */}
            <svg
              className="h-4 w-4 text-[#8A8A85] shrink-0"
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
              className="w-full bg-transparent text-sm text-[#171717] placeholder:text-[#A3A39E] focus:outline-none disabled:text-[#A3A39E] font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="rounded-lg bg-[#171717] px-5 py-2.5 text-xs font-semibold text-[#F5F5F4] shadow-sm hover:bg-[#000000] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
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

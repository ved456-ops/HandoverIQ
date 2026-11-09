/**
 * RepoConnectForm — the input form for submitting a GitHub repository URL.
 * Accepts a callback for submit and reports validation errors inline.
 */
"use client";

import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (url: string) => void;
  loading: boolean;
};

const PLACEHOLDER = "https://github.com/owner/repository";

export default function RepoConnectForm({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");

  function validate(url: string): string {
    if (!url.trim()) return "Please enter a repository URL.";
    // Accept full GitHub URLs or owner/repo slugs
    const githubUrl = /^https?:\/\/github\.com\/[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+/;
    const slug = /^[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/;
    if (!githubUrl.test(url) && !slug.test(url)) {
      return "Enter a valid GitHub URL (e.g. https://github.com/owner/repo) or owner/repo slug.";
    }
    return "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate(value);
    if (err) { setValidationError(err); return; }
    setValidationError("");
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700">
        GitHub Repository URL
      </label>

      <div className="flex gap-2">
        <input
          id="repo-url"
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setValidationError(""); }}
          placeholder={PLACEHOLDER}
          disabled={loading}
          className={`flex-1 rounded-lg border px-4 py-2.5 text-sm shadow-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500
            disabled:bg-gray-50 disabled:text-gray-400
            ${validationError ? "border-red-400" : "border-gray-300"}`}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold
            text-white shadow-sm hover:bg-brand-700 disabled:opacity-50
            disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing…" : "Analyze Repository"}
        </button>
      </div>

      {validationError && (
        <p className="text-xs text-red-600">{validationError}</p>
      )}

      <p className="text-xs text-gray-400">
        Works with any <strong>public</strong> GitHub repository. No token required.
      </p>
    </form>
  );
}

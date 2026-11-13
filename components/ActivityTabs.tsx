"use client";

import { useState } from "react";
import type {
  CommitItem,
  PullRequestItem,
  IssueItem,
  ActivityCounts,
} from "@/lib/api";
import { relativeDate, truncate, labelStyle } from "@/lib/utils";

type Props = {
  commits: CommitItem[];
  pullRequests: PullRequestItem[];
  issues: IssueItem[];
  activity: ActivityCounts;
};

type Tab = "commits" | "prs" | "issues";

export default function ActivityTabs({
  commits,
  pullRequests,
  issues,
  activity,
}: Props) {
  const [active, setActive] = useState<Tab>("commits");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "commits", label: "Commits", count: activity.commits_fetched },
    {
      key: "prs",
      label: "Pull Requests",
      count: activity.pull_requests_fetched,
    },
    { key: "issues", label: "Issues", count: activity.issues_fetched },
  ];

  return (
    <div className="rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-100 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-950/40">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 transition-colors ${
              active === t.key
                ? "border-b-2 border-zinc-900 dark:border-indigo-500 text-zinc-900 dark:text-white bg-white dark:bg-zinc-900"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            {t.label}
            <span
              className={`text-[11px] rounded-md px-1.5 py-0.5 font-mono ${
                active === t.key
                  ? "bg-zinc-900 dark:bg-indigo-600 text-white"
                  : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="divide-y divide-zinc-100 dark:divide-white/10">
        {active === "commits" &&
          commits.map((c) => <CommitRow key={c.sha} commit={c} />)}
        {active === "prs" &&
          pullRequests.map((p) => <PrRow key={p.number} pr={p} />)}
        {active === "issues" &&
          issues.map((i) => <IssueRow key={i.number} issue={i} />)}

        {active === "commits" && commits.length === 0 && (
          <EmptyRow label="No commits found." />
        )}
        {active === "prs" && pullRequests.length === 0 && (
          <EmptyRow label="No pull requests found." />
        )}
        {active === "issues" && issues.length === 0 && (
          <EmptyRow label="No issues found." />
        )}
      </div>
    </div>
  );
}

/* ── Row components ─────────────────────────────────────────────── */

function CommitRow({ commit }: { commit: CommitItem }) {
  const { message, author } = commit.commit;
  const shortSha = commit.sha.slice(0, 7);
  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
      {commit.author?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={commit.author.avatar_url}
          alt={author?.name ?? "author"}
          className="h-6 w-6 rounded-full shrink-0 mt-0.5"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
          {author?.name ? author.name[0].toUpperCase() : "?"}
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate leading-snug">
          {message.split("\n")[0]}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
          <span>{author?.name ?? "Unknown"}</span>
          <span>·</span>
          <span>{author?.date ? relativeDate(author.date) : ""}</span>
        </div>
      </div>

      <a
        href={commit.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
      >
        {shortSha} ↗
      </a>
    </div>
  );
}

function PrRow({ pr }: { pr: PullRequestItem }) {
  const stateStyle =
    pr.state === "open"
      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";

  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
      <span
        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${stateStyle}`}
      >
        {pr.state}
      </span>

      <div className="flex-1 min-w-0 space-y-0.5">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block leading-snug"
        >
          {pr.title}
        </a>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
          <span>#{pr.number}</span>
          <span>by {pr.user?.login ?? "ghost"}</span>
          <span>·</span>
          <span>Updated {relativeDate(pr.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: IssueItem }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
      <span
        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${
          issue.state === "open"
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
        }`}
      >
        {issue.state}
      </span>

      <div className="flex-1 min-w-0 space-y-0.5">
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block leading-snug"
        >
          {issue.title}
        </a>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono flex-wrap">
          <span>#{issue.number}</span>
          <span>by {issue.user?.login ?? "ghost"}</span>
          {issue.labels.map((l, lIdx) => (
            <span
              key={`${l.name}-${lIdx}`}
              className="text-[10px] rounded px-1 py-0.2"
              style={labelStyle(l.color)}
            >
              {l.name}
            </span>
          ))}
          <span>·</span>
          <span>Updated {relativeDate(issue.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="px-5 py-8 text-center text-xs text-zinc-400 dark:text-zinc-500 font-mono">
      {label}
    </div>
  );
}

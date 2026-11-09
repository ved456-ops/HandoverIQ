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
    <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-100 bg-zinc-50/40">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 transition-colors ${
              active === t.key
                ? "border-b-2 border-zinc-900 text-zinc-900 bg-white"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            {t.label}
            <span
              className={`text-[11px] rounded-md px-1.5 py-0.5 font-mono ${
                active === t.key
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-200/70 text-zinc-600"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="divide-y divide-zinc-100">
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
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50/70 transition-colors">
      {commit.author?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={commit.author.avatar_url}
          alt={commit.author.login}
          className="h-6 w-6 rounded-full mt-0.5 shrink-0 border border-zinc-200"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-zinc-100 border border-zinc-200 mt-0.5 shrink-0 flex items-center justify-center text-zinc-500 text-[10px] font-mono">
          {author.name[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <a
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-900 hover:text-indigo-600 font-medium transition-colors"
        >
          {truncate(message, 120)}
        </a>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400">
          <span>{commit.author?.login ?? author.name}</span>
          {author.date && <span>{relativeDate(author.date)}</span>}
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-zinc-400 hover:text-indigo-600"
          >
            {shortSha} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function PrRow({ pr }: { pr: PullRequestItem }) {
  const isMerged = !!pr.merged_at;
  const stateLabel = isMerged ? "merged" : pr.state;
  const stateColor =
    stateLabel === "merged"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : stateLabel === "open"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-zinc-100 text-zinc-600 border-zinc-200";

  return (
    <div className="px-5 py-3 hover:bg-zinc-50/70 transition-colors space-y-1">
      <div className="flex items-start gap-2 flex-wrap">
        <span
          className={`shrink-0 text-[11px] font-mono rounded-md border px-2 py-0.5 font-medium ${stateColor}`}
        >
          {stateLabel}
        </span>
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 hover:text-indigo-600 transition-colors"
        >
          {pr.title}
        </a>
        {pr.draft && (
          <span className="text-[11px] font-mono rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-500">
            Draft
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400">
        <span className="font-mono">#{pr.number}</span>
        {pr.user && <span>by {pr.user.login}</span>}
        <span>opened {relativeDate(pr.created_at)}</span>
        {isMerged && pr.merged_at && (
          <span>merged {relativeDate(pr.merged_at)}</span>
        )}

        {pr.labels.map((l) => {
          const style = labelStyle(l.color ?? "cccccc");
          return (
            <span
              key={l.name}
              className="rounded-md border px-1.5 py-0.5 text-[10px] font-mono"
              style={{
                background: style.background,
                color: style.color,
                borderColor: style.background,
              }}
            >
              {l.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: IssueItem }) {
  const stateColor =
    issue.state === "open"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-zinc-100 text-zinc-600 border-zinc-200";

  return (
    <div className="px-5 py-3 hover:bg-zinc-50/70 transition-colors space-y-1">
      <div className="flex items-start gap-2 flex-wrap">
        <span
          className={`shrink-0 text-[11px] font-mono rounded-md border px-2 py-0.5 font-medium ${stateColor}`}
        >
          {issue.state}
        </span>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 hover:text-indigo-600 transition-colors"
        >
          {issue.title}
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400">
        <span className="font-mono">#{issue.number}</span>
        {issue.user && <span>by {issue.user.login}</span>}
        <span>opened {relativeDate(issue.created_at)}</span>
        {issue.comments > 0 && (
          <span>
            {issue.comments} comment{issue.comments !== 1 ? "s" : ""}
          </span>
        )}

        {issue.labels.map((l) => {
          const style = labelStyle(l.color ?? "cccccc");
          return (
            <span
              key={l.name}
              className="rounded-md border px-1.5 py-0.5 text-[10px] font-mono"
              style={{
                background: style.background,
                color: style.color,
                borderColor: style.background,
              }}
            >
              {l.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="px-5 py-8 text-center text-xs text-zinc-400">{label}</div>
  );
}

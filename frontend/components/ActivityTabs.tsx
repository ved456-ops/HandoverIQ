/**
 * ActivityTabs — tabbed view of commits, pull requests, and issues.
 * Every row links directly to its GitHub source URL.
 */
"use client";

import { useState } from "react";
import type { CommitItem, PullRequestItem, IssueItem, ActivityCounts } from "@/lib/api";
import { relativeDate, truncate, labelStyle } from "@/lib/utils";

type Props = {
  commits: CommitItem[];
  pullRequests: PullRequestItem[];
  issues: IssueItem[];
  activity: ActivityCounts;
};

type Tab = "commits" | "prs" | "issues";

export default function ActivityTabs({ commits, pullRequests, issues, activity }: Props) {
  const [active, setActive] = useState<Tab>("commits");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "commits", label: "Commits",       count: activity.commits_fetched },
    { key: "prs",     label: "Pull Requests",  count: activity.pull_requests_fetched },
    { key: "issues",  label: "Issues",         count: activity.issues_fetched },
  ];

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-5 py-3 text-sm font-medium flex items-center gap-2 transition-colors
              ${active === t.key
                ? "border-b-2 border-brand-600 text-brand-700 bg-white"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
          >
            {t.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono
              ${active === t.key ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="divide-y">
        {active === "commits" && commits.map((c) => <CommitRow key={c.sha} commit={c} />)}
        {active === "prs"     && pullRequests.map((p) => <PrRow key={p.number} pr={p} />)}
        {active === "issues"  && issues.map((i) => <IssueRow key={i.number} issue={i} />)}

        {active === "commits" && commits.length === 0 && <EmptyRow label="No commits found." />}
        {active === "prs"     && pullRequests.length === 0 && <EmptyRow label="No pull requests found." />}
        {active === "issues"  && issues.length === 0 && <EmptyRow label="No issues found." />}
      </div>
    </div>
  );
}

/* ── Row components ─────────────────────────────────────────────── */

function CommitRow({ commit }: { commit: CommitItem }) {
  const { message, author } = commit.commit;
  const shortSha = commit.sha.slice(0, 7);
  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
      {/* Avatar */}
      {commit.author?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={commit.author.avatar_url}
          alt={commit.author.login}
          className="h-7 w-7 rounded-full mt-0.5 shrink-0"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-gray-200 mt-0.5 shrink-0 flex items-center justify-center text-gray-400 text-xs">
          {author.name[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Message */}
        <a
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-900 hover:text-brand-700 hover:underline font-medium"
        >
          {truncate(message, 120)}
        </a>
        {/* Meta */}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          <span>{commit.author?.login ?? author.name}</span>
          {author.date && <span>{relativeDate(author.date)}</span>}
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-gray-400 hover:text-brand-600 hover:underline"
          >
            {shortSha}
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
    stateLabel === "merged" ? "bg-purple-100 text-purple-700 border-purple-200"
    : stateLabel === "open"  ? "bg-green-100 text-green-700 border-green-200"
    :                           "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="px-5 py-3 hover:bg-gray-50 transition-colors space-y-1">
      <div className="flex items-start gap-2 flex-wrap">
        <span className={`shrink-0 text-xs rounded-full border px-2 py-0.5 font-medium ${stateColor}`}>
          {stateLabel}
        </span>
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 hover:text-brand-700 hover:underline"
        >
          {pr.title}
        </a>
        {pr.draft && (
          <span className="text-xs rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-gray-500">
            Draft
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
        <span>#{pr.number}</span>
        {pr.user && <span>by {pr.user.login}</span>}
        <span>opened {relativeDate(pr.created_at)}</span>
        {isMerged && pr.merged_at && <span>merged {relativeDate(pr.merged_at)}</span>}

        {/* Labels */}
        {pr.labels.map((l) => {
          const style = labelStyle(l.color ?? "cccccc");
          return (
            <span key={l.name} className="rounded-full border px-1.5 py-0.5 text-xs"
              style={{ background: style.background, color: style.color, borderColor: style.background }}>
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
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="px-5 py-3 hover:bg-gray-50 transition-colors space-y-1">
      <div className="flex items-start gap-2 flex-wrap">
        <span className={`shrink-0 text-xs rounded-full border px-2 py-0.5 font-medium ${stateColor}`}>
          {issue.state}
        </span>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 hover:text-brand-700 hover:underline"
        >
          {issue.title}
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
        <span>#{issue.number}</span>
        {issue.user && <span>by {issue.user.login}</span>}
        <span>opened {relativeDate(issue.created_at)}</span>
        {issue.comments > 0 && <span>{issue.comments} comment{issue.comments !== 1 ? "s" : ""}</span>}

        {issue.labels.map((l) => {
          const style = labelStyle(l.color ?? "cccccc");
          return (
            <span key={l.name} className="rounded-full border px-1.5 py-0.5 text-xs"
              style={{ background: style.background, color: style.color, borderColor: style.background }}>
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
    <div className="px-5 py-8 text-center text-sm text-gray-400">{label}</div>
  );
}

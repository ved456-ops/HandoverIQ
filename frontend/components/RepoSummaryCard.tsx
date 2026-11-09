import type { RepoInfo } from "@/lib/api";
import { relativeDate } from "@/lib/utils";

type Props = { repo: RepoInfo; repoUrl: string };

export default function RepoSummaryCard({ repo, repoUrl }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold tracking-tight text-zinc-900 hover:text-indigo-600 transition-colors"
            >
              {repo.full_name}
            </a>
            <span className="text-[11px] rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-500 font-mono">
              {repo.visibility}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] rounded-md border border-emerald-200 bg-emerald-50/70 px-2 py-0.5 text-emerald-700 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified GitHub API
            </span>
          </div>
          {repo.description && (
            <p className="text-sm text-zinc-500 leading-relaxed max-w-3xl">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-5 text-xs text-zinc-600 pt-1">
        {repo.language && <Stat label="Language" value={repo.language} />}
        <Stat label="Stars" value={repo.stargazers_count.toLocaleString()} />
        <Stat label="Forks" value={repo.forks_count.toLocaleString()} />
        <Stat
          label="Open issues"
          value={repo.open_issues_count.toLocaleString()}
        />
        <Stat label="Default branch" value={repo.default_branch} mono />
      </div>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.map((t) => (
            <span
              key={t}
              className="text-[11px] font-mono rounded-md bg-zinc-100/80 border border-zinc-200/60 px-2 py-0.5 text-zinc-600"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 flex flex-wrap gap-4">
        <span>Created {relativeDate(repo.created_at)}</span>
        <span>Updated {relativeDate(repo.updated_at)}</span>
        {repo.pushed_at && <span>Last push {relativeDate(repo.pushed_at)}</span>}
        <span className="ml-auto font-mono">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 transition-colors"
          >
            {repoUrl} ↗
          </a>
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-zinc-400">{label}</span>
      <span
        className={`font-semibold text-zinc-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

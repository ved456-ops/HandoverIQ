/**
 * RepoSummaryCard — displays repository metadata fetched from the GitHub API.
 * The "Live GitHub data" badge makes it explicit this is real data.
 */
import type { RepoInfo } from "@/lib/api";
import { relativeDate } from "@/lib/utils";

type Props = { repo: RepoInfo; repoUrl: string };

export default function RepoSummaryCard({ repo, repoUrl }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-brand-700 hover:underline"
            >
              {repo.full_name}
            </a>
            <span className="text-xs rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-500 font-mono">
              {repo.visibility}
            </span>
            {/* Explicit real-data badge */}
            <span className="text-xs rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-green-700 font-semibold">
              Live GitHub data
            </span>
          </div>
          {repo.description && (
            <p className="mt-1 text-sm text-gray-600">{repo.description}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
        {repo.language && (
          <Stat icon="●" label="Language" value={repo.language} />
        )}
        <Stat icon="★" label="Stars" value={repo.stargazers_count.toLocaleString()} />
        <Stat icon="⑂" label="Forks" value={repo.forks_count.toLocaleString()} />
        <Stat icon="○" label="Open issues" value={repo.open_issues_count.toLocaleString()} />
        <Stat icon="⎇" label="Default branch" value={repo.default_branch} />
      </div>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.map((t) => (
            <span
              key={t}
              className="text-xs rounded-full bg-brand-50 border border-brand-100 px-2 py-0.5 text-brand-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Timestamps */}
      <div className="text-xs text-gray-400 flex flex-wrap gap-4">
        <span>Created {relativeDate(repo.created_at)}</span>
        <span>Updated {relativeDate(repo.updated_at)}</span>
        {repo.pushed_at && <span>Last push {relativeDate(repo.pushed_at)}</span>}
        <span className="ml-auto">
          Source:{" "}
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            {repoUrl}
          </a>
        </span>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400 text-xs">{icon}</span>
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

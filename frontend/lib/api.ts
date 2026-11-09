/**
 * Typed API client for the HandoverIQ backend.
 * All fetch calls go through here so we have one place
 * to adjust base URL, auth headers, or error handling.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Health ────────────────────────────────────────────────────────

export type HealthResponse = {
  status: string;
  service: string;
};

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

// ── GitHub Analyze ────────────────────────────────────────────────

export type GitHubUser = {
  login: string;
  html_url: string;
  avatar_url: string;
};

export type RepoInfo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  topics: string[];
  visibility: string;
  owner: GitHubUser;
};

export type CommitItem = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string | null;
    };
  };
  author: GitHubUser | null;
};

export type PullRequestItem = {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  body: string | null;
  user: GitHubUser | null;
  draft: boolean;
  labels: { name: string; color: string }[];
};

export type IssueItem = {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  user: GitHubUser | null;
  labels: { name: string; color: string }[];
  comments: number;
};

export type ActivityCounts = {
  commits_fetched: number;
  pull_requests_fetched: number;
  issues_fetched: number;
  open_pull_requests: number;
  closed_pull_requests: number;
  open_issues: number;
  closed_issues: number;
};

export type AnalyzeResponse = {
  source: string;          // always "github_rest_api_v3" — never fake data
  repository_url: string;
  repo: RepoInfo;
  commits: CommitItem[];
  pull_requests: PullRequestItem[];
  issues: IssueItem[];
  activity: ActivityCounts;
};

export type ApiError = {
  detail: string;
};

/**
 * Analyze a public GitHub repository.
 * Returns real data from the GitHub REST API.
 * Throws an Error with a user-readable message on failure.
 */
export async function analyzeRepository(
  repositoryUrl: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/api/github/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repository_url: repositoryUrl }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {
      // ignore parse error — use the status-based message
    }
    throw new Error(detail);
  }

  return res.json();
}

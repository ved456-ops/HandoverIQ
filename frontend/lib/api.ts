/**
 * Typed API client for the HandoverIQ backend.
 * All fetch calls go through here so we have one place
 * to adjust base URL, auth headers, or error handling.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://handoveriq-live-api-production.up.railway.app"
    : "http://localhost:8000");

const TOKEN_STORAGE_KEY = "handoveriq_auth_token";
const USER_STORAGE_KEY = "handoveriq_auth_user";

// ── Auth Session Storage Helpers ──────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: UserProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("handoveriq-auth-change"));
}

export function updateStoredUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("handoveriq-auth-change"));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event("handoveriq-auth-change"));
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

// ── Auth & Account Types ──────────────────────────────────────────

export type UserPreferences = {
  default_ai_provider: string;
  export_format: string;
  github_token_configured: boolean;
  github_token_masked?: string | null;
  email_notifications: boolean;
  auto_save_dossiers: boolean;
};

export type BookmarkedRepo = {
  repo_url: string;
  repo_name: string;
  notes?: string;
  added_at: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  target: string;
  timestamp: string;
};

export type UserProfile = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  bio: string;
  avatar_color: string;
  avatar_url?: string;
  plan_tier: string;
  created_at: string;
  last_login_at: string;
  preferences: UserPreferences;
  bookmarked_repos: BookmarkedRepo[];
  saved_report_ids: string[];
  recent_activity: ActivityEntry[];
};

export type AuthSessionResponse = {
  token: string;
  user: UserProfile;
};

// ── GitHub Types ──────────────────────────────────────────────────

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
  scope?: { contributor?: string | null; since?: string | null; until?: string | null } | null;
  supplementary_notes?: string | null;
  source: string;          // always "github_rest_api_v3" — never fake data
  repository_url: string;
  repo: RepoInfo;
  commits: CommitItem[];
  pull_requests: PullRequestItem[];
  issues: IssueItem[];
  activity: ActivityCounts;
};

// ── Handover Report Types ─────────────────────────────────────────

export type EvidenceItem = {
  type: "commit" | "pull_request" | "issue" | "file" | "note" | string;
  identifier: string;
  title: string;
  url: string;
  snippet?: string | null;
};

export type HandoverInsight = {
  title: string;
  description: string;
  impact?: "critical" | "high" | "medium" | "low" | "info";
  evidence: EvidenceItem[];
};

export type HandoverSection = {
  title: string;
  summary: string;
  insights: HandoverInsight[];
};

export type KnowledgeGap = {
  id: string;
  category: "documentation" | "architecture" | "testing" | "operations" | "credentials" | "unclear_status";
  title: string;
  description: string;
  suggested_action: string;
  resolved: boolean;
  evidence: EvidenceItem[];
};

export type ReadinessScore = {
  overall: number;
  band: "ready" | "at_risk" | "not_ready";
  bus_factor: number;
  hygiene: number;
  clarity: number;
  gap_resolution: number;
  facts: {
    top_owner?: string | null;
    top_owner_share?: number;
    contributors?: number;
    commits_sampled?: number;
    stale_open_prs?: number;
    open_bugs?: number;
    gaps_resolved?: number;
    gaps_total?: number;
  };
};

export type AnalysisScope = {
  contributor?: string;
  since?: string;
  until?: string;
  supplementary_notes?: string;
};

export type ContributorStat = { login: string; commits: number; share: number };

export type HandoverReport = {
  scope?: AnalysisScope | null;
  readiness?: ReadinessScore | null;
  supplementary_notes?: string | null;
  report_id: string;
  repository_url: string;
  repo_name: string;
  generated_at: string;
  generator: string;
  executive_summary: string;
  ownership: HandoverSection;
  unfinished_work: HandoverSection;
  architectural_decisions: HandoverSection;
  dependencies_and_setup: HandoverSection;
  risks_and_debt: HandoverSection;
  knowledge_gaps: KnowledgeGap[];
};

export type ReportSummary = {
  report_id: string;
  repo_name: string;
  repository_url: string;
  generated_at: string;
  generator: string;
  unresolved_gaps: number;
  insights_count: number;
};

export type ApiError = {
  detail: string;
};

// ── Auth API Functions ────────────────────────────────────────────

export async function registerAccount(payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
  organization?: string;
}): Promise<AuthSessionResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Registration failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  const session: AuthSessionResponse = await res.json();
  setStoredSession(session.token, session.user);
  return session;
}

export async function loginAccount(payload: {
  email: string;
  password: string;
}): Promise<AuthSessionResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Sign in failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  const session: AuthSessionResponse = await res.json();
  setStoredSession(session.token, session.user);
  return session;
}

export async function loginDemoAccount(): Promise<AuthSessionResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/demo`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Could not start demo session.");
  }
  const session: AuthSessionResponse = await res.json();
  setStoredSession(session.token, session.user);
  return session;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { ...getAuthHeaders() },
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) clearStoredSession();
    return null;
  }
  const profile: UserProfile = await res.json();
  updateStoredUser(profile);
  return profile;
}

export async function updateAccountProfile(payload: {
  name?: string;
  role?: string;
  organization?: string;
  bio?: string;
  avatar_color?: string;
  avatar_url?: string;
  default_ai_provider?: string;
  export_format?: string;
  github_personal_token?: string;
  email_notifications?: boolean;
  auto_save_dossiers?: boolean;
}): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Profile update failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  const profile: UserProfile = await res.json();
  updateStoredUser(profile);
  return profile;
}

export async function addBookmarkedRepo(payload: {
  repo_url: string;
  repo_name: string;
  notes?: string;
}): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/auth/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to bookmark repository.");
  const profile: UserProfile = await res.json();
  updateStoredUser(profile);
  return profile;
}

export async function removeBookmarkedRepo(
  repoName: string
): Promise<UserProfile> {
  const res = await fetch(
    `${BASE_URL}/api/auth/bookmarks?repo_name=${encodeURIComponent(repoName)}`,
    {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to remove bookmark.");
  const profile: UserProfile = await res.json();
  updateStoredUser(profile);
  return profile;
}

export async function changeAccountPassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/auth/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Password update failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  const profile: UserProfile = await res.json();
  updateStoredUser(profile);
  return profile;
}

export async function logoutAccount(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    });
  } catch {
    // ignore network errors on sign out
  }
  clearStoredSession();
}

// ── Repository & Report API Functions ─────────────────────────────

export async function fetchContributors(repo: string): Promise<ContributorStat[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/github/contributors?repo=${encodeURIComponent(repo)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function analyzeRepository(
  repositoryUrl: string,
  scope: AnalysisScope = {}
): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/api/github/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ repository_url: repositoryUrl, ...scope }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {
      // fallback
    }
    throw new Error(detail);
  }

  return res.json();
}

export async function generateHandoverReport(
  repositoryUrl: string,
  scope: AnalysisScope = {}
): Promise<HandoverReport> {
  const res = await fetch(`${BASE_URL}/api/analysis/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ repository_url: repositoryUrl, ...scope }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = `Report generation failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {
      // fallback
    }
    throw new Error(detail);
  }

  return res.json();
}

export async function fetchReportById(reportId: string): Promise<HandoverReport> {
  const res = await fetch(`${BASE_URL}/api/report/${reportId}`, { cache: "no-store" });
  if (!res.ok) {
    let detail = `Failed to load report (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {
      // fallback
    }
    throw new Error(detail);
  }
  return res.json();
}

export type AskCitation = { type: string; label: string; title: string; url: string };
export type AskResponse = {
  answer: string;
  citations: AskCitation[];
  suggested_followups: string[];
  grounded: boolean;
};

export async function askHandover(
  reportId: string,
  question: string
): Promise<AskResponse> {
  const res = await fetch(`${BASE_URL}/api/report/${reportId}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ question }),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Question failed (${res.status})`;
    try {
      const err: ApiError = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function fetchAllReports(): Promise<ReportSummary[]> {
  const res = await fetch(`${BASE_URL}/api/report`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function updateGapStatus(
  reportId: string,
  gapId: string,
  resolved: boolean
): Promise<HandoverReport> {
  const res = await fetch(`${BASE_URL}/api/report/${reportId}/gap/${gapId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ resolved }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to update gap status");
  return res.json();
}

export async function addCustomGapToReport(
  reportId: string,
  gapData: { category: string; title: string; description: string; suggested_action: string }
): Promise<HandoverReport> {
  const res = await fetch(`${BASE_URL}/api/report/${reportId}/gap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(gapData),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to add custom gap");
  return res.json();
}

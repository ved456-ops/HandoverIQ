"""
Pydantic models for GitHub API data.

These mirror the shapes returned by the GitHub REST API v3 — only the
fields HandoverIQ actually uses are included. Unknown fields are ignored
so the models remain stable as the GitHub API evolves.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared ───────────────────────────────────────────────────────────────────

class GitHubUser(BaseModel):
    model_config = ConfigDict(extra="ignore")

    login: str
    html_url: str
    avatar_url: str = ""


# ── Repository ───────────────────────────────────────────────────────────────

class RepoInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    homepage: Optional[str] = None
    language: Optional[str] = None
    stargazers_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    default_branch: str = "main"
    created_at: datetime
    updated_at: datetime
    pushed_at: Optional[datetime] = None
    topics: list[str] = []
    visibility: str = "public"
    owner: GitHubUser


# ── Commits ──────────────────────────────────────────────────────────────────

class CommitAuthor(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    email: str = ""
    date: Optional[datetime] = None


class CommitDetail(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message: str
    author: CommitAuthor


class CommitItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sha: str
    html_url: str
    commit: CommitDetail
    author: Optional[GitHubUser] = None   # GitHub account; may be null


# ── Pull Requests ─────────────────────────────────────────────────────────────

class PullRequestItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    number: int
    title: str
    state: str                             # "open" | "closed"
    html_url: str
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    merged_at: Optional[datetime] = None
    body: Optional[str] = None
    user: Optional[GitHubUser] = None
    draft: bool = False
    labels: list[dict] = []


# ── Issues ────────────────────────────────────────────────────────────────────

class IssueItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    number: int
    title: str
    state: str                             # "open" | "closed"
    html_url: str
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    body: Optional[str] = None
    user: Optional[GitHubUser] = None
    labels: list[dict] = []
    comments: int = 0


# ── Aggregated response ───────────────────────────────────────────────────────

class ActivityCounts(BaseModel):
    commits_fetched: int
    pull_requests_fetched: int
    issues_fetched: int
    open_pull_requests: int
    closed_pull_requests: int
    open_issues: int
    closed_issues: int


class AnalyzeRequest(BaseModel):
    """Body accepted by POST /api/github/analyze."""
    repository_url: str
    contributor: Optional[str] = None      # GitHub username scope
    since: Optional[str] = None            # YYYY-MM-DD
    until: Optional[str] = None            # YYYY-MM-DD
    supplementary_notes: Optional[str] = None


class ContributorStat(BaseModel):
    login: str
    commits: int
    share: float


class AnalyzeResponse(BaseModel):
    """Full response from POST /api/github/analyze."""
    source: str = "github_rest_api_v3"          # always present — never fake data
    repository_url: str
    repo: RepoInfo
    commits: list[CommitItem]
    pull_requests: list[PullRequestItem]
    issues: list[IssueItem]
    activity: ActivityCounts
    scope: Optional[dict] = None
    supplementary_notes: Optional[str] = None
    # Unfiltered recent commits used for bus-factor math (never sent to clients)
    team_commits: list[CommitItem] = Field(default_factory=list, exclude=True)

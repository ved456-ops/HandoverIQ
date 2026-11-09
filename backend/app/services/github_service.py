"""
GitHub service — calls the GitHub REST API v3 on behalf of HandoverIQ.

Design rules:
- No GitHub token required for public repositories (unauthenticated rate
  limit is 60 requests/hour per IP; sufficient for a demo).
- If GITHUB_TOKEN is set in .env it is forwarded for a 5000 req/hr limit.
- Never mutates anything on GitHub — all calls are GET-only.
- Every method raises a plain Python exception with a human-readable message;
  the router translates those into appropriate HTTP status codes.
"""
from __future__ import annotations

import re
from typing import Optional

import httpx

from app.core.config import settings
from app.models.github_models import (
    AnalyzeResponse,
    ActivityCounts,
    CommitItem,
    IssueItem,
    PullRequestItem,
    RepoInfo,
)

# ── Constants ─────────────────────────────────────────────────────────────────

GITHUB_API_BASE = "https://api.github.com"
# How many items to fetch per category (keeps responses snappy)
MAX_COMMITS = 30
MAX_PRS = 30
MAX_ISSUES = 30

# Regex that accepts both full URLs and "owner/repo" slugs
_REPO_URL_RE = re.compile(
    r"(?:https?://github\.com/)?([A-Za-z0-9_.\-]+)/([A-Za-z0-9_.\-]+?)(?:\.git|/.*)?$"
)


# ── Helper ────────────────────────────────────────────────────────────────────

def _parse_repo_url(raw: str) -> tuple[str, str]:
    """
    Parse 'https://github.com/owner/repo' or 'owner/repo' into (owner, repo).
    Raises ValueError for anything that doesn't look like a GitHub repo.
    """
    cleaned = raw.strip().rstrip("/")
    m = _REPO_URL_RE.match(cleaned)
    if not m:
        raise ValueError(
            f"Cannot parse repository URL: '{raw}'. "
            "Expected 'https://github.com/owner/repo' or 'owner/repo'."
        )
    return m.group(1), m.group(2)


def _build_client() -> httpx.AsyncClient:
    """Create an httpx client with appropriate GitHub headers."""
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "HandoverIQ/0.1",
    }
    # Attach token only if one is configured — not mandatory for public repos
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return httpx.AsyncClient(
        base_url=GITHUB_API_BASE,
        headers=headers,
        timeout=20.0,
        follow_redirects=True,
    )


def _check_response(response: httpx.Response, context: str) -> None:
    """Translate GitHub HTTP errors into informative exceptions."""
    if response.status_code == 200:
        return
    if response.status_code == 404:
        raise LookupError(
            f"Repository not found on GitHub ({context}). "
            "Check the owner/repo name and ensure it is public."
        )
    if response.status_code == 403:
        body = response.json()
        msg = body.get("message", "")
        if "rate limit" in msg.lower():
            raise PermissionError(
                "GitHub API rate limit exceeded. "
                "Set GITHUB_TOKEN in backend/.env to increase the limit."
            )
        raise PermissionError(f"GitHub API returned 403 Forbidden ({context}): {msg}")
    if response.status_code == 401:
        raise PermissionError(
            "GitHub API returned 401 Unauthorized. "
            "If GITHUB_TOKEN is set, it may be invalid or expired."
        )
    raise RuntimeError(
        f"GitHub API error {response.status_code} ({context}): {response.text[:200]}"
    )


# ── Main service function ─────────────────────────────────────────────────────

async def analyze_repository(repository_url: str) -> AnalyzeResponse:
    """
    Fetch repository metadata, recent commits, pull requests, and issues
    from the GitHub REST API.

    Returns an AnalyzeResponse populated entirely from real API data.
    Raises ValueError, LookupError, PermissionError, or RuntimeError
    with human-readable messages that the router forwards to the client.
    """
    owner, repo = _parse_repo_url(repository_url)

    async with _build_client() as client:
        # 1. Repository metadata
        repo_resp = await client.get(f"/repos/{owner}/{repo}")
        _check_response(repo_resp, "repo metadata")
        repo_info = RepoInfo.model_validate(repo_resp.json())

        # 2. Recent commits (default branch, most recent first)
        commits_resp = await client.get(
            f"/repos/{owner}/{repo}/commits",
            params={"per_page": MAX_COMMITS, "page": 1},
        )
        _check_response(commits_resp, "commits")
        commits = [CommitItem.model_validate(c) for c in commits_resp.json()]

        # 3. Pull requests — fetch both open and closed
        prs: list[PullRequestItem] = []
        pr_resp = await client.get(
            f"/repos/{owner}/{repo}/pulls",
            params={"state": "all", "per_page": MAX_PRS, "sort": "updated", "direction": "desc"},
        )
        _check_response(pr_resp, "pull requests")
        prs = [PullRequestItem.model_validate(p) for p in pr_resp.json()]

        # 4. Issues — GitHub PRs also appear in /issues, so filter them out
        #    by checking for the absence of a "pull_request" key.
        issues: list[IssueItem] = []
        issues_resp = await client.get(
            f"/repos/{owner}/{repo}/issues",
            params={"state": "all", "per_page": MAX_ISSUES, "sort": "updated", "direction": "desc"},
        )
        _check_response(issues_resp, "issues")
        # Filter out pull requests that GitHub surfaces in /issues
        raw_issues = [i for i in issues_resp.json() if "pull_request" not in i]
        issues = [IssueItem.model_validate(i) for i in raw_issues]

    # ── Activity counts ───────────────────────────────────────────────────────
    activity = ActivityCounts(
        commits_fetched=len(commits),
        pull_requests_fetched=len(prs),
        issues_fetched=len(issues),
        open_pull_requests=sum(1 for p in prs if p.state == "open"),
        closed_pull_requests=sum(1 for p in prs if p.state in ("closed", "merged")),
        open_issues=sum(1 for i in issues if i.state == "open"),
        closed_issues=sum(1 for i in issues if i.state == "closed"),
    )

    return AnalyzeResponse(
        repository_url=f"https://github.com/{owner}/{repo}",
        repo=repo_info,
        commits=commits,
        pull_requests=prs,
        issues=issues,
        activity=activity,
    )

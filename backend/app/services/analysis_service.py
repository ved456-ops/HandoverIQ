"""
HandoverIQ AI Analysis Service.

Transforms raw GitHub activity into an evidence-linked handover intelligence report.
Supports Google Gemini, Anthropic Claude, and an evidence-based deterministic fallback.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings
from app.models.github_models import AnalyzeResponse, CommitItem, IssueItem, PullRequestItem
from app.models.report_models import (
    EvidenceItem,
    HandoverInsight,
    HandoverReport,
    HandoverSection,
    KnowledgeGap,
)

SYSTEM_PROMPT = """You are HandoverIQ's Senior Knowledge Handover Engineer.
Your mission is to examine actual repository activity (commits, PRs, issues) and generate an authoritative Handover Intelligence Report for an incoming successor engineer.

CRITICAL RULES:
1. NEVER FABRICATE OR INVENT INFORMATION.
2. Every insight MUST cite at least one real evidence item from the provided data with its exact type, identifier (SHA or #number), title, and direct GitHub URL.
3. Organize your analysis into 5 core pillars:
   - Ownership & Core Areas (who built what, domain experts)
   - Unfinished Work & In-Flight Features (open PRs, WIP branches, active issues)
   - Architectural Decisions & Context (why decisions were made, based on commit messages/PRs)
   - Dependencies & Tech Stack Setup (languages, libraries, tools touched)
   - Risks, Tech Debt & Blockers (bug clusters, stale items, complex changes)
4. Identify Knowledge Gaps: concrete blindspots the incoming engineer must clarify with the departing team before handover completes.
5. Return ONLY a single valid JSON object adhering strictly to the requested schema.
"""


def _prepare_context(data: AnalyzeResponse) -> dict[str, Any]:
    """Serialize GitHub data into a compact context for the LLM."""
    return {
        "repository": {
            "name": data.repo.full_name,
            "description": data.repo.description,
            "language": data.repo.language,
            "stars": data.repo.stargazers_count,
            "topics": data.repo.topics,
            "html_url": data.repo.html_url,
            "default_branch": data.repo.default_branch,
        },
        "recent_commits": [
            {
                "sha": c.sha[:7],
                "message": c.commit.message.split("\n")[0],
                "author": c.author.login if c.author else c.commit.author.name,
                "date": c.commit.author.date.isoformat() if c.commit.author.date else None,
                "url": c.html_url,
            }
            for c in data.commits[:25]
        ],
        "pull_requests": [
            {
                "number": p.number,
                "title": p.title,
                "state": p.state,
                "author": p.user.login if p.user else "unknown",
                "labels": [l["name"] for l in p.labels if isinstance(l, dict) and "name" in l],
                "url": p.html_url,
                "is_draft": p.draft,
            }
            for p in data.pull_requests[:20]
        ],
        "supplementary_team_notes": data.supplementary_notes,
        "issues": [
            {
                "number": i.number,
                "title": i.title,
                "state": i.state,
                "author": i.user.login if i.user else "unknown",
                "labels": [l["name"] for l in i.labels if isinstance(l, dict) and "name" in l],
                "comments": i.comments,
                "url": i.html_url,
            }
            for i in data.issues[:20]
        ],
    }


# ── Gemini Provider ──────────────────────────────────────────────────────────

async def _call_gemini(context: dict[str, Any], api_key: str) -> dict[str, Any]:
    """Call Google Gemini API using structured JSON output."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    prompt = f"""{SYSTEM_PROMPT}

Here is the real GitHub activity data for {context['repository']['name']}:
{json.dumps(context, indent=2)}

Produce a structured JSON response matching this schema:
{{
  "executive_summary": "...",
  "ownership": {{
    "title": "Ownership & Core Modules",
    "summary": "...",
    "insights": [
      {{
        "title": "...",
        "description": "...",
        "impact": "info",
        "evidence": [{{ "type": "commit", "identifier": "...", "title": "...", "url": "..." }}]
      }}
    ]
  }},
  "unfinished_work": {{
    "title": "Unfinished Work & In-Flight Tasks",
    "summary": "...",
    "insights": [...]
  }},
  "architectural_decisions": {{
    "title": "Architectural Decisions & Context",
    "summary": "...",
    "insights": [...]
  }},
  "dependencies_and_setup": {{
    "title": "Dependencies & Setup Context",
    "summary": "...",
    "insights": [...]
  }},
  "risks_and_debt": {{
    "title": "Risks, Tech Debt & Blockers",
    "summary": "...",
    "insights": [...]
  }},
  "knowledge_gaps": [
    {{
      "id": "gap-1",
      "category": "documentation",
      "title": "...",
      "description": "...",
      "suggested_action": "...",
      "evidence": [...]
    }}
  ]
}}
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
        },
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw_text)


# ── Claude Provider ──────────────────────────────────────────────────────────

async def _call_claude(context: dict[str, Any], api_key: str) -> dict[str, Any]:
    """Call Anthropic Claude API."""
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    
    prompt = f"""Here is the real GitHub activity data for {context['repository']['name']}:
{json.dumps(context, indent=2)}

Generate the Handover Intelligence Report as a single raw JSON object."""

    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 4096,
        "temperature": 0.2,
        "system": SYSTEM_PROMPT + "\nRespond ONLY with valid JSON.",
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Anthropic API returned {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        raw_text = data["content"][0]["text"]
        
        # Clean potential markdown backticks
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            raw_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        return json.loads(raw_text)


# ── Deterministic Evidence-Based Synthesizer (Fallback) ──────────────────────

def _synthesize_deterministic(data: AnalyzeResponse) -> dict[str, Any]:
    """
    Deterministic synthesis engine.
    Constructs real evidence-backed handover insights directly from the
    collected GitHub data when no external LLM API key is configured.
    """
    # 1. Ownership analysis: compute commit frequencies per author
    author_counts: dict[str, list[CommitItem]] = {}
    for c in data.commits:
        author_name = c.author.login if c.author else c.commit.author.name
        author_counts.setdefault(author_name, []).append(c)

    ownership_insights: list[dict[str, Any]] = []
    sorted_authors = sorted(author_counts.items(), key=lambda x: len(x[1]), reverse=True)
    
    for author, commits in sorted_authors[:3]:
        sample = commits[:3]
        evidence = [
            {
                "type": "commit",
                "identifier": c.sha[:7],
                "title": c.commit.message.split("\n")[0],
                "url": c.html_url,
            }
            for c in sample
        ]
        ownership_insights.append({
            "title": f"Primary Contributor: {author}",
            "description": f"{author} authored {len(commits)} of the last {len(data.commits)} commits analyzed, indicating deep code ownership.",
            "impact": "info",
            "evidence": evidence,
        })

    # 2. Unfinished work: open PRs and issues
    open_prs = [p for p in data.pull_requests if p.state == "open"]
    open_issues = [i for i in data.issues if i.state == "open"]
    
    unfinished_insights: list[dict[str, Any]] = []
    if open_prs:
        for pr in open_prs[:3]:
            unfinished_insights.append({
                "title": f"Open Pull Request #{pr.number}: {pr.title}",
                "description": f"In-progress pull request by {pr.user.login if pr.user else 'unknown'}. Review or merge status is required during transition.",
                "impact": "high" if not pr.draft else "medium",
                "evidence": [{
                    "type": "pull_request",
                    "identifier": f"#{pr.number}",
                    "title": pr.title,
                    "url": pr.html_url,
                }],
            })
    if open_issues:
        for issue in open_issues[:3]:
            unfinished_insights.append({
                "title": f"Active Issue #{issue.number}: {issue.title}",
                "description": f"Open issue with {issue.comments} comments. Review to determine if this blocks incoming handover deliverables.",
                "impact": "medium",
                "evidence": [{
                    "type": "issue",
                    "identifier": f"#{issue.number}",
                    "title": issue.title,
                    "url": issue.html_url,
                }],
            })

    # 3. Architectural decisions (extracted from feat/refactor/docs commits)
    arch_insights: list[dict[str, Any]] = []

    # Extra off-GitHub context (Slack threads, meeting notes, RFCs)
    if data.supplementary_notes and data.supplementary_notes.strip():
        notes_lines = [ln.strip("-* 	") for ln in data.supplementary_notes.strip().splitlines() if ln.strip()]
        snippet = " ".join(notes_lines[:4])[:280]
        arch_insights.append({
            "title": "Cross-Linked Off-GitHub Context (Slack / Docs / Notes)",
            "description": f"Departing team attached supplementary context: {snippet}",
            "impact": "high",
            "evidence": [{
                "type": "note",
                "identifier": "Notes #1",
                "title": "Slack / Meeting Notes Attachment",
                "url": "#supplementary-context",
                "snippet": snippet[:100],
            }],
        })


    for c in data.commits:
        msg = c.commit.message.split("\n")[0]
        lower_msg = msg.lower()
        if any(kw in lower_msg for kw in ["feat", "refactor", "arch", "design", "migrate", "upgrade", "support"]):
            arch_insights.append({
                "title": f"Decision Context: {msg[:60]}",
                "description": f"Significant code modification recorded in commit history: '{msg}'.",
                "impact": "info",
                "evidence": [{
                    "type": "commit",
                    "identifier": c.sha[:7],
                    "title": msg,
                    "url": c.html_url,
                }],
            })
            if len(arch_insights) >= 3:
                break

    if not arch_insights and data.commits:
        first = data.commits[0]
        arch_insights.append({
            "title": f"Recent Development: {first.commit.message.split(chr(10))[0][:60]}",
            "description": "Baseline commit establishing current operational state.",
            "impact": "info",
            "evidence": [{
                "type": "commit",
                "identifier": first.sha[:7],
                "title": first.commit.message.split("\n")[0],
                "url": first.html_url,
            }],
        })

    # 4. Dependencies & Setup
    dep_insights: list[dict[str, Any]] = []
    dep_insights.append({
        "title": f"Primary Ecosystem: {data.repo.language or 'Multi-language'}",
        "description": f"Repository primary stack is {data.repo.language or 'custom'}. Default development branch is '{data.repo.default_branch}'.",
        "impact": "info",
        "evidence": [{
            "type": "file",
            "identifier": "repo-spec",
            "title": f"{data.repo.full_name} metadata",
            "url": data.repo.html_url,
        }],
    })

    # 5. Risks & Tech Debt
    risk_insights: list[dict[str, Any]] = []
    bug_issues = [i for i in data.issues if any("bug" in str(l).lower() for l in i.labels)]
    if bug_issues:
        for b in bug_issues[:2]:
            risk_insights.append({
                "title": f"Reported Defect #{b.number}: {b.title}",
                "description": "Active defect tagged by repository maintainers requiring attention.",
                "impact": "high",
                "evidence": [{
                    "type": "issue",
                    "identifier": f"#{b.number}",
                    "title": b.title,
                    "url": b.html_url,
                }],
            })
    
    if len(sorted_authors) == 1:
        risk_insights.append({
            "title": "Single Point of Failure (Knowledge Silo)",
            "description": f"All recent activity is dominated by a single contributor ({sorted_authors[0][0]}). High offboarding risk.",
            "impact": "critical",
            "evidence": [{
                "type": "commit",
                "identifier": data.commits[0].sha[:7],
                "title": f"Activity by {sorted_authors[0][0]}",
                "url": data.commits[0].html_url,
            }],
        })

    # 6. Knowledge Gaps
    gaps: list[dict[str, Any]] = [
        {
            "id": f"gap-{uuid.uuid4().hex[:6]}",
            "category": "operations",
            "title": "Deployment Pipeline & Credential Access Verification",
            "description": "Verify environment variables, deployment secrets, and production release access before developer departure.",
            "suggested_action": "Schedule a 30-minute credentials and release pipeline handover session.",
            "evidence": [],
        },
        {
            "id": f"gap-{uuid.uuid4().hex[:6]}",
            "category": "architecture",
            "title": "Unwritten Architectural Tradeoffs",
            "description": "Check if undocumented assumptions exist behind recent pull requests and commits.",
            "suggested_action": "Request departing maintainer to annotate key PRs or document top 3 architectural caveats.",
            "evidence": [],
        },
    ]

    return {
        "executive_summary": (
            f"Handover report for {data.repo.full_name} ({data.repo.language or 'General'}). "
            f"Analyzed {len(data.commits)} recent commits across {len(sorted_authors)} contributors, "
            f"{len(data.pull_requests)} pull requests, and {len(data.issues)} issues."
        ),
        "ownership": {
            "title": "Ownership & Core Modules",
            "summary": f"Key code ownership is concentrated across {len(sorted_authors)} active contributors.",
            "insights": ownership_insights,
        },
        "unfinished_work": {
            "title": "Unfinished Work & In-Flight Tasks",
            "summary": f"Identified {len(open_prs)} open pull requests and {len(open_issues)} open issues requiring resolution or status check.",
            "insights": unfinished_insights,
        },
        "architectural_decisions": {
            "title": "Architectural Decisions & Context",
            "summary": "Recent major architectural modifications and functional enhancements extracted from commit history.",
            "insights": arch_insights,
        },
        "dependencies_and_setup": {
            "title": "Dependencies & Setup Context",
            "summary": f"Core technologies configured around {data.repo.language or 'multi-language'} environment.",
            "insights": dep_insights,
        },
        "risks_and_debt": {
            "title": "Risks, Tech Debt & Blockers",
            "summary": "Identified potential handover risks, single points of failure, and active bug reports.",
            "insights": risk_insights,
        },
        "knowledge_gaps": gaps,
    }


# ── Readiness / Bus-Factor sub-scores ────────────────────────────────────────

def compute_readiness_inputs(data: AnalyzeResponse) -> dict[str, Any]:
    """Static sub-scores (0-100) derived from real repository activity."""
    now = datetime.now(timezone.utc)
    commits = data.team_commits or data.commits

    # Bus factor: how concentrated is authorship across recent commits?
    counts: dict[str, int] = {}
    for c in commits:
        name = c.author.login if c.author else c.commit.author.name
        counts[name] = counts.get(name, 0) + 1
    total = sum(counts.values())
    if total:
        top_owner, top_n = max(counts.items(), key=lambda x: x[1])
        share = top_n / total
        bus = round(max(0.0, min(100.0, (1 - share) * 100 / 0.6)))
    else:
        top_owner, share, bus = None, 0.0, 50

    # Hygiene: stale open PRs and open bugs
    stale = 0
    for p in data.pull_requests:
        if p.state == "open":
            upd = p.updated_at if p.updated_at.tzinfo else p.updated_at.replace(tzinfo=timezone.utc)
            if (now - upd).days > 30:
                stale += 1
    open_bugs = sum(
        1 for i in data.issues
        if i.state == "open" and any("bug" in str(l).lower() for l in i.labels)
    )
    hygiene = max(0, 100 - min(60, stale * 15) - min(40, open_bugs * 8))

    # Clarity: descriptive commit messages + PRs with a description
    descriptive = sum(1 for c in data.commits if len(c.commit.message.split("\n")[0].strip()) >= 20)
    commit_ratio = descriptive / len(data.commits) if data.commits else 0.5
    if data.pull_requests:
        pr_ratio = sum(1 for p in data.pull_requests if (p.body or "").strip()) / len(data.pull_requests)
        clarity = round(100 * (0.5 * commit_ratio + 0.5 * pr_ratio))
    else:
        clarity = round(100 * commit_ratio)

    return {
        "bus_factor": bus,
        "hygiene": hygiene,
        "clarity": clarity,
        "facts": {
            "top_owner": top_owner,
            "top_owner_share": round(share, 3),
            "contributors": len(counts),
            "commits_sampled": total,
            "stale_open_prs": stale,
            "open_bugs": open_bugs,
        },
    }


# ── Main Entrypoint ──────────────────────────────────────────────────────────

async def generate_handover_report(data: AnalyzeResponse) -> HandoverReport:
    """
    Generate an evidence-linked HandoverReport from GitHub activity.
    Selects Gemini, Claude, or the deterministic evidence synthesizer based on settings.
    """
    context = _prepare_context(data)
    generator_name = "evidence-synthesizer"
    raw_report: dict[str, Any]

    # Decide provider
    use_claude = (
        (settings.ai_provider == "claude" and settings.anthropic_api_key)
        or (settings.ai_provider == "auto" and settings.anthropic_api_key and not settings.gemini_api_key)
    )
    use_gemini = (
        (settings.ai_provider == "gemini" and settings.gemini_api_key)
        or (settings.ai_provider == "auto" and settings.gemini_api_key)
    )

    if use_claude:
        try:
            raw_report = await _call_claude(context, settings.anthropic_api_key)
            generator_name = "claude-3.5-sonnet"
        except Exception as exc:
            # Fall back to deterministic on provider error so the user isn't blocked
            raw_report = _synthesize_deterministic(data)
            generator_name = f"evidence-synthesizer (fallback from claude: {exc})"
    elif use_gemini:
        try:
            raw_report = await _call_gemini(context, settings.gemini_api_key)
            generator_name = "gemini-2.0-flash"
        except Exception as exc:
            raw_report = _synthesize_deterministic(data)
            generator_name = f"evidence-synthesizer (fallback from gemini: {exc})"
    else:
        raw_report = _synthesize_deterministic(data)
        generator_name = "evidence-synthesizer (deterministic engine)"

    # Assemble validated HandoverReport
    exec_summary = raw_report.get("executive_summary", "Handover intelligence report.")
    if data.scope:
        parts = []
        if data.scope.get("contributor"):
            parts.append(f"contributor @{data.scope['contributor']}")
        if data.scope.get("since") or data.scope.get("until"):
            parts.append(f"window {data.scope.get('since') or 'start'} to {data.scope.get('until') or 'today'}")
        exec_summary = f"[Scoped handover: {', '.join(parts)}] " + exec_summary

    return HandoverReport(
        report_id=str(uuid.uuid4()),
        scope=data.scope,
        readiness_inputs=compute_readiness_inputs(data),
        repository_url=data.repository_url,
        repo_name=data.repo.full_name,
        generated_at=datetime.now(timezone.utc),
        generator=generator_name,
        executive_summary=exec_summary,
        supplementary_notes=data.supplementary_notes,
        ownership=HandoverSection.model_validate(raw_report.get("ownership", {"title": "Ownership", "summary": "", "insights": []})),
        unfinished_work=HandoverSection.model_validate(raw_report.get("unfinished_work", {"title": "Unfinished Work", "summary": "", "insights": []})),
        architectural_decisions=HandoverSection.model_validate(raw_report.get("architectural_decisions", {"title": "Architectural Decisions", "summary": "", "insights": []})),
        dependencies_and_setup=HandoverSection.model_validate(raw_report.get("dependencies_and_setup", {"title": "Dependencies & Setup", "summary": "", "insights": []})),
        risks_and_debt=HandoverSection.model_validate(raw_report.get("risks_and_debt", {"title": "Risks & Debt", "summary": "", "insights": []})),
        knowledge_gaps=[KnowledgeGap.model_validate(g) for g in raw_report.get("knowledge_gaps", [])],
    )

"""
"Ask the Handover" — evidence-grounded Q&A over a generated HandoverReport.

Retrieval-only (no hallucination): the report is split into chunks (insights,
knowledge gaps, section summaries). Chunks are ranked against the question with
TF-IDF-style token scoring, and the answer is composed ONLY from the top chunks,
each cited with its GitHub evidence links.
"""
from __future__ import annotations

import math
import re
from collections import Counter

from pydantic import BaseModel, Field

from app.models.report_models import EvidenceItem, HandoverReport

STOP = set(
    "a an the is are was were be been of to in on for and or with what which who why how when "
    "where does do did this that these those it its about from by as at any there their we our "
    "can could should would me tell show give please".split()
)

SYNONYMS = {
    "risk": ["risk", "debt", "critical", "fragile", "danger", "blocker"],
    "risks": ["risk", "debt", "critical", "fragile"],
    "owner": ["owner", "ownership", "maintainer", "author", "contributor", "bus"],
    "owns": ["owner", "ownership", "maintainer", "author"],
    "unfinished": ["unfinished", "open", "pending", "wip", "unmerged", "draft"],
    "unmerged": ["unfinished", "open", "pending", "pull_request", "pr"],
    "pr": ["pull_request", "pr", "pull"],
    "prs": ["pull_request", "pr", "pull"],
    "architecture": ["architecture", "architectural", "design", "refactor", "decision"],
    "setup": ["setup", "dependencies", "install", "dependency", "config"],
    "gap": ["gap", "missing", "unknown", "unclear", "unresolved"],
    "gaps": ["gap", "missing", "unknown", "unclear", "unresolved"],
    "missing": ["gap", "missing", "unclear", "unresolved"],
}


class AskRequest(BaseModel):
    question: str
    history: list[dict] = Field(default_factory=list)


class Citation(BaseModel):
    type: str
    label: str
    title: str
    url: str


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    suggested_followups: list[str] = Field(default_factory=list)
    grounded: bool = True


class _Chunk(BaseModel):
    kind: str
    section: str
    title: str
    text: str
    evidence: list[EvidenceItem] = Field(default_factory=list)


def _tokens(text: str) -> list[str]:
    out: list[str] = []
    for t in re.findall(r"[a-z0-9_#]+", text.lower()):
        if t in STOP or len(t) < 2:
            continue
        out.append(t)
        out.extend(SYNONYMS.get(t, []))
    return out


def _build_chunks(r: HandoverReport) -> list[_Chunk]:
    chunks = [
        _Chunk(kind="summary", section="Executive Summary", title="Executive Summary", text=r.executive_summary)
    ]
    for name, sec in [
        ("Ownership", r.ownership),
        ("Unfinished Work", r.unfinished_work),
        ("Architectural Decisions", r.architectural_decisions),
        ("Dependencies & Setup", r.dependencies_and_setup),
        ("Risks & Debt", r.risks_and_debt),
    ]:
        if sec.summary:
            chunks.append(_Chunk(kind="summary", section=name, title=sec.title, text=sec.summary))
        for ins in sec.insights:
            chunks.append(
                _Chunk(
                    kind="insight",
                    section=name,
                    title=ins.title,
                    text=f"{ins.title}. {ins.description}",
                    evidence=ins.evidence,
                )
            )
    if r.supplementary_notes and r.supplementary_notes.strip():
        chunks.append(
            _Chunk(
                kind="notes",
                section="Supplementary Team Notes & Slack",
                title="Cross-Linked Off-GitHub Notes",
                text=r.supplementary_notes.strip(),
                evidence=[EvidenceItem(type="note", identifier="Note #1", title="Slack & Meeting Notes", url="#supplementary-context")],
            )
        )
    for g in r.knowledge_gaps:
        status = "resolved" if g.resolved else "unresolved"
        chunks.append(
            _Chunk(
                kind="gap",
                section="Knowledge Gaps",
                title=g.title,
                text=f"{g.title}. {g.description} Suggested action: {g.suggested_action}. ({g.category}, {status})",
                evidence=g.evidence,
            )
        )
    return chunks


def _rank(question: str, chunks: list[_Chunk]) -> list[tuple[float, _Chunk]]:
    q = Counter(_tokens(question))
    if not q:
        return []
    docs = [Counter(_tokens(c.text + " " + c.section)) for c in chunks]
    n = len(docs)
    df: Counter = Counter()
    for d in docs:
        df.update(d.keys())
    scored = []
    for c, d in zip(chunks, docs):
        s = 0.0
        for term, qw in q.items():
            if term in d:
                idf = math.log(1 + n / (1 + df[term]))
                s += qw * idf * (1 + math.log(d[term]))
        if s > 0:
            scored.append((s, c))
    scored.sort(key=lambda x: -x[0])
    return scored


def _followups(r: HandoverReport) -> list[str]:
    f = ["What are the biggest unresolved risks?", "Which work is still unfinished?"]
    if r.supplementary_notes:
        f.insert(1, "What was captured in the Slack/team notes?")
    unresolved = [g for g in r.knowledge_gaps if not g.resolved]
    if unresolved:
        f.append(f"What do we know about: {unresolved[0].title}?")
    f.append("Who owns the core modules?")
    return f[:4]


def answer_question(report: HandoverReport, question: str) -> AskResponse:
    question = question.strip()
    chunks = _build_chunks(report)
    ql = question.lower()

    # Intent: unresolved gaps list
    if re.search(r"(unresolved|open|remaining|outstanding).*(gap|question|item)|gaps?\b.*(left|open)", ql):
        gaps = [g for g in report.knowledge_gaps if not g.resolved]
        if not gaps:
            return AskResponse(
                answer="All knowledge gaps in this handover are marked resolved.",
                suggested_followups=_followups(report),
            )
        lines = [f"- **{g.title}** ({g.category}): {g.suggested_action}" for g in gaps]
        cites = _cites([e for g in gaps for e in g.evidence])
        return AskResponse(
            answer=f"There are **{len(gaps)} unresolved knowledge gaps**:\n" + "\n".join(lines),
            citations=cites,
            suggested_followups=_followups(report),
        )

    ranked = _rank(question, chunks)
    if not ranked or ranked[0][0] < 0.5:
        return AskResponse(
            answer=(
                "I couldn't find evidence for that in this repository's indexed commits, pull requests and "
                "issues, so I won't guess. Try asking about ownership, unfinished work, architecture, "
                "setup, risks or knowledge gaps."
            ),
            grounded=False,
            suggested_followups=_followups(report),
        )

    top = [c for _, c in ranked[:3]]
    parts: list[str] = []
    ev: list[EvidenceItem] = []
    for c in top:
        if c.kind == "summary":
            parts.append(f"**{c.section}** — {c.text}")
        else:
            parts.append(f"**{c.title}** _({c.section})_ — {c.text.split('. ', 1)[1] if '. ' in c.text else c.text}")
        ev.extend(c.evidence)
    answer = "Based on the indexed repository evidence:\n\n" + "\n\n".join(f"{i+1}. {p}" for i, p in enumerate(parts))
    if not ev:
        answer += "\n\n_No direct commit/PR links are attached to these passages._"
    return AskResponse(answer=answer, citations=_cites(ev), suggested_followups=_followups(report))


def _cites(items: list[EvidenceItem]) -> list[Citation]:
    seen: set[str] = set()
    out: list[Citation] = []
    for e in items:
        if e.url in seen:
            continue
        seen.add(e.url)
        label = {"commit": "Commit", "pull_request": "PR", "issue": "Issue", "file": "File", "note": "Note"}.get(e.type, e.type.capitalize())
        out.append(Citation(type=e.type, label=f"{label} {e.identifier}", title=e.title, url=e.url))
        if len(out) >= 8:
            break
    return out

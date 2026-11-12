"""
Pydantic data models for HandoverIQ Intelligence Reports.

Every single insight in a report MUST be backed by one or more EvidenceItem
linking back to actual GitHub commits, pull requests, issues, or files.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field


class EvidenceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: str
    identifier: str                        # e.g., "7a8b9c0" or "#42"
    title: str                             # commit message or PR/issue title
    url: str                               # Direct clickable link on GitHub
    snippet: Optional[str] = None          # Contextual quote or reason


class HandoverInsight(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    description: str
    impact: Optional[Literal["critical", "high", "medium", "low", "info"]] = "info"
    evidence: list[EvidenceItem] = Field(default_factory=list)


class HandoverSection(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    summary: str
    insights: list[HandoverInsight] = Field(default_factory=list)


class KnowledgeGap(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    category: Literal["documentation", "architecture", "testing", "operations", "credentials", "unclear_status"]
    title: str
    description: str
    suggested_action: str
    resolved: bool = False
    evidence: list[EvidenceItem] = Field(default_factory=list)


class ReadinessScore(BaseModel):
    overall: int
    band: Literal["ready", "at_risk", "not_ready"]
    bus_factor: int
    hygiene: int
    clarity: int
    gap_resolution: int
    facts: dict = Field(default_factory=dict)


def compute_readiness(inputs: Optional[dict], gaps: list["KnowledgeGap"]) -> Optional[ReadinessScore]:
    """Combine stored static sub-scores with the LIVE knowledge-gap resolution %."""
    if not inputs:
        return None
    total = len(gaps)
    resolved = sum(1 for g in gaps if g.resolved)
    gap_score = round(100 * resolved / total) if total else 100
    bus = int(inputs.get("bus_factor", 50))
    hyg = int(inputs.get("hygiene", 50))
    clr = int(inputs.get("clarity", 50))
    overall = round(0.30 * bus + 0.20 * hyg + 0.20 * clr + 0.30 * gap_score)
    band = "ready" if overall >= 75 else "at_risk" if overall >= 50 else "not_ready"
    facts = dict(inputs.get("facts", {}))
    facts["gaps_resolved"] = resolved
    facts["gaps_total"] = total
    return ReadinessScore(
        overall=overall, band=band, bus_factor=bus, hygiene=hyg, clarity=clr,
        gap_resolution=gap_score, facts=facts,
    )


class HandoverReport(BaseModel):
    model_config = ConfigDict(extra="ignore")

    scope: Optional[dict] = None           # {contributor, since, until}
    readiness_inputs: Optional[dict] = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def readiness(self) -> Optional[ReadinessScore]:
        return compute_readiness(self.readiness_inputs, self.knowledge_gaps)

    report_id: str
    repository_url: str
    repo_name: str
    generated_at: datetime
    generator: str                         # e.g. "gemini-2.0-flash", "claude-3.5-sonnet", or "evidence-synthesizer"
    executive_summary: str
    ownership: HandoverSection
    unfinished_work: HandoverSection
    architectural_decisions: HandoverSection
    dependencies_and_setup: HandoverSection
    risks_and_debt: HandoverSection
    knowledge_gaps: list[KnowledgeGap] = Field(default_factory=list)
    supplementary_notes: Optional[str] = None


class GenerateReportRequest(BaseModel):
    repository_url: str
    contributor: Optional[str] = None
    since: Optional[str] = None
    until: Optional[str] = None
    supplementary_notes: Optional[str] = None

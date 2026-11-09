"""
Pydantic data models for HandoverIQ Intelligence Reports.

Every single insight in a report MUST be backed by one or more EvidenceItem
linking back to actual GitHub commits, pull requests, issues, or files.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["commit", "pull_request", "issue", "file"]
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


class HandoverReport(BaseModel):
    model_config = ConfigDict(extra="ignore")

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


class GenerateReportRequest(BaseModel):
    repository_url: str

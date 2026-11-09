"""
HandoverIQ Report Storage Service.

Stores and retrieves HandoverReports.
Uses local JSON file persistence in backend/data/reports/ so reports
persist across server restarts with zero database setup required.
Can easily be swapped or backed by Supabase in Phase 5.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from pydantic import BaseModel
from app.models.report_models import HandoverReport, KnowledgeGap

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "reports"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# In-memory index cache
_CACHE: dict[str, HandoverReport] = {}


def _load_cache():
    """Load existing reports from disk on startup."""
    global _CACHE
    for file_path in DATA_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                report = HandoverReport.model_validate(data)
                _CACHE[report.report_id] = report
        except Exception as e:
            print(f"Warning: could not load report {file_path}: {e}")


# Initialize cache
_load_cache()


def save_report(report: HandoverReport) -> HandoverReport:
    """Save a report to cache and disk."""
    _CACHE[report.report_id] = report
    file_path = DATA_DIR / f"{report.report_id}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(report.model_dump_json(indent=2))
    return report


def get_report(report_id: str) -> Optional[HandoverReport]:
    """Retrieve a report by ID."""
    if report_id in _CACHE:
        return _CACHE[report_id]
    
    file_path = DATA_DIR / f"{report_id}.json"
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                report = HandoverReport.model_validate(json.load(f))
                _CACHE[report_id] = report
                return report
        except Exception:
            return None
    return None


class ReportSummary(BaseModel):
    report_id: str
    repo_name: str
    repository_url: str
    generated_at: str
    generator: str
    unresolved_gaps: int
    insights_count: int


def list_reports() -> list[ReportSummary]:
    """List all saved reports in reverse chronological order."""
    summaries = []
    for r in sorted(_CACHE.values(), key=lambda x: x.generated_at, reverse=True):
        total_insights = (
            len(r.ownership.insights)
            + len(r.unfinished_work.insights)
            + len(r.architectural_decisions.insights)
            + len(r.dependencies_and_setup.insights)
            + len(r.risks_and_debt.insights)
        )
        unresolved = sum(1 for g in r.knowledge_gaps if not g.resolved)
        summaries.append(
            ReportSummary(
                report_id=r.report_id,
                repo_name=r.repo_name,
                repository_url=r.repository_url,
                generated_at=r.generated_at.isoformat(),
                generator=r.generator,
                unresolved_gaps=unresolved,
                insights_count=total_insights,
            )
        )
    return summaries


def update_report_gap(report_id: str, gap_id: str, resolved: bool) -> Optional[HandoverReport]:
    """Toggle a gap's resolved status."""
    report = get_report(report_id)
    if not report:
        return None

    updated_gaps = []
    for g in report.knowledge_gaps:
        if g.id == gap_id:
            updated_gaps.append(g.model_copy(update={"resolved": resolved}))
        else:
            updated_gaps.append(g)

    new_report = report.model_copy(update={"knowledge_gaps": updated_gaps})
    return save_report(new_report)


def add_custom_gap(report_id: str, new_gap: KnowledgeGap) -> Optional[HandoverReport]:
    """Add a human-reviewed knowledge gap or action item to the report."""
    report = get_report(report_id)
    if not report:
        return None

    new_report = report.model_copy(
        update={"knowledge_gaps": [new_gap, *report.knowledge_gaps]}
    )
    return save_report(new_report)

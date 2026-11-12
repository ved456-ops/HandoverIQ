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
from app.services import db

# Legacy JSON reports (pre-SQLite) are imported once on startup.
LEGACY_DIR = db.DATA_DIR / "reports"
LEGACY_DIR.mkdir(parents=True, exist_ok=True)

# In-memory index cache
_CACHE: dict[str, HandoverReport] = {}


def _load_cache():
    """Import legacy JSON files, then load every report from SQLite."""
    for file_path in LEGACY_DIR.glob("*.json"):
        try:
            report = HandoverReport.model_validate(json.loads(file_path.read_text(encoding="utf-8")))
            if db.get_report_body(report.report_id) is None:
                db.put_report(report.report_id, report.generated_at.isoformat(), report.model_dump_json())
        except Exception as e:
            print(f"Warning: could not import legacy report {file_path}: {e}")
    for body in db.all_report_bodies():
        try:
            report = HandoverReport.model_validate_json(body)
            _CACHE[report.report_id] = report
        except Exception as e:
            print(f"Warning: could not load stored report: {e}")


_load_cache()


def save_report(report: HandoverReport) -> HandoverReport:
    """Persist a report to SQLite (and the in-memory cache)."""
    _CACHE[report.report_id] = report
    db.put_report(report.report_id, report.generated_at.isoformat(), report.model_dump_json())
    return report


def get_report(report_id: str) -> Optional[HandoverReport]:
    """Retrieve a report by ID."""
    if report_id in _CACHE:
        return _CACHE[report_id]
    body = db.get_report_body(report_id)
    if body:
        try:
            report = HandoverReport.model_validate_json(body)
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

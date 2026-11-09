"""
Report router — Phase 4 implementation.

Allows retrieving, listing, and human-reviewing HandoverReports.
Supports toggling gap status and adding custom offboarding notes.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.models.report_models import HandoverReport, KnowledgeGap
from app.services.report_storage import (
    ReportSummary,
    add_custom_gap,
    get_report,
    list_reports,
    update_report_gap,
)

router = APIRouter(prefix="/api/report", tags=["report"])


class UpdateGapRequest(BaseModel):
    resolved: bool


class AddGapRequest(BaseModel):
    category: str = "documentation"
    title: str
    description: str
    suggested_action: str


@router.get("", response_model=list[ReportSummary], summary="List all generated handover reports")
async def get_all_reports() -> list[ReportSummary]:
    """Returns a list of all handover reports saved on this instance."""
    return list_reports()


@router.get("/{report_id}", response_model=HandoverReport, summary="Get handover report by ID")
async def get_report_by_id(report_id: str) -> HandoverReport:
    """Retrieve an existing handover report by unique report_id."""
    report = get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Handover report '{report_id}' not found.",
        )
    return report


@router.patch("/{report_id}/gap/{gap_id}", response_model=HandoverReport, summary="Update knowledge gap status")
async def update_gap_status(
    report_id: str,
    gap_id: str,
    body: UpdateGapRequest,
) -> HandoverReport:
    """Mark a knowledge gap or offboarding item as resolved or unresolved."""
    updated = update_report_gap(report_id, gap_id, body.resolved)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' or gap '{gap_id}' not found.",
        )
    return updated


@router.post("/{report_id}/gap", response_model=HandoverReport, summary="Add custom knowledge gap")
async def add_gap(
    report_id: str,
    body: AddGapRequest,
) -> HandoverReport:
    """Allow an engineer to add an unaddressed question or custom checklist item to the report."""
    import uuid
    new_gap = KnowledgeGap(
        id=f"custom-gap-{uuid.uuid4().hex[:6]}",
        category=body.category if body.category in [
            "documentation", "architecture", "testing", "operations", "credentials", "unclear_status"
        ] else "documentation",
        title=body.title,
        description=body.description,
        suggested_action=body.suggested_action,
        resolved=False,
        evidence=[],
    )
    updated = add_custom_gap(report_id, new_gap)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found.",
        )
    return updated

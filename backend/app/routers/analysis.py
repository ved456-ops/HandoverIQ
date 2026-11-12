"""
Analysis router — Phase 3 & 4 implementation.

Endpoints:
  POST /api/analysis/generate  — generates and saves an evidence-linked HandoverReport
"""
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status

from app.models.report_models import GenerateReportRequest, HandoverReport
from app.services.github_service import analyze_repository
from app.services.analysis_service import generate_handover_report
from app.services.report_storage import save_report
from app.services.auth_service import attach_report_to_user

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post(
    "/generate",
    response_model=HandoverReport,
    summary="Generate an evidence-linked handover intelligence report",
    description=(
        "Analyzes repository activity (commits, PRs, issues), generates "
        "a structured 5-pillar Handover Intelligence Report with exact evidence citations, "
        "and automatically persists it for review."
    ),
)
async def generate_report(
    body: GenerateReportRequest,
    authorization: Optional[str] = Header(default=None),
) -> HandoverReport:
    """
    POST /api/analysis/generate

    Body: { "repository_url": "https://github.com/owner/repo" }
    """
    try:
        # Step 1: Collect actual GitHub data
        github_data = await analyze_repository(
            body.repository_url, body.contributor, body.since, body.until, body.supplementary_notes
        )

        # Step 2: Generate evidence-linked handover report
        report = await generate_handover_report(github_data)

        # Step 3: Automatically persist report for reviewer workflows
        save_report(report)

        # Step 4: If user is signed in, link report to their account history
        attach_report_to_user(authorization, report.report_id, report.repo_name)

        return report

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation error: {exc}",
        ) from exc

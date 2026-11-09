"""
GitHub router — Phase 2 implementation.

Endpoints:
  POST /api/github/analyze   — fetch real data from a public GitHub repo
  POST /api/github/collect   — kept as a stub (original Phase 1 endpoint)
  GET  /api/github/status/   — kept as a stub (original Phase 1 endpoint)
"""
from fastapi import APIRouter, HTTPException, status

from app.models.github_models import AnalyzeRequest, AnalyzeResponse
from app.services.github_service import analyze_repository

router = APIRouter(prefix="/api/github", tags=["github"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze a public GitHub repository",
    description=(
        "Fetches repository metadata, recent commits, pull requests, and issues "
        "from the GitHub REST API. No GitHub token is required for public repositories."
    ),
)
async def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    """
    POST /api/github/analyze

    Body: { "repository_url": "https://github.com/owner/repo" }

    Returns real data from the GitHub REST API.
    """
    try:
        return await analyze_repository(body.repository_url)

    except ValueError as exc:
        # Bad input — the URL could not be parsed
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except LookupError as exc:
        # Repository does not exist or is private
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except PermissionError as exc:
        # Rate limit or bad token
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        # Network failure, unexpected API shape, etc.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub API error: {exc}",
        ) from exc


# ── Phase 1 stubs kept intentionally ─────────────────────────────────────────

@router.post("/collect", include_in_schema=False)
async def collect():
    """Original stub — superseded by /analyze."""
    return {"detail": "Use POST /api/github/analyze instead."}


@router.get("/status/{job_id}", include_in_schema=False)
async def collection_status(job_id: str):
    """Original stub — async job polling not needed in Phase 2."""
    return {"job_id": job_id, "detail": "Not implemented."}

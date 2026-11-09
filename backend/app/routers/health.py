"""Production health-check and readiness router."""
from fastapi import APIRouter
from app.core.config import settings
from app.services.report_storage import list_reports

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """
    Liveness and readiness check.
    Used by Render, Vercel, container orchestrators, and the frontend.
    """
    configured_providers = []
    if settings.gemini_api_key:
        configured_providers.append("gemini")
    if settings.anthropic_api_key:
        configured_providers.append("claude")
    configured_providers.append("deterministic-engine")

    return {
        "status": "ok",
        "service": "handoveriq-backend",
        "version": "1.0.0",
        "ai_providers_available": configured_providers,
        "active_ai_provider": settings.ai_provider,
        "reports_saved": len(list_reports()),
    }

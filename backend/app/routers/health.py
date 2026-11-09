"""Health-check router."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Liveness check used by deployment platforms and the frontend."""
    return {"status": "ok", "service": "handoveriq-backend"}

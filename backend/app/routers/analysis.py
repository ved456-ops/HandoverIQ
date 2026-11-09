"""
Analysis router — Phase 3 implementation lives here.
Stubs are provided so the router is importable and the API surface is visible.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/generate")
async def generate():
    """
    Send collected GitHub data to Gemini and return structured insights.
    Implemented in Phase 3.
    """
    return {"detail": "Not implemented yet — coming in Phase 3."}

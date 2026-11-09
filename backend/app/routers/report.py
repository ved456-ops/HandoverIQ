"""
Report router — Phase 4 implementation lives here.
Stubs are provided so the router is importable and the API surface is visible.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/{report_id}")
async def get_report(report_id: str):
    """Retrieve a generated handover report by ID. Implemented in Phase 4."""
    return {"report_id": report_id, "detail": "Not implemented yet — coming in Phase 4."}


@router.patch("/{report_id}")
async def update_report(report_id: str):
    """Allow a human reviewer to edit or resolve gaps. Implemented in Phase 4."""
    return {"report_id": report_id, "detail": "Not implemented yet — coming in Phase 4."}

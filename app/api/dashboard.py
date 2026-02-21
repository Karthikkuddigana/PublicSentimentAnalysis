from fastapi import APIRouter, Query
from typing import Optional
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{organization_id}")
def dashboard_summary(
    organization_id: str,
    platform: Optional[str] = Query("consolidated", description="Platform filter: consolidated, youtube, manual"),
    period: Optional[str] = Query("7d", description="Time period: 1d, 7d, 1m, 3m, 6m, 1y")
):
    """
    Get dashboard summary with sentiment counts, emotions, and approval rating.
    Supports filtering by platform (consolidated/youtube/manual) and time period.
    """
    return get_dashboard_summary(organization_id, platform, period)
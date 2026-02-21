from fastapi import APIRouter, Query
from app.services.insights_service import get_top_comments

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("/top-comments")
def top_comments(
    organization_id: str = Query(...),
    platform: str = Query(..., regex="^(all|youtube|manual)$")
):
    return get_top_comments(organization_id, platform)
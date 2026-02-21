from fastapi import APIRouter, Query
from app.services.insights_service import get_top_comments
from fastapi import Query

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("/top-comments")
def top_comments(
    organization_id: str = Query(...),
    platform: str = Query(..., pattern="^(all|youtube|manual)$")
):
    return get_top_comments(organization_id, platform)
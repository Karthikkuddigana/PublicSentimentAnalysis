from fastapi import APIRouter
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{organization_id}")
def dashboard_summary(organization_id: str):
    return get_dashboard_summary(organization_id)
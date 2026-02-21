from fastapi import APIRouter
from app.models.data_source_models import DataSourceCreate
from app.repositories.data_source_repository import create_data_source

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


@router.post("/")
def add_data_source(payload: DataSourceCreate):
    return create_data_source(payload.model_dump(mode="json"))
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Literal
from app.services.youtube_service import run_ingestion


router = APIRouter()


# =========================================================
# REQUEST MODEL
# =========================================================

class IngestRequest(BaseModel):
    organization_id: str = Field(default="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
    brand: str = Field(..., min_length=1, max_length=100)
    title_keyword: str = Field(..., min_length=1, max_length=200)

    storage: Literal["csv", "excel", "supabase"] = "csv"

    benchmark: int = Field(
        default=5,
        ge=1,
        le=1000,
        description="Scoring scale benchmark (e.g., 5, 10, 100)"
    )

    max_videos: int = Field(
        default=5,
        ge=1,
        le=20
    )

    max_comments_per_video: int = Field(
        default=100,
        ge=1,
        le=500
    )


# =========================================================
# RESPONSE MODEL
# =========================================================

class IngestResponse(BaseModel):
    status: str
    records: int
    videos_processed: int
    file: str 
    benchmark: int


# =========================================================
# ROUTE
# =========================================================

@router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_200_OK
)
def ingest(req: IngestRequest):

    try:
        result = run_ingestion(
            brand=req.brand,
            title_keyword=req.title_keyword,
            organization_id=req.organization_id,
            storage=req.storage,
            benchmark=req.benchmark,
            max_videos=req.max_videos,
            max_comments_per_video=req.max_comments_per_video
        )

        return IngestResponse(
            status="success",
            records=result["records"],
            videos_processed=result["videos_processed"],
            file=result.get("file"),
            benchmark=result["benchmark"]
        )

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}"
        )
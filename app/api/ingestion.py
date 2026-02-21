# app/api/ingestion.py

from fastapi import (
    APIRouter,
    BackgroundTasks,
    HTTPException,
    UploadFile,
    File,
    Form,
    status
)
from pydantic import BaseModel, Field
from typing import Literal, Optional
from pathlib import Path
import uuid
import shutil

from app.services.job_store import JOB_STORE
from app.services.background_worker import process_job


router = APIRouter()


# =========================================================
# REQUEST MODEL (API SOURCES)
# =========================================================

class IngestRequest(BaseModel):
    source: Literal["youtube"]
    brand: str = Field(..., min_length=1)
    keyword: str = Field(..., min_length=1)

    storage: Literal["csv", "excel", "supabase"] = "csv"

    benchmark: int = Field(
        default=5,
        ge=1,
        le=1000,
        description="Sentiment scaling benchmark"
    )


# =========================================================
# YOUTUBE / API INGESTION
# =========================================================

@router.post(
    "/ingest",
    status_code=status.HTTP_202_ACCEPTED
)
def ingest_api(
    req: IngestRequest,
    background_tasks: BackgroundTasks
):
    """
    Ingest data from API-based sources (e.g., YouTube).
    Runs asynchronously.
    """

    job_id = str(uuid.uuid4())

    JOB_STORE[job_id] = {
        "status": "processing",
        "source": req.source
    }

    background_tasks.add_task(
        process_job,
        job_id,
        req.dict()
    )

    return {
        "job_id": job_id,
        "status": "started"
    }


# =========================================================
# FILE UPLOAD INGESTION
# =========================================================

@router.post(
    "/ingest/file",
    status_code=status.HTTP_202_ACCEPTED
)
def ingest_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    text_column: str = Form(...),
    benchmark: int = Form(5),
    storage: str = Form("csv")
):
    """
    Ingest comments from uploaded CSV or Excel file.
    """

    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(
            status_code=400,
            detail="Only CSV or XLSX files are supported"
        )

    job_id = str(uuid.uuid4())

    # Save uploaded file
    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_location = upload_dir / file.filename

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    JOB_STORE[job_id] = {
        "status": "processing",
        "source": "file_upload"
    }

    background_tasks.add_task(
        process_job,
        job_id,
        {
            "source": "file_upload",
            "file_path": str(file_location),
            "text_column": text_column,
            "benchmark": benchmark,
            "storage": storage,
        }
    )

    return {
        "job_id": job_id,
        "status": "started"
    }


# =========================================================
# JOB STATUS ENDPOINT
# =========================================================

@router.get("/status/{job_id}")
def check_status(job_id: str):
    """
    Check ingestion job status.
    """

    job = JOB_STORE.get(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job
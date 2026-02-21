# app/api/ingestion.py

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
import uuid

from app.services.job_store import JOB_STORE
from app.services.background_worker import process_job


router = APIRouter()


class IngestRequest(BaseModel):
    source: Literal["youtube"]  # extend later
    brand: str = Field(..., min_length=1)
    keyword: str = Field(..., min_length=1)
    storage: Literal["csv", "excel", "supabase"] = "csv"
    benchmark: int = Field(default=5, ge=1, le=1000)


@router.post("/ingest")
def ingest(req: IngestRequest, background_tasks: BackgroundTasks):

    job_id = str(uuid.uuid4())

    JOB_STORE[job_id] = {"status": "processing"}

    background_tasks.add_task(
        process_job,
        job_id,
        req.dict()
    )

    return {
        "job_id": job_id,
        "status": "started"
    }


@router.get("/status/{job_id}")
def check_status(job_id: str):

    job = JOB_STORE.get(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job
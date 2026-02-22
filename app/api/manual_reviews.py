from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import shutil
import os
from app.services.manual_review_service import process_manual_csv

router = APIRouter(prefix="/manual-reviews", tags=["Manual Reviews"])


@router.options("/upload")
async def upload_options():
    """Handle preflight CORS requests for file uploads"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )


@router.post("/upload")
async def upload_manual_reviews(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        return JSONResponse(
            status_code=400,
            content={"error": "Only CSV files are allowed"},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )

    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = process_manual_csv(temp_path)

    os.remove(temp_path)

    return JSONResponse(
        content=result,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )
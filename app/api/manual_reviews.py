from fastapi import APIRouter, UploadFile, File
import shutil
import os
from app.services.manual_review_service import process_manual_csv

router = APIRouter(prefix="/manual-reviews", tags=["Manual Reviews"])


@router.post("/upload")
async def upload_manual_reviews(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are allowed"}

    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = process_manual_csv(temp_path)

    os.remove(temp_path)

    return result
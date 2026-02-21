# app/services/file_upload_service.py

import pandas as pd
from typing import Dict, List
from datetime import datetime
from pathlib import Path
from app.services.sentiment_service import (
    batch_analyze_sentiment,
    batch_analyze_emotion
)


def run_file_ingestion(
    file_path: str,
    text_column: str,
    benchmark: int = 5,
    storage: str = "csv"
) -> Dict:

    # ---------------------------------
    # 1️⃣ Read File
    # ---------------------------------
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    elif file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

    if text_column not in df.columns:
        raise ValueError(f"Column '{text_column}' not found in file")

    texts: List[str] = df[text_column].astype(str).tolist()

    # ---------------------------------
    # 2️⃣ Batch ML Inference
    # ---------------------------------
    sentiment_results = batch_analyze_sentiment(texts, benchmark)
    emotion_results = batch_analyze_emotion(texts)

    # ---------------------------------
    # 3️⃣ Merge Results
    # ---------------------------------
    results = []

    for i in range(len(texts)):
        record = {
            "source": "file_upload",
            "text": texts[i],
            "fetched_at": datetime.utcnow().isoformat(),
        }

        record.update(sentiment_results[i])
        record.update(emotion_results[i])

        results.append(record)

    # ---------------------------------
    # 4️⃣ Save Output
    # ---------------------------------
    output_path = None

    if storage == "csv":
        output_path = save_output(results, "file_upload_output.csv")

    elif storage == "excel":
        output_path = save_output(results, "file_upload_output.xlsx")

    return {
        "records": len(results),
        "file": output_path,
        "comments": results
    }


def save_output(data: List[Dict], filename: str) -> str:

    Path("data/file_upload").mkdir(parents=True, exist_ok=True)

    full_path = f"data/file_upload/{filename}"

    df = pd.DataFrame(data)

    if filename.endswith(".csv"):
        df.to_csv(full_path, index=False)
    else:
        df.to_excel(full_path, index=False)

    return full_path
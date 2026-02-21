import pandas as pd
from datetime import datetime
from typing import List, Dict
from app.repositories.manual_review_repository import save_manual_reviews
from app.core.config import supabase
from app.services.sentiment_service import analyze_sentiment, analyze_emotion


def get_organization_id_by_name(org_name: str) -> str:

    response = (
        supabase
        .table("organizations")
        .select("id")
        .eq("name", org_name)
        .single()
        .execute()
    )

    if not response.data:
        raise Exception(f"Organization '{org_name}' not found")

    return response.data["id"]


def process_manual_csv(file_path: str, benchmark: int = 5):

    df = pd.read_csv(file_path)

    records: List[Dict] = []

    for _, row in df.iterrows():

        org_name = row["Organization name"]
        organization_id = get_organization_id_by_name(org_name)

        review_text = row["Review"]

        sentiment_data = analyze_sentiment(review_text, benchmark)
        emotion_data = analyze_emotion(review_text)

        records.append({
            "organization_id": organization_id,
            "source": "manual",
            "username": row["Username"],
            "review_text": review_text,
            "review_submitted_date": row["Review submitted date"],

            # Sentiment
            "sentiment": sentiment_data["sentiment"],
            "raw_score": sentiment_data["raw_score"],
            "scaled_score": sentiment_data["scaled_score"],
            "benchmark": sentiment_data["benchmark"],
            "sentiment_confidence": sentiment_data["confidence"],

            # Emotion
            "emotion": emotion_data["emotion"],
            "emotion_confidence": emotion_data["emotion_confidence"],

            "created_at": datetime.utcnow()
        })

    return save_manual_reviews(records)
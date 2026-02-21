import pandas as pd
from datetime import datetime
from typing import List, Dict
from app.repositories.manual_review_repository import save_manual_reviews
from app.core.config import supabase
from app.services.sentiment_service import analyze_sentiment, analyze_emotion
from datetime import datetime

def get_organization_id_by_name(org_name: str) -> str:

    org_name = org_name.strip()
    print("=========================")
    print(f"Looking for organization: '{org_name}'")
    response = (
        supabase
        .table("organizations")
        .select("id,name")
        .ilike("name", f"%{org_name}%")   # important fix
        .execute()
    )

    if not response.data:
        all_orgs = (
            supabase
            .table("organizations")
            .select("name")
            .execute()
        )

        raise Exception(
            f"Organization '{org_name}' not found.\n"
            f"Available organizations: {[org['name'] for org in all_orgs.data]}"
        )

    return response.data[0]["id"]


def process_manual_csv(file_path: str, benchmark: int = 5):

    df = pd.read_csv(file_path)

    records: List[Dict] = []

    for _, row in df.iterrows():

        org_name = str(row["Organization name"]).strip()
        organization_id = get_organization_id_by_name(org_name)

        review_text = str(row["Review"])

        sentiment_data = analyze_sentiment(review_text, benchmark)
        emotion_data = analyze_emotion(review_text)

        review_date_str = str(row["Review submitted date"]).strip()

        review_date = datetime.strptime(
            review_date_str,
            "%d-%m-%Y %H:%M"
        )

        records.append({
            "organization_id": organization_id,
            "source": "manual",
            "username": row["Username"],
            "review_text": review_text,
            "review_submitted_date": review_date,

            "sentiment": sentiment_data["sentiment"],
            "raw_score": sentiment_data["raw_score"],
            "scaled_score": sentiment_data["scaled_score"],
            "benchmark": sentiment_data["benchmark"],
            "sentiment_confidence": sentiment_data["confidence"],

            "emotion": emotion_data["emotion"],
            "emotion_confidence": emotion_data["emotion_confidence"],

            "created_at": datetime.utcnow()
        })
    print(records)
    return save_manual_reviews(records)
from app.repositories.dashboard_repository import (
    get_sentiment_counts,
    get_emotion_counts
)


def get_dashboard_summary(organization_id: str):

    sentiment_data = get_sentiment_counts(organization_id)
    emotion_data = get_emotion_counts(organization_id)

    return {
        **sentiment_data,
        "emotions": emotion_data
    }
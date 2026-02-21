from app.core.config import supabase


def get_sentiment_counts(organization_id: str):

    response = (
        supabase
        .table("youtube_comments")
        .select("sentiment")
        .eq("organization_id", organization_id)
        .execute()
    )

    rows = response.data

    positive = sum(1 for r in rows if r["sentiment"] == "Positive")
    negative = sum(1 for r in rows if r["sentiment"] == "Negative")
    neutral = sum(1 for r in rows if r["sentiment"] == "Neutral")

    return {
        "positiveCount": positive,
        "negativeCount": negative,
        "neutralCount": neutral
    }


def get_emotion_counts(organization_id: str):

    response = (
        supabase
        .table("youtube_comments")
        .select("emotion")
        .eq("organization_id", organization_id)
        .execute()
    )

    rows = response.data

    emotion_counts = {}

    for r in rows:
        emotion = r["emotion"]
        if emotion:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    return emotion_counts
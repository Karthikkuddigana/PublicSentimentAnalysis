from app.repositories.dashboard_repository import (
    get_sentiment_counts,
    get_emotion_counts
)


def get_dashboard_summary(organization_id: str, platform: str = "consolidated", period: str = "7d"):
    """
    Get dashboard summary with sentiment counts, emotions, and approval rating.
    
    Args:
        organization_id: Organization UUID
        platform: Filter by platform (consolidated, youtube, manual)
        period: Time period filter (1d, 7d, 1m, 3m, 6m, 1y)
    
    Returns:
        Dictionary with sentiment counts, emotions, approval rating, and platform breakdowns
    """
    platform_sentiments = {}
    
    # For consolidated view, get individual platform data and sum them
    if platform == "consolidated":
        # Get YouTube data
        youtube_sentiment = get_sentiment_counts(organization_id, "youtube", period)
        youtube_emotion = get_emotion_counts(organization_id, "youtube", period)
        
        # Get Manual data
        manual_sentiment = get_sentiment_counts(organization_id, "manual", period)
        manual_emotion = get_emotion_counts(organization_id, "manual", period)
        
        # Sum the counts for consolidated view
        sentiment_data = {
            "positiveCount": youtube_sentiment["positiveCount"] + manual_sentiment["positiveCount"],
            "negativeCount": youtube_sentiment["negativeCount"] + manual_sentiment["negativeCount"],
            "neurtralCount": youtube_sentiment["neurtralCount"] + manual_sentiment["neurtralCount"]
        }
        
        # Combine emotions
        emotion_data = {}
        for emotion, count in youtube_emotion.items():
            emotion_data[emotion] = count
        for emotion, count in manual_emotion.items():
            emotion_data[emotion] = emotion_data.get(emotion, 0) + count
        
        # Build platform sentiments breakdown with raw counts
        youtube_total = youtube_sentiment["positiveCount"] + youtube_sentiment["negativeCount"] + youtube_sentiment["neurtralCount"]
        manual_total = manual_sentiment["positiveCount"] + manual_sentiment["negativeCount"] + manual_sentiment["neurtralCount"]
        
        if youtube_total > 0:
            platform_sentiments["youtube"] = {
                "positive": round((youtube_sentiment["positiveCount"] / youtube_total) * 100),
                "negative": round((youtube_sentiment["negativeCount"] / youtube_total) * 100),
                "neutral": round((youtube_sentiment["neurtralCount"] / youtube_total) * 100),
                "approval": round((youtube_sentiment["positiveCount"] / youtube_total) * 100),
                "counts": {
                    "positive": youtube_sentiment["positiveCount"],
                    "negative": youtube_sentiment["negativeCount"],
                    "neutral": youtube_sentiment["neurtralCount"],
                    "total": youtube_total
                }
            }
        
        if manual_total > 0:
            platform_sentiments["manual"] = {
                "positive": round((manual_sentiment["positiveCount"] / manual_total) * 100),
                "negative": round((manual_sentiment["negativeCount"] / manual_total) * 100),
                "neutral": round((manual_sentiment["neurtralCount"] / manual_total) * 100),
                "approval": round((manual_sentiment["positiveCount"] / manual_total) * 100),
                "counts": {
                    "positive": manual_sentiment["positiveCount"],
                    "negative": manual_sentiment["negativeCount"],
                    "neutral": manual_sentiment["neurtralCount"],
                    "total": manual_total
                }
            }
    else:
        # For individual platform views, just get that platform's data
        sentiment_data = get_sentiment_counts(organization_id, platform, period)
        emotion_data = get_emotion_counts(organization_id, platform, period)
    
    # Calculate approval rating (percentage of positive sentiments)
    total = sentiment_data["positiveCount"] + sentiment_data["negativeCount"] + sentiment_data["neurtralCount"]
    approval = round((sentiment_data["positiveCount"] / total * 100) if total > 0 else 0)
    
    return {
        **sentiment_data,
        "totalCount": total,
        "emotions": emotion_data,
        "approval": approval,
        "platformSentiments": platform_sentiments
    }
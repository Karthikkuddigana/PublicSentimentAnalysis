from app.core.config import supabase
from datetime import datetime, timedelta


def get_period_filter(period: str):
    """
    Convert period string to ISO datetime string for filtering.
    
    Args:
        period: Period string (1d, 7d, 1m, 3m, 6m, 1y)
    
    Returns:
        ISO formatted datetime string for the start of the period
    """
    now = datetime.now()
    
    if period == "1d":
        start_date = now - timedelta(days=1)
    elif period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "1m":
        start_date = now - timedelta(days=30)
    elif period == "3m":
        start_date = now - timedelta(days=90)
    elif period == "6m":
        start_date = now - timedelta(days=180)
    elif period == "1y":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=7)  # Default to 7 days
    
    return start_date.isoformat()


def get_sentiment_counts(organization_id: str, platform: str = "consolidated", period: str = "7d"):
    """
    Get sentiment counts from youtube_comments and/or manual_reviews.
    
    Args:
        organization_id: Organization UUID
        platform: Filter by platform (consolidated, youtube, manual)
        period: Time period filter (1d, 7d, 1m, 3m, 6m, 1y)
    
    Returns:
        Dictionary with positiveCount, negativeCount, neurtralCount
    """
    start_date = get_period_filter(period)
    
    positive = 0
    negative = 0
    neutral = 0
    
    # Query YouTube comments if platform is youtube or consolidated
    if platform in ["youtube", "consolidated"]:
        try:
            response = (
                supabase
                .table("youtube_comments")
                .select("sentiment")
                .eq("organization_id", organization_id)
                .gte("published_at", start_date)
                .execute()
            )
            
            rows = response.data
            print(f"YouTube records fetched: {len(rows)}")
            if rows:
                print(f"Sample YouTube sentiment values: {[r.get('sentiment') for r in rows[:3]]}")
            
            positive += sum(1 for r in rows if r.get("sentiment", "").lower() == "positive")
            negative += sum(1 for r in rows if r.get("sentiment", "").lower() == "negative")
            neutral += sum(1 for r in rows if r.get("sentiment", "").lower() == "neutral")
        except Exception as e:
            print(f"Error fetching YouTube data: {e}")
    
    # Query Manual reviews if platform is manual or consolidated
    if platform in ["manual", "consolidated"]:
        try:
            response = (
                supabase
                .table("manual_reviews")
                .select("sentiment")
                .eq("organization_id", organization_id)
                .gte("created_at", start_date)
                .execute()
            )
            
            rows = response.data
            print(f"Manual records fetched: {len(rows)}")
            if rows:
                print(f"Sample Manual sentiment values: {[r.get('sentiment') for r in rows[:3]]}")
            
            positive += sum(1 for r in rows if r.get("sentiment", "").lower() == "positive")
            negative += sum(1 for r in rows if r.get("sentiment", "").lower() == "negative")
            neutral += sum(1 for r in rows if r.get("sentiment", "").lower() == "neutral")
        except Exception as e:
            print(f"Error fetching manual reviews data: {e}")
    
    return {
        "positiveCount": positive,
        "negativeCount": negative,
        "neurtralCount": neutral  # Note: Frontend expects this typo
    }


def get_emotion_counts(organization_id: str, platform: str = "consolidated", period: str = "7d"):
    """
    Get emotion counts from youtube_comments and/or manual_reviews.
    
    Args:
        organization_id: Organization UUID
        platform: Filter by platform (consolidated, youtube, manual)
        period: Time period filter (1d, 7d, 1m, 3m, 6m, 1y)
    
    Returns:
        Dictionary with emotion counts (Joy, Anger, Sadness, Fear, Surprise, Love, Neutral)
    """
    start_date = get_period_filter(period)
    emotion_counts = {}
    
    # Query YouTube comments if platform is youtube or consolidated
    if platform in ["youtube", "consolidated"]:
        try:
            response = (
                supabase
                .table("youtube_comments")
                .select("emotion")
                .eq("organization_id", organization_id)
                .gte("published_at", start_date)
                .execute()
            )
            
            rows = response.data
            
            for r in rows:
                emotion = r.get("emotion")
                if emotion:
                    # Capitalize first letter for frontend compatibility
                    emotion_key = emotion.capitalize()
                    emotion_counts[emotion_key] = emotion_counts.get(emotion_key, 0) + 1
        except Exception as e:
            print(f"Error fetching YouTube emotions: {e}")
    
    # Query Manual reviews if platform is manual or consolidated
    if platform in ["manual", "consolidated"]:
        try:
            response = (
                supabase
                .table("manual_reviews")
                .select("emotion")
                .eq("organization_id", organization_id)
                .gte("created_at", start_date)
                .execute()
            )
            
            rows = response.data
            
            for r in rows:
                emotion = r.get("emotion")
                if emotion:
                    # Capitalize first letter for frontend compatibility
                    emotion_key = emotion.capitalize()
                    emotion_counts[emotion_key] = emotion_counts.get(emotion_key, 0) + 1
        except Exception as e:
            print(f"Error fetching manual reviews emotions: {e}")
    
    return emotion_counts
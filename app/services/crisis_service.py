# app/services/crisis_service.py

def detect_crisis(comments):

    total = len(comments)
    if total == 0:
        return {"crisis": False}

    negative_count = sum(1 for c in comments if c.get("sentiment") == "Negative")
    anger_count = sum(1 for c in comments if c.get("emotion") == "Anger")

    negative_ratio = negative_count / total
    anger_ratio = anger_count / total

    crisis = False
    reason = None

    if negative_ratio > 0.6:
        crisis = True
        reason = "High negative sentiment spike"

    if anger_ratio > 0.4:
        crisis = True
        reason = "High anger emotion spike"

    return {
        "crisis": crisis,
        "negative_ratio": round(negative_ratio, 2),
        "anger_ratio": round(anger_ratio, 2),
        "reason": reason
    }
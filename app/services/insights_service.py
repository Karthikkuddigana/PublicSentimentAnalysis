from app.repositories.insights_repository import fetch_top_comments


def get_top_comments(organization_id: str, platform: str):

    platform = platform.lower()

    positive_comments = []
    negative_comments = []

    if platform == "youtube":
        positive_comments = fetch_top_comments(
            "youtube_comments", organization_id, "Positive"
        )
        negative_comments = fetch_top_comments(
            "youtube_comments", organization_id, "Negative"
        )

    elif platform == "manual":
        positive_comments = fetch_top_comments(
            "manual_reviews", organization_id, "Positive"
        )
        negative_comments = fetch_top_comments(
            "manual_reviews", organization_id, "Negative"
        )

    elif platform == "all":

        # Fetch from both tables
        yt_pos = fetch_top_comments(
            "youtube_comments", organization_id, "Positive"
        )
        yt_neg = fetch_top_comments(
            "youtube_comments", organization_id, "Negative"
        )

        man_pos = fetch_top_comments(
            "manual_reviews", organization_id, "Positive"
        )
        man_neg = fetch_top_comments(
            "manual_reviews", organization_id, "Negative"
        )

        positive_comments = yt_pos + man_pos
        negative_comments = yt_neg + man_neg

        # Sort combined results
        positive_comments = sorted(
            positive_comments,
            key=lambda x: x.get("scaled_score", 0),
            reverse=True
        )[:10]

        negative_comments = sorted(
            negative_comments,
            key=lambda x: x.get("scaled_score", 0)
        )[:10]

    else:
        raise ValueError("Platform must be: all | youtube | manual")

    return {
        "positiveComments": positive_comments,
        "negativeComments": negative_comments
    }
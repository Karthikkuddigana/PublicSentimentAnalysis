from app.core.config import supabase


def fetch_top_comments(table_name: str, organization_id: str, sentiment: str):
    review_text="review_text" if table_name!="youtube_comments" else "text"
    response = (
        supabase
        .table(table_name)
        .select(review_text+ ", sentiment, scaled_score, created_at")
        .eq("organization_id", organization_id)
        .eq("sentiment", sentiment)
        .order("scaled_score", desc=(sentiment.lower() == "positive"))
        .limit(10)
        .execute()
    )

    return response.data
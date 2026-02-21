from typing import List, Dict
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError
from app.core.config import supabase


def save_youtube_comments(records: List[Dict]) -> Dict:
    """
    Bulk insert YouTube comments into Supabase
    """

    safe_records = jsonable_encoder(records)

    try:
        response = (
            supabase
            .table("youtube_comments")
            .insert(safe_records)
            .execute()
        )

        return {
            "inserted": len(response.data)
        }

    except APIError as e:
        raise Exception(f"Supabase API Error: {str(e)}")
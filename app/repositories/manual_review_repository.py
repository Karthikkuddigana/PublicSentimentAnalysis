from app.core.config import supabase
from fastapi.encoders import jsonable_encoder
from typing import List, Dict


def save_manual_reviews(records: List[Dict]):

    safe_records = jsonable_encoder(records)

    response = (
        supabase
        .table("manual_reviews")
        .insert(safe_records)
        .execute()
    )

    if hasattr(response, "error") and response.error:
        raise Exception(response.error)

    return {"inserted": len(response.data)}
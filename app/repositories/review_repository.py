from app.core.config import supabase
from datetime import datetime
from typing import Dict, List
from fastapi.encoders import jsonable_encoder

def create_review(data: dict):
    response = supabase.table("reviews").insert(data).execute()
    if response.data:
        return response.data[0]
    raise Exception(response.error.message if response.error else "Insert failed")

from datetime import datetime
from typing import Dict, List
from fastapi.encoders import jsonable_encoder
from app.core.config import supabase


def save_reviews_to_supabase(column_data: Dict) -> Dict:
    """
    Converts column-based dictionary into row-based list
    and bulk inserts into Supabase.
    """

    # Validate required keys
    required_keys = [
        "organization_id",
        "data_source_id",
        "review_text",
        "review_date",
        "created_at"
    ]

    for key in required_keys:
        if key not in column_data:
            raise ValueError(f"Missing required key: {key}")

    total_rows = len(column_data["review_text"])

    # Ensure all columns have equal length
    for key in required_keys:
        if len(column_data[key]) != total_rows:
            raise ValueError("Column lengths do not match")

    # Convert column format → row format
    records: List[Dict] = []

    for i in range(total_rows):
        records.append({
            "organization_id": column_data["organization_id"][i],
            "data_source_id": column_data["data_source_id"][i],
            "review_text": column_data["review_text"][i],
            "review_date": column_data["review_date"][i],
            "created_at": column_data["created_at"][i]
        })

    # Convert datetime & UUID to JSON-safe format
    safe_records = jsonable_encoder(records)

    try:
        response = (
            supabase
            .table("reviews")
            .insert(safe_records)
            .execute()
        )

        return {
            "inserted": len(response.data)
        }

    except APIError as e:
        raise Exception(f"Supabase API Error: {str(e)}")

    except Exception as e:
        raise Exception(f"Unexpected Error: {str(e)}")
from app.core.config import supabase


def create_data_source(data: dict):
    response = supabase.table("data_sources").insert(data).execute()
    if response.data:
        return response.data[0]
    raise Exception(response.error.message if response.error else "Insert failed")
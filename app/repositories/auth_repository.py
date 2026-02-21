from app.core.config import supabase
from datetime import datetime
from supabase_auth.errors import AuthApiError

def create_auth_user(email: str, password: str):
    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        if response.user is None:
            raise Exception("Signup failed")

        return response.user.id

    except AuthApiError as e:
        if "User already registered" in str(e):
            raise Exception("Email already registered. Please login.")
        raise Exception(f"Auth error: {str(e)}")



def create_organization(name: str, email: str):

    response = (
        supabase
        .table("organizations")
        .insert({
            "name": name,
            "email": email
        })
        .execute()
    )

    if not response.data:
        raise Exception("Failed to create organization")

    return response.data[0]["id"]


def create_user_profile(user_id: str, organization_id: str, username: str):

    response = (
        supabase
        .table("users")
        .insert({
            "id": user_id,
            "organization_id": organization_id,
            "name": username,
            "role": "admin"
        })
        .execute()
    )

    if not response.data:
        raise Exception("Failed to create user profile")

    return response.data[0]
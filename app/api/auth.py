from fastapi import APIRouter
from app.models.signup_model import SignupRequest
from app.services.auth_service import signup_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(payload: SignupRequest):
    return signup_user(payload)
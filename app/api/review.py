from fastapi import APIRouter
from app.models.review_models import ReviewCreate
from app.repositories.review_repository import create_review

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/")
def add_review(payload: ReviewCreate):
    return create_review(payload.dict())
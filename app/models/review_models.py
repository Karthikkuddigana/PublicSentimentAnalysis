from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    organization_id: UUID
    data_source_id: UUID
    category: Optional[str] = None
    review_text: str
    language: Optional[str] = None
    review_date: Optional[datetime] = None
from pydantic import BaseModel
from uuid import UUID


class DataSourceCreate(BaseModel):
    organization_id: UUID
    source_type: str
    source_name: str
from datetime import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel

class ActivityLogCreate(BaseModel):
    user: str
    action: str
    module: str
    status: str

class ActivityLogResponse(BaseModel):
    id: PydanticObjectId
    user: str
    action: str
    module: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ActivityLogFilter(BaseModel):
    module: str | None = None
    user: str | None = None
    status: str | None = None

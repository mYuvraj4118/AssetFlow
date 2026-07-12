from datetime import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel
from app.models.notification import NotificationPriority, NotificationType

class NotificationCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    notification_type: NotificationType
    ref_id: str | None = None
    user_id: PydanticObjectId | None = None

class NotificationUpdate(BaseModel):
    read: bool | None = None

class NotificationResponse(BaseModel):
    id: PydanticObjectId
    title: str
    description: str
    category: str
    priority: NotificationPriority
    notification_type: NotificationType
    read: bool
    ref_id: str | None = None
    user_id: PydanticObjectId | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

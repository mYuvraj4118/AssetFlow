from datetime import datetime, timezone
from enum import Enum
from beanie import Document, PydanticObjectId
from pydantic import Field

class NotificationPriority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class NotificationType(str, Enum):
    ASSET_ASSIGNED = "Asset Assigned"
    TRANSFER_APPROVED = "Transfer Approved"
    MAINTENANCE_APPROVED = "Maintenance Approved"
    MAINTENANCE_REJECTED = "Maintenance Rejected"
    BOOKING_CONFIRMED = "Booking Confirmed"
    BOOKING_CANCELLED = "Booking Cancelled"
    BOOKING_REMINDER = "Booking Reminder"
    AUDIT_STARTED = "Audit Started"
    AUDIT_COMPLETED = "Audit Completed"
    AUDIT_DISCREPANCY = "Audit Discrepancy"
    OVERDUE_RETURN = "Overdue Return"
    SYSTEM_ANNOUNCEMENT = "System Announcement"

class Notification(Document):
    title: str
    description: str
    category: str  # "Approvals", "Maintenance", "Bookings", "Audit", "System"
    priority: NotificationPriority = NotificationPriority.MEDIUM
    notification_type: NotificationType
    read: bool = False
    ref_id: str | None = None
    user_id: PydanticObjectId | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notifications"

class NotificationPreferences(Document):
    user_id: PydanticObjectId
    email_enabled: bool = True
    push_enabled: bool = True
    categories_muted: list[str] = Field(default_factory=list)

    class Settings:
        name = "notification_preferences"

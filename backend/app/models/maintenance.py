from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field


class MaintenancePriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class MaintenanceStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    TECHNICIAN_ASSIGNED = "Technician Assigned"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"


class MaintenanceRequest(Document):
    asset_id: PydanticObjectId
    raised_by: PydanticObjectId

    issue: str
    priority: MaintenancePriority
    description: str

    photo_url: str | None = None

    status: MaintenanceStatus = MaintenanceStatus.PENDING

    approved_by: PydanticObjectId | None = None
    technician_id: PydanticObjectId | None = None

    approval_remarks: str | None = None
    resolution_remarks: str | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    resolved_at: datetime | None = None

    class Settings:
        name = "maintenance_requests"
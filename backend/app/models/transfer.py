from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field


class TransferStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"


class Transfer(Document):
    asset_id: PydanticObjectId

    from_employee_id: PydanticObjectId
    to_employee_id: PydanticObjectId

    requested_by: PydanticObjectId
    approved_by: PydanticObjectId | None = None

    reason: str
    approval_remarks: str | None = None

    status: TransferStatus = TransferStatus.PENDING

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    completed_at: datetime | None = None

    class Settings:
        name = "transfers"
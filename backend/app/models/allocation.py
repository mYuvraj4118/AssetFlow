from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field


class AllocationStatus(str, Enum):
    ACTIVE = "Active"
    RETURN_REQUESTED = "Return Requested"
    RETURNED = "Returned"


class Allocation(Document):
    asset_id: PydanticObjectId
    employee_id: PydanticObjectId
    department_id: PydanticObjectId | None = None

    allocated_by: PydanticObjectId

    allocation_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    expected_return_date: datetime | None = None
    actual_return_date: datetime | None = None

    condition_at_allocation: str | None = None
    condition_at_return: str | None = None

    allocation_notes: str | None = None
    return_notes: str | None = None

    status: AllocationStatus = AllocationStatus.ACTIVE

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "allocations"
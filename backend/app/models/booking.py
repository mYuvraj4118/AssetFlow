from datetime import datetime, timezone
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field


class BookingStatus(str, Enum):
    UPCOMING = "Upcoming"
    ONGOING = "Ongoing"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class Booking(Document):
    resource_id: PydanticObjectId
    employee_id: PydanticObjectId
    department_id: PydanticObjectId | None = None

    start_time: datetime
    end_time: datetime

    purpose: str

    status: BookingStatus = BookingStatus.UPCOMING

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    cancelled_at: datetime | None = None

    class Settings:
        name = "bookings"
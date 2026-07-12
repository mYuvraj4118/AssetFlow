from datetime import datetime, timezone
from beanie import Document, PydanticObjectId
from pydantic import Field

class ActivityLog(Document):
    user: str  # User name or email
    action: str  # Action description
    module: str  # Module name (e.g. allocations, maintenance, audit, bookings)
    status: str  # Action status (e.g. Completed, Pending, Approved)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "activity_logs"

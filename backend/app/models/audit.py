from datetime import datetime, timezone
from enum import Enum
from beanie import Document, PydanticObjectId
from pydantic import Field
from app.constants.audit_status import AuditStatus

class VerificationStatus(str, Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    MISSING = "Missing"
    DAMAGED = "Damaged"

class AuditCycle(Document):
    name: str
    quarter: str
    department: str
    start_date: datetime
    end_date: datetime
    assigned_auditors: list[str]
    status: AuditStatus = AuditStatus.IN_PROGRESS
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "audit_cycles"

class AuditRecord(Document):
    audit_cycle_id: PydanticObjectId
    asset_tag: str
    asset_name: str
    expected_location: str
    current_holder: str
    verification_status: VerificationStatus = VerificationStatus.PENDING
    last_verified: datetime | None = None
    auditor_id: PydanticObjectId | None = None
    notes: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "audit_records"

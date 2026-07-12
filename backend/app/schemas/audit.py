from datetime import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel
from app.constants.audit_status import AuditStatus
from app.models.audit import VerificationStatus

class CreateAuditCycleRequest(BaseModel):
    name: str
    quarter: str
    department: str
    start_date: datetime
    end_date: datetime
    assigned_auditors: list[str]

class UpdateAuditCycleRequest(BaseModel):
    name: str | None = None
    quarter: str | None = None
    department: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    assigned_auditors: list[str] | None = None
    status: AuditStatus | None = None

class AuditRecordResponse(BaseModel):
    id: PydanticObjectId
    audit_cycle_id: PydanticObjectId
    asset_tag: str
    asset_name: str
    expected_location: str
    current_holder: str
    verification_status: VerificationStatus
    last_verified: datetime | None = None
    auditor_id: PydanticObjectId | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AuditCycleResponse(BaseModel):
    id: PydanticObjectId
    name: str
    quarter: str
    department: str
    start_date: datetime
    end_date: datetime
    assigned_auditors: list[str]
    status: AuditStatus
    created_at: datetime
    updated_at: datetime
    records: list[AuditRecordResponse] = []

    class Config:
        from_attributes = True

class VerifyAssetRequest(BaseModel):
    verification_status: VerificationStatus
    notes: str | None = None
    auditor_id: PydanticObjectId | None = None

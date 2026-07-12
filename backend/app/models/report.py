from datetime import datetime, timezone
from enum import Enum
from beanie import Document, PydanticObjectId
from pydantic import Field

class ReportType(str, Enum):
    ASSET_UTILIZATION = "Asset Utilization"
    DEPARTMENT_ALLOCATION = "Department Allocation"
    MAINTENANCE_TREND = "Maintenance Trend"
    RESOURCE_USAGE = "Resource Usage"
    AUDIT_SUMMARY = "Audit Summary"

class Report(Document):
    name: str
    report_type: ReportType
    filters: dict = Field(default_factory=dict)
    created_by: PydanticObjectId | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reports"

class ReportSnapshot(Document):
    report_id: PydanticObjectId
    snapshot_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    data: dict = Field(default_factory=dict)
    file_url: str | None = None

    class Settings:
        name = "report_snapshots"

class AnalyticsCache(Document):
    key: str
    cached_data: dict
    expires_at: datetime
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "analytics_cache"

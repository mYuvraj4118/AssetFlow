from datetime import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel, Field

class DashboardKPIs(BaseModel):
    total_assets: int
    allocated_assets: int
    available_assets: int
    maintenance_assets: int
    active_bookings: int
    audit_completion: float

class ChartDataNode(BaseModel):
    name: str
    value: float
    color: str | None = None

class DepartmentAnalyticsNode(BaseModel):
    name: str
    count: int
    value: float

class DepartmentAnalytics(BaseModel):
    departments: list[DepartmentAnalyticsNode]

class MaintenanceTrendNode(BaseModel):
    month: str
    cost: float
    count: int

class MaintenanceAnalytics(BaseModel):
    trends: list[MaintenanceTrendNode]

class BookingAnalyticsNode(BaseModel):
    name: str
    hours: float
    bookings: int

class BookingAnalytics(BaseModel):
    bookings: list[BookingAnalyticsNode]

class AuditAnalytics(BaseModel):
    total_audited: int
    pending_audits: int
    discrepancy_count: int
    completion_rate: float

class UpcomingRetirementNode(BaseModel):
    tag: str
    name: str
    retire_date: str
    department: str

class ReportExportRequest(BaseModel):
    report_type: str
    filters: dict = Field(default_factory=dict)
    format: str  # "csv" or "pdf"

class ReportExportResponse(BaseModel):
    success: bool
    message: str
    snapshot_id: PydanticObjectId | None = None
    file_url: str | None = None

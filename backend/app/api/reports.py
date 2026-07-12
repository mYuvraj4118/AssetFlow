from fastapi import APIRouter, status, Query, HTTPException
from app.schemas.report import (
    DashboardKPIs,
    ChartDataNode,
    DepartmentAnalyticsNode,
    MaintenanceTrendNode,
    BookingAnalyticsNode,
    AuditAnalyticsNode,
    UpcomingRetirementNode,
    ReportExportRequest,
    ReportExportResponse,
    AuditAnalytics
)
from app.services.report_service import ReportService

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)

@router.get(
    "/dashboard",
    response_model=DashboardKPIs,
)
async def get_dashboard_kpis() -> DashboardKPIs:
    return await ReportService.get_dashboard_kpis()

@router.get(
    "/assets",
    response_model=list[ChartDataNode],
)
async def get_asset_utilization() -> list[ChartDataNode]:
    return await ReportService.get_asset_utilization()

@router.get(
    "/departments",
    response_model=list[DepartmentAnalyticsNode],
)
async def get_department_analytics() -> list[DepartmentAnalyticsNode]:
    return await ReportService.get_department_analytics()

@router.get(
    "/maintenance",
    response_model=list[MaintenanceTrendNode],
)
async def get_maintenance_analytics() -> list[MaintenanceTrendNode]:
    return await ReportService.get_maintenance_analytics()

@router.get(
    "/bookings",
    response_model=list[BookingAnalyticsNode],
)
async def get_booking_analytics() -> list[BookingAnalyticsNode]:
    return await ReportService.get_booking_analytics()

@router.get(
    "/audits",
    response_model=AuditAnalytics,
)
async def get_audit_analytics() -> AuditAnalytics:
    return await ReportService.get_audit_analytics()

@router.get(
    "/retirement",
    response_model=list[UpcomingRetirementNode],
)
async def get_upcoming_retirement() -> list[UpcomingRetirementNode]:
    return await ReportService.get_upcoming_retirement()

@router.post(
    "/export/csv",
    response_model=ReportExportResponse,
)
async def export_csv(data: ReportExportRequest) -> ReportExportResponse:
    # Handle validations for date ranges
    if "start_date" in data.filters and "end_date" in data.filters:
        if data.filters["start_date"] > data.filters["end_date"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date cannot be greater than end date."
            )
    return await ReportService.export_csv(data.report_type, data.filters)

@router.post(
    "/export/pdf",
    response_model=ReportExportResponse,
)
async def export_pdf(data: ReportExportRequest) -> ReportExportResponse:
    # Handle validations for date ranges
    if "start_date" in data.filters and "end_date" in data.filters:
        if data.filters["start_date"] > data.filters["end_date"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date cannot be greater than end date."
            )
    return await ReportService.export_pdf(data.report_type, data.filters)

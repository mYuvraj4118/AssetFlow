from beanie import PydanticObjectId
from fastapi import APIRouter, status

from app.models.maintenance import MaintenanceRequest
from app.schemas.maintenance import (
    MaintenanceApproval,
    MaintenanceCreate,
    MaintenanceRejection,
    MaintenanceResolution,
    TechnicianAssignment,
)
from app.services.maintenance_service import MaintenanceService


router = APIRouter(
    prefix="/api/v1/maintenance",
    tags=["Maintenance"],
)


@router.post(
    "",
    response_model=MaintenanceRequest,
    status_code=status.HTTP_201_CREATED,
)
async def create_maintenance_request(
    data: MaintenanceCreate,
) -> MaintenanceRequest:
    return await MaintenanceService.create_request(data)


@router.get(
    "",
    response_model=list[MaintenanceRequest],
)
async def get_maintenance_requests() -> list[MaintenanceRequest]:
    return await MaintenanceService.get_all_requests()


@router.get(
    "/{request_id}",
    response_model=MaintenanceRequest,
)
async def get_maintenance_request(
    request_id: PydanticObjectId,
) -> MaintenanceRequest:
    return await MaintenanceService.get_request(request_id)


@router.post(
    "/{request_id}/approve",
    response_model=MaintenanceRequest,
)
async def approve_maintenance_request(
    request_id: PydanticObjectId,
    data: MaintenanceApproval,
) -> MaintenanceRequest:
    return await MaintenanceService.approve_request(
        request_id,
        data,
    )


@router.post(
    "/{request_id}/reject",
    response_model=MaintenanceRequest,
)
async def reject_maintenance_request(
    request_id: PydanticObjectId,
    data: MaintenanceRejection,
) -> MaintenanceRequest:
    return await MaintenanceService.reject_request(
        request_id,
        data,
    )


@router.post(
    "/{request_id}/assign-technician",
    response_model=MaintenanceRequest,
)
async def assign_technician(
    request_id: PydanticObjectId,
    data: TechnicianAssignment,
) -> MaintenanceRequest:
    return await MaintenanceService.assign_technician(
        request_id,
        data,
    )


@router.post(
    "/{request_id}/start",
    response_model=MaintenanceRequest,
)
async def start_maintenance(
    request_id: PydanticObjectId,
) -> MaintenanceRequest:
    return await MaintenanceService.start_work(request_id)


@router.post(
    "/{request_id}/resolve",
    response_model=MaintenanceRequest,
)
async def resolve_maintenance(
    request_id: PydanticObjectId,
    data: MaintenanceResolution,
) -> MaintenanceRequest:
    return await MaintenanceService.resolve_request(
        request_id,
        data,
    )
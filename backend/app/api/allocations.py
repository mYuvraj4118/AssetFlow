from beanie import PydanticObjectId
from fastapi import APIRouter, status

from app.models.allocation import Allocation
from app.schemas.allocation import (
    AllocationCreate,
    ReturnApproval,
    ReturnRequest,
)
from app.services.allocation_service import AllocationService


router = APIRouter(
    prefix="/api/v1/allocations",
    tags=["Allocations"],
)


@router.post(
    "",
    response_model=Allocation,
    status_code=status.HTTP_201_CREATED,
)
async def create_allocation(
    data: AllocationCreate,
) -> Allocation:
    return await AllocationService.create_allocation(data)


@router.get(
    "",
    response_model=list[Allocation],
)
async def get_allocations() -> list[Allocation]:
    return await AllocationService.get_all_allocations()


@router.get(
    "/asset/{asset_id}",
    response_model=Allocation,
)
async def get_asset_allocation(
    asset_id: PydanticObjectId,
) -> Allocation:
    return await AllocationService.get_asset_allocation(asset_id)


@router.get(
    "/{allocation_id}",
    response_model=Allocation,
)
async def get_allocation(
    allocation_id: PydanticObjectId,
) -> Allocation:
    return await AllocationService.get_allocation(allocation_id)


@router.post(
    "/{allocation_id}/return-request",
    response_model=Allocation,
)
async def request_return(
    allocation_id: PydanticObjectId,
    data: ReturnRequest,
) -> Allocation:
    return await AllocationService.request_return(
        allocation_id,
        data,
    )


@router.post(
    "/{allocation_id}/approve-return",
    response_model=Allocation,
)
async def approve_return(
    allocation_id: PydanticObjectId,
    data: ReturnApproval,
) -> Allocation:
    return await AllocationService.approve_return(
        allocation_id,
        data,
    )
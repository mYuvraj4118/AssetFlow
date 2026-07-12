from beanie import PydanticObjectId
from fastapi import APIRouter, status

from app.models.transfer import Transfer
from app.schemas.transfer import (
    TransferApproval,
    TransferCreate,
    TransferRejection,
)
from app.services.transfer_service import TransferService


router = APIRouter(
    prefix="/api/v1/transfers",
    tags=["Transfers"],
)


@router.post(
    "",
    response_model=Transfer,
    status_code=status.HTTP_201_CREATED,
)
async def create_transfer(data: TransferCreate) -> Transfer:
    return await TransferService.create_transfer(data)


@router.get(
    "",
    response_model=list[Transfer],
)
async def get_transfers() -> list[Transfer]:
    return await TransferService.get_all_transfers()


@router.get(
    "/{transfer_id}",
    response_model=Transfer,
)
async def get_transfer(
    transfer_id: PydanticObjectId,
) -> Transfer:
    return await TransferService.get_transfer(transfer_id)


@router.post(
    "/{transfer_id}/approve",
    response_model=Transfer,
)
async def approve_transfer(
    transfer_id: PydanticObjectId,
    data: TransferApproval,
) -> Transfer:
    return await TransferService.approve_transfer(
        transfer_id,
        data,
    )


@router.post(
    "/{transfer_id}/reject",
    response_model=Transfer,
)
async def reject_transfer(
    transfer_id: PydanticObjectId,
    data: TransferRejection,
) -> Transfer:
    return await TransferService.reject_transfer(
        transfer_id,
        data,
    )
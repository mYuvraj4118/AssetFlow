from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.allocation import Allocation, AllocationStatus
from app.models.transfer import Transfer, TransferStatus
from app.schemas.transfer import (
    TransferApproval,
    TransferCreate,
    TransferRejection,
)


class TransferService:

    @staticmethod
    async def create_transfer(data: TransferCreate) -> Transfer:
        if data.from_employee_id == data.to_employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current holder and new holder cannot be the same.",
            )

        # Asset must currently have an active allocation
        allocation = await Allocation.find_one(
            Allocation.asset_id == data.asset_id,
            Allocation.status == AllocationStatus.ACTIVE,
        )

        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asset does not have an active allocation.",
            )

        # Request must match the actual current holder
        if allocation.employee_id != data.from_employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The selected employee is not the current asset holder.",
            )

        # Prevent multiple pending transfer requests for the same asset
        existing_transfer = await Transfer.find_one(
            Transfer.asset_id == data.asset_id,
            Transfer.status == TransferStatus.PENDING,
        )

        if existing_transfer:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A pending transfer request already exists for this asset.",
            )

        transfer = Transfer(**data.model_dump())
        await transfer.insert()

        return transfer

    @staticmethod
    async def get_all_transfers() -> list[Transfer]:
        return await Transfer.find_all().to_list()

    @staticmethod
    async def get_transfer(
        transfer_id: PydanticObjectId,
    ) -> Transfer:
        transfer = await Transfer.get(transfer_id)

        if not transfer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transfer request not found.",
            )

        return transfer

    @staticmethod
    async def approve_transfer(
        transfer_id: PydanticObjectId,
        data: TransferApproval,
    ) -> Transfer:
        transfer = await TransferService.get_transfer(transfer_id)

        if transfer.status != TransferStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending transfer requests can be approved.",
            )

        allocation = await Allocation.find_one(
            Allocation.asset_id == transfer.asset_id,
            Allocation.status == AllocationStatus.ACTIVE,
        )

        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Active allocation no longer exists.",
            )

        if allocation.employee_id != transfer.from_employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Asset holder has changed since the transfer was requested.",
            )

        now = datetime.now(timezone.utc)

        # Reallocate to new employee
        allocation.employee_id = transfer.to_employee_id
        allocation.updated_at = now
        await allocation.save()

        transfer.status = TransferStatus.COMPLETED
        transfer.approved_by = data.approved_by
        transfer.approval_remarks = data.remarks
        transfer.completed_at = now
        transfer.updated_at = now

        await transfer.save()

        return transfer

    @staticmethod
    async def reject_transfer(
        transfer_id: PydanticObjectId,
        data: TransferRejection,
    ) -> Transfer:
        transfer = await TransferService.get_transfer(transfer_id)

        if transfer.status != TransferStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending transfer requests can be rejected.",
            )

        transfer.status = TransferStatus.REJECTED
        transfer.approved_by = data.rejected_by
        transfer.approval_remarks = data.remarks
        transfer.updated_at = datetime.now(timezone.utc)

        await transfer.save()

        return transfer
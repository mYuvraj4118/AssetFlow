from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.allocation import Allocation, AllocationStatus
from app.schemas.allocation import (
    AllocationCreate,
    ReturnRequest,
    ReturnApproval,
)


class AllocationService:

    @staticmethod
    async def create_allocation(data: AllocationCreate) -> Allocation:
        # Prevent double allocation
        existing_allocation = await Allocation.find_one(
            Allocation.asset_id == data.asset_id,
            Allocation.status.in_(
                [
                    AllocationStatus.ACTIVE,
                    AllocationStatus.RETURN_REQUESTED,
                ]
            ),
        )

        if existing_allocation:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Asset is already allocated.",
            )

        # Validate expected return date
        if (
            data.expected_return_date
            and data.expected_return_date <= datetime.now(timezone.utc)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expected return date must be in the future.",
            )

        allocation = Allocation(**data.model_dump())

        await allocation.insert()

        return allocation

    @staticmethod
    async def get_all_allocations() -> list[Allocation]:
        return await Allocation.find_all().to_list()

    @staticmethod
    async def get_allocation(
        allocation_id: PydanticObjectId,
    ) -> Allocation:
        allocation = await Allocation.get(allocation_id)

        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allocation not found.",
            )

        return allocation

    @staticmethod
    async def get_asset_allocation(
        asset_id: PydanticObjectId,
    ) -> Allocation:
        allocation = await Allocation.find_one(
            Allocation.asset_id == asset_id,
            Allocation.status.in_(
                [
                    AllocationStatus.ACTIVE,
                    AllocationStatus.RETURN_REQUESTED,
                ]
            ),
        )

        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active allocation found for this asset.",
            )

        return allocation

    @staticmethod
    async def request_return(
        allocation_id: PydanticObjectId,
        data: ReturnRequest,
    ) -> Allocation:
        allocation = await AllocationService.get_allocation(
            allocation_id
        )

        if allocation.status != AllocationStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only active allocations can request a return.",
            )

        allocation.status = AllocationStatus.RETURN_REQUESTED
        allocation.return_notes = data.return_notes
        allocation.updated_at = datetime.now(timezone.utc)

        await allocation.save()

        return allocation

    @staticmethod
    async def approve_return(
        allocation_id: PydanticObjectId,
        data: ReturnApproval,
    ) -> Allocation:
        allocation = await AllocationService.get_allocation(
            allocation_id
        )

        if allocation.status != AllocationStatus.RETURN_REQUESTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return has not been requested for this allocation.",
            )

        allocation.status = AllocationStatus.RETURNED
        allocation.actual_return_date = datetime.now(timezone.utc)
        allocation.condition_at_return = data.condition_at_return
        allocation.return_notes = data.return_notes
        allocation.updated_at = datetime.now(timezone.utc)

        await allocation.save()

        return allocation
from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.maintenance import (
    MaintenanceRequest,
    MaintenanceStatus,
)
from app.schemas.maintenance import (
    MaintenanceApproval,
    MaintenanceCreate,
    MaintenanceRejection,
    MaintenanceResolution,
    TechnicianAssignment,
)


class MaintenanceService:

    @staticmethod
    async def create_request(
        data: MaintenanceCreate,
    ) -> MaintenanceRequest:

        # Prevent multiple active maintenance requests
        # for the same asset.
        existing_request = await MaintenanceRequest.find_one(
            {
                "asset_id": data.asset_id,
                "status": {
                    "$in": [
                        MaintenanceStatus.PENDING.value,
                        MaintenanceStatus.APPROVED.value,
                        MaintenanceStatus.TECHNICIAN_ASSIGNED.value,
                        MaintenanceStatus.IN_PROGRESS.value,
                    ]
                },
            }
        )

        if existing_request:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "An active maintenance request already "
                    "exists for this asset."
                ),
            )

        maintenance_request = MaintenanceRequest(
            **data.model_dump()
        )

        await maintenance_request.insert()

        return maintenance_request

    @staticmethod
    async def get_all_requests() -> list[MaintenanceRequest]:
        return await MaintenanceRequest.find_all().to_list()

    @staticmethod
    async def get_request(
        request_id: PydanticObjectId,
    ) -> MaintenanceRequest:

        maintenance_request = await MaintenanceRequest.get(
            request_id
        )

        if not maintenance_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Maintenance request not found.",
            )

        return maintenance_request

    @staticmethod
    async def approve_request(
        request_id: PydanticObjectId,
        data: MaintenanceApproval,
    ) -> MaintenanceRequest:

        maintenance_request = (
            await MaintenanceService.get_request(request_id)
        )

        if maintenance_request.status != MaintenanceStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending requests can be approved.",
            )

        maintenance_request.status = MaintenanceStatus.APPROVED
        maintenance_request.approved_by = data.approved_by
        maintenance_request.approval_remarks = data.remarks
        maintenance_request.updated_at = datetime.now(timezone.utc)

        await maintenance_request.save()

        return maintenance_request

    @staticmethod
    async def reject_request(
        request_id: PydanticObjectId,
        data: MaintenanceRejection,
    ) -> MaintenanceRequest:

        maintenance_request = (
            await MaintenanceService.get_request(request_id)
        )

        if maintenance_request.status != MaintenanceStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending requests can be rejected.",
            )

        maintenance_request.status = MaintenanceStatus.REJECTED
        maintenance_request.approved_by = data.rejected_by
        maintenance_request.approval_remarks = data.remarks
        maintenance_request.updated_at = datetime.now(timezone.utc)

        await maintenance_request.save()

        return maintenance_request

    @staticmethod
    async def assign_technician(
        request_id: PydanticObjectId,
        data: TechnicianAssignment,
    ) -> MaintenanceRequest:

        maintenance_request = (
            await MaintenanceService.get_request(request_id)
        )

        if maintenance_request.status != MaintenanceStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A technician can only be assigned "
                    "to an approved request."
                ),
            )

        maintenance_request.technician_id = data.technician_id
        maintenance_request.status = (
            MaintenanceStatus.TECHNICIAN_ASSIGNED
        )
        maintenance_request.updated_at = datetime.now(timezone.utc)

        await maintenance_request.save()

        return maintenance_request

    @staticmethod
    async def start_work(
        request_id: PydanticObjectId,
    ) -> MaintenanceRequest:

        maintenance_request = (
            await MaintenanceService.get_request(request_id)
        )

        if (
            maintenance_request.status
            != MaintenanceStatus.TECHNICIAN_ASSIGNED
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Maintenance can only start after "
                    "a technician has been assigned."
                ),
            )

        maintenance_request.status = MaintenanceStatus.IN_PROGRESS
        maintenance_request.updated_at = datetime.now(timezone.utc)

        await maintenance_request.save()

        return maintenance_request

    @staticmethod
    async def resolve_request(
        request_id: PydanticObjectId,
        data: MaintenanceResolution,
    ) -> MaintenanceRequest:

        maintenance_request = (
            await MaintenanceService.get_request(request_id)
        )

        if (
            maintenance_request.status
            != MaintenanceStatus.IN_PROGRESS
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Only maintenance requests in progress "
                    "can be resolved."
                ),
            )

        now = datetime.now(timezone.utc)

        maintenance_request.status = MaintenanceStatus.RESOLVED
        maintenance_request.resolution_remarks = data.remarks
        maintenance_request.resolved_at = now
        maintenance_request.updated_at = now

        await maintenance_request.save()

        return maintenance_request
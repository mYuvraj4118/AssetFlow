from beanie import PydanticObjectId
from pydantic import BaseModel, Field

from app.models.maintenance import MaintenancePriority


class MaintenanceCreate(BaseModel):
    asset_id: PydanticObjectId
    raised_by: PydanticObjectId

    issue: str = Field(
        min_length=1,
        max_length=200,
    )

    priority: MaintenancePriority

    description: str = Field(
        min_length=1,
        max_length=2000,
    )

    photo_url: str | None = None


class MaintenanceApproval(BaseModel):
    approved_by: PydanticObjectId

    remarks: str | None = Field(
        default=None,
        max_length=1000,
    )


class MaintenanceRejection(BaseModel):
    rejected_by: PydanticObjectId

    remarks: str = Field(
        min_length=1,
        max_length=1000,
    )


class TechnicianAssignment(BaseModel):
    technician_id: PydanticObjectId


class MaintenanceResolution(BaseModel):
    resolved_by: PydanticObjectId

    remarks: str = Field(
        min_length=1,
        max_length=2000,
    )
from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class TransferCreate(BaseModel):
    asset_id: PydanticObjectId
    from_employee_id: PydanticObjectId
    to_employee_id: PydanticObjectId
    requested_by: PydanticObjectId

    reason: str = Field(
        min_length=1,
        max_length=1000,
    )


class TransferApproval(BaseModel):
    approved_by: PydanticObjectId

    remarks: str | None = Field(
        default=None,
        max_length=1000,
    )


class TransferRejection(BaseModel):
    rejected_by: PydanticObjectId

    remarks: str = Field(
        min_length=1,
        max_length=1000,
    )
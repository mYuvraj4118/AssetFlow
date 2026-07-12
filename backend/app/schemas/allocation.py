from datetime import datetime

from beanie import PydanticObjectId
from pydantic import BaseModel, Field, model_validator


class AllocationCreate(BaseModel):
    asset_id: PydanticObjectId
    employee_id: PydanticObjectId
    department_id: PydanticObjectId | None = None
    allocated_by: PydanticObjectId

    expected_return_date: datetime | None = None

    condition_at_allocation: str | None = Field(
        default=None,
        max_length=100
    )

    allocation_notes: str | None = Field(
        default=None,
        max_length=1000
    )


class ReturnRequest(BaseModel):
    requested_by: PydanticObjectId
    return_notes: str | None = Field(
        default=None,
        max_length=1000
    )


class ReturnApproval(BaseModel):
    approved_by: PydanticObjectId

    condition_at_return: str = Field(
        min_length=1,
        max_length=100
    )

    return_notes: str | None = Field(
        default=None,
        max_length=1000
    )


class AllocationResponse(BaseModel):
    id: PydanticObjectId
    asset_id: PydanticObjectId
    employee_id: PydanticObjectId
    department_id: PydanticObjectId | None
    status: str
    allocation_date: datetime
    expected_return_date: datetime | None
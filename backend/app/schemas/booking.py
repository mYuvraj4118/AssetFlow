from datetime import datetime

from beanie import PydanticObjectId
from pydantic import BaseModel, Field, model_validator


class BookingCreate(BaseModel):
    resource_id: PydanticObjectId
    employee_id: PydanticObjectId
    department_id: PydanticObjectId | None = None

    start_time: datetime
    end_time: datetime

    purpose: str = Field(
        min_length=1,
        max_length=500,
    )

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time <= self.start_time:
            raise ValueError(
                "End time must be after start time."
            )

        return self


class BookingReschedule(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time <= self.start_time:
            raise ValueError(
                "End time must be after start time."
            )

        return self
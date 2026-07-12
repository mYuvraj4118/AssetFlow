from __future__ import annotations

import re
from datetime import datetime
from enum import Enum
from typing import Annotated, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DepartmentStatus(str, Enum):
    """Enumeration of supported department statuses."""

    ACTIVE = "Active"
    INACTIVE = "Inactive"


class DepartmentBase(BaseModel):
    """Base schema for department creation and update operations.

    This schema defines the shared department fields used by both
    creation and response models.
    """

    model_config = ConfigDict(from_attributes=True)

    name: Annotated[
        str,
        Field(
            ...,
            description="Department name.",
            example="Finance",
            min_length=1,
            max_length=100,
        ),
    ]
    code: Annotated[
        str,
        Field(
            ...,
            description="Department code using uppercase letters, numbers, and underscores only.",
            example="FINANCE_01",
            min_length=1,
            max_length=20,
            pattern=r"^[A-Z0-9_]+$",
        ),
    ]
    description: Optional[Annotated[
        str,
        Field(
            None,
            description="Optional department description.",
            example="Corporate finance and accounting team.",
            max_length=500,
        ),
    ]] = None
    parent_department_id: Optional[Annotated[
        int,
        Field(
            None,
            description="Identifier of the parent department.",
            example=1,
        ),
    ]] = None
    manager_id: Optional[Annotated[
        int,
        Field(
            None,
            description="Identifier of the department manager.",
            example=42,
        ),
    ]] = None
    status: Annotated[
        DepartmentStatus,
        Field(
            DepartmentStatus.ACTIVE,
            description="Department operational status.",
            example=DepartmentStatus.ACTIVE.value,
        ),
    ] = DepartmentStatus.ACTIVE

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Department name must not be empty.")
        return name

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        if not re.fullmatch(r"[A-Z0-9_]+", value):
            raise ValueError(
                "Department code must contain only uppercase letters, numbers, and underscores."
            )
        return value


class DepartmentCreate(DepartmentBase):
    """Schema for creating a new department."""

    pass


class DepartmentUpdate(BaseModel):
    """Schema for partial department updates.

    All fields are optional to support patch-style updates.
    """

    model_config = ConfigDict(from_attributes=True)

    name: Optional[Annotated[
        str,
        Field(
            None,
            description="Department name.",
            example="Finance",
            min_length=1,
            max_length=100,
        ),
    ]] = None
    code: Optional[Annotated[
        str,
        Field(
            None,
            description="Department code using uppercase letters, numbers, and underscores only.",
            example="FINANCE_01",
            min_length=1,
            max_length=20,
            pattern=r"^[A-Z0-9_]+$",
        ),
    ]] = None
    description: Optional[Annotated[
        str,
        Field(
            None,
            description="Optional department description.",
            example="Corporate finance and accounting team.",
            max_length=500,
        ),
    ]] = None
    parent_department_id: Optional[Annotated[
        int,
        Field(
            None,
            description="Identifier of the parent department.",
            example=1,
        ),
    ]] = None
    manager_id: Optional[Annotated[
        int,
        Field(
            None,
            description="Identifier of the department manager.",
            example=42,
        ),
    ]] = None
    status: Optional[Annotated[
        DepartmentStatus,
        Field(
            None,
            description="Department operational status.",
            example=DepartmentStatus.ACTIVE.value,
        ),
    ]] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        name = value.strip()
        if not name:
            raise ValueError("Department name must not be empty.")
        return name

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if not re.fullmatch(r"[A-Z0-9_]+", value):
            raise ValueError(
                "Department code must contain only uppercase letters, numbers, and underscores."
            )
        return value


class DepartmentResponse(DepartmentBase):
    """Schema returned when a single department is retrieved."""

    id: Annotated[
        int,
        Field(
            ..., description="Unique department identifier.", example=10,
        ),
    ]
    created_at: Annotated[
        datetime,
        Field(
            ...,
            description="Timestamp when the department was created.",
            example="2026-01-01T12:00:00Z",
        ),
    ]
    updated_at: Annotated[
        datetime,
        Field(
            ...,
            description="Timestamp when the department was last updated.",
            example="2026-02-01T12:00:00Z",
        ),
    ]


class DepartmentListResponse(BaseModel):
    """Schema returned for paginated department listings."""

    model_config = ConfigDict(from_attributes=True)

    total: Annotated[
        int,
        Field(..., description="Total number of departments.", example=100, ge=0),
    ]
    page: Annotated[
        int,
        Field(..., description="Current page number.", example=1, ge=1),
    ]
    page_size: Annotated[
        int,
        Field(..., description="Number of departments per page.", example=25, ge=1),
    ]
    items: Annotated[
        List[DepartmentResponse],
        Field(..., description="List of department items on the current page."),
    ]

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    """MongoDB ObjectId wrapper built for Pydantic v2 validation."""

    @classmethod
    def __get_pydantic_core_schema__(cls, source, handler):
        def validate_object_id(value: Any) -> "PyObjectId":
            if isinstance(value, ObjectId):
                return cls(value)
            if isinstance(value, str) and ObjectId.is_valid(value):
                return cls(value)
            raise TypeError("Invalid ObjectId")

        return core_schema.no_info_after_validator_function(
            core_schema.union_schema([
                core_schema.str_schema(),
                core_schema.is_instance_schema(ObjectId),
            ]),
            validate_object_id,
        )

    @classmethod
    def __modify_schema__(cls, field_schema: Dict[str, Any]) -> None:
        field_schema.update(type="string", format="objectid")


class DepartmentStatus(str, Enum):
    """Status values permitted for a department record."""

    ACTIVE = "Active"
    INACTIVE = "Inactive"


class Department(BaseModel):
    """Department schema for the ERP AssetFlow asset management system."""

    id: PyObjectId = Field(
        default_factory=PyObjectId,
        alias="_id",
        description="MongoDB document primary key.",
    )
    name: str = Field(
        ..., min_length=1, max_length=128, description="Human-readable department name."
    )
    code: str = Field(
        ...,
        min_length=2,
        max_length=32,
        regex=r"^[A-Z0-9_-]+$",
        description="Uppercase identifier used for department lookup and reporting.",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=512,
        description="Optional department description.",
    )
    parent_department_id: Optional[PyObjectId] = Field(
        default=None,
        description="Reference to the parent department, if any.",
    )
    manager_id: Optional[PyObjectId] = Field(
        default=None,
        description="Reference to the manager assigned to the department.",
    )
    status: DepartmentStatus = Field(
        default=DepartmentStatus.ACTIVE,
        description="Operational status of the department.",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp for the department record.",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last updated timestamp for the department record.",
    )
    created_by: Optional[PyObjectId] = Field(
        default=None,
        description="User reference that created the department.",
    )
    updated_by: Optional[PyObjectId] = Field(
        default=None,
        description="User reference that last updated the department.",
    )
    is_deleted: bool = Field(
        default=False,
        description="Soft delete marker used to preserve historical department records.",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible metadata bag for custom department attributes.",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        extra="forbid",
        anystr_strip_whitespace=True,
    )

    @field_validator("name")
    def validate_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Department name must not be empty.")
        return normalized

    @field_validator("code")
    def validate_code(cls, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized:
            raise ValueError("Department code must not be empty.")
        return normalized

    @field_validator("description")
    def validate_description(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip()
        return normalized if normalized else None

    @field_validator("created_at", "updated_at", mode="before")
    def parse_timestamp(cls, value: Union[str, datetime]) -> datetime:
        if isinstance(value, datetime):
            return value
        return datetime.fromisoformat(value)

    @classmethod
    def collection_name(cls) -> str:
        """Return the MongoDB collection name for department documents."""
        return "departments"

    @classmethod
    def index_definitions(cls) -> list[dict[str, Any]]:
        """Return index definitions used when configuring the MongoDB collection."""
        return [
            {"keys": [("code", 1)], "kwargs": {"unique": True, "background": True}},
            {"keys": [("name", 1)], "kwargs": {"background": True}},
            {"keys": [("parent_department_id", 1)], "kwargs": {"background": True}},
            {"keys": [("is_deleted", 1)], "kwargs": {"background": True}},
        ]

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        """Return a MongoDB-friendly dictionary representation of the department."""
        kwargs.setdefault("by_alias", True)
        kwargs.setdefault("exclude_none", True)
        return super().model_dump(*args, **kwargs)

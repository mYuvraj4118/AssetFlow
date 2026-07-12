from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import AssetCondition, AssetStatus


class AssetBase(BaseModel):
    """Base schema for asset objects."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


class AssetCreate(AssetBase):
    """Schema for registering a new asset."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Human-readable asset name.",
    )
    category_id: str = Field(
        ...,
        description="MongoDB ObjectID reference string to Category.",
    )
    serial_number: Optional[str] = Field(
        default=None,
        description="Unique serial number if provided.",
    )
    acquisition_date: Optional[datetime] = Field(
        default=None,
        description="Acquisition date of the asset.",
    )
    acquisition_cost: Optional[float] = Field(
        default=None,
        description="Acquisition cost of the asset.",
    )
    condition: AssetCondition = Field(
        default=AssetCondition.GOOD,
        description="Physical condition of the asset.",
    )
    department_id: Optional[str] = Field(
        default=None,
        description="MongoDB ObjectID reference string to Department.",
    )
    location: Optional[str] = Field(
        default=None,
        description="Optional location of the asset.",
    )
    is_shared_resource: bool = Field(
        default=False,
        description="Whether this asset can be booked/shared.",
    )
    photo_url: Optional[str] = Field(
        default=None,
        description="Optional image URL of the asset.",
    )
    document_urls: list[str] = Field(
        default_factory=list,
        description="Optional list of document URLs.",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Asset name must not be empty")
        return value

    @field_validator("acquisition_cost")
    @classmethod
    def validate_cost(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value < 0:
            raise ValueError("acquisition_cost must not be negative")
        return value

    @field_validator("serial_number")
    @classmethod
    def validate_serial(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value if value else None


class AssetUpdate(AssetBase):
    """Schema for updating an existing asset."""

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=128,
        description="Human-readable asset name.",
    )
    category_id: Optional[str] = Field(
        default=None,
        description="MongoDB ObjectID reference string to Category.",
    )
    serial_number: Optional[str] = Field(
        default=None,
        description="Unique serial number if provided.",
    )
    acquisition_date: Optional[datetime] = Field(
        default=None,
        description="Acquisition date of the asset.",
    )
    acquisition_cost: Optional[float] = Field(
        default=None,
        description="Acquisition cost of the asset.",
    )
    condition: Optional[AssetCondition] = Field(
        default=None,
        description="Physical condition of the asset.",
    )
    department_id: Optional[str] = Field(
        default=None,
        description="MongoDB ObjectID reference string to Department.",
    )
    location: Optional[str] = Field(
        default=None,
        description="Optional location of the asset.",
    )
    is_shared_resource: Optional[bool] = Field(
        default=None,
        description="Whether this asset can be booked/shared.",
    )
    photo_url: Optional[str] = Field(
        default=None,
        description="Optional image URL of the asset.",
    )
    document_urls: Optional[list[str]] = Field(
        default=None,
        description="Optional list of document URLs.",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Asset name must not be empty")
        return value

    @field_validator("acquisition_cost")
    @classmethod
    def validate_cost(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value < 0:
            raise ValueError("acquisition_cost must not be negative")
        return value

    @field_validator("serial_number")
    @classmethod
    def validate_serial(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value if value else None


class AssetResponse(AssetBase):
    """Schema for public asset representation."""

    id: str = Field(..., alias="id")
    asset_tag: str
    name: str
    category_id: str
    serial_number: Optional[str] = None
    acquisition_date: Optional[datetime] = None
    acquisition_cost: Optional[float] = None
    condition: AssetCondition
    department_id: Optional[str] = None
    location: Optional[str] = None
    status: AssetStatus
    is_shared_resource: bool
    photo_url: Optional[str] = None
    document_urls: list[str] = []
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    is_deleted: bool


class AssetListResponse(AssetBase):
    """Schema for paginated asset lists."""

    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[AssetResponse]


class AssetStatusUpdate(AssetBase):
    """Schema for requesting a lifecycle status transition."""

    status: AssetStatus = Field(
        ...,
        description="Target status for the lifecycle transition.",
    )

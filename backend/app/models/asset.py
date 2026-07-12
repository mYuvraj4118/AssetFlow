from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import AssetCondition, AssetStatus
from app.models.department import PyObjectId


class Asset(BaseModel):
    """Asset data model for the ERP AssetFlow system."""

    id: PyObjectId = Field(
        default_factory=PyObjectId,
        alias="_id",
        description="MongoDB document primary key.",
    )
    asset_tag: str = Field(
        ...,
        description="Backend-generated unique sequential identifier.",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Human-readable asset name.",
    )
    category_id: PyObjectId = Field(
        ...,
        description="Reference to Category.",
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
    department_id: Optional[PyObjectId] = Field(
        default=None,
        description="Reference to Department.",
    )
    location: Optional[str] = Field(
        default=None,
        description="Optional location of the asset.",
    )
    status: AssetStatus = Field(
        default=AssetStatus.AVAILABLE,
        description="Lifecycle status of the asset.",
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
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp.",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp.",
    )
    created_by: Optional[PyObjectId] = Field(
        default=None,
        description="User who created the record.",
    )
    updated_by: Optional[PyObjectId] = Field(
        default=None,
        description="User who last updated the record.",
    )
    is_deleted: bool = Field(
        default=False,
        description="Soft deletion flag.",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        extra="ignore",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Asset name must not be empty.")
        return normalized

    @field_validator("serial_number")
    @classmethod
    def validate_serial_number(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip()
        return normalized if normalized else None

    @field_validator("acquisition_cost")
    @classmethod
    def validate_cost(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value < 0:
            raise ValueError("Acquisition cost must not be negative")
        return value

    @field_validator("created_at", "updated_at", "acquisition_date", mode="before")
    @classmethod
    def parse_timestamp(cls, value: Union[str, datetime, None]) -> Optional[datetime]:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        return datetime.fromisoformat(value)

    @classmethod
    def collection_name(cls) -> str:
        """Return the MongoDB collection name for asset documents."""
        return "assets"

    @classmethod
    def index_definitions(cls) -> list[dict[str, Any]]:
        """Return index definitions used when configuring the MongoDB collection."""
        return [
            {"keys": [("asset_tag", 1)], "kwargs": {"unique": True, "background": True}},
            {
                "keys": [("serial_number", 1)],
                "kwargs": {
                    "unique": True,
                    "background": True,
                    "partialFilterExpression": {"serial_number": {"$type": "string"}},
                },
            },
            {"keys": [("category_id", 1)], "kwargs": {"background": True}},
            {"keys": [("department_id", 1)], "kwargs": {"background": True}},
            {"keys": [("status", 1)], "kwargs": {"background": True}},
            {"keys": [("location", 1)], "kwargs": {"background": True}},
            {"keys": [("is_shared_resource", 1)], "kwargs": {"background": True}},
            {"keys": [("created_at", 1)], "kwargs": {"background": True}},
            {"keys": [("is_deleted", 1)], "kwargs": {"background": True}},
        ]

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        """Return a MongoDB-friendly dictionary representation of the asset."""
        kwargs.setdefault("by_alias", True)
        kwargs.setdefault("exclude_none", True)
        return super().model_dump(*args, **kwargs)

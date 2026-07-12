from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional, Union

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import AssetStatus
from app.models.department import PyObjectId


class HistoryEventType(str, Enum):
    REGISTERED = "REGISTERED"
    UPDATED = "UPDATED"
    STATUS_CHANGED = "STATUS_CHANGED"
    ALLOCATED = "ALLOCATED"
    TRANSFERRED = "TRANSFERRED"
    RETURNED = "RETURNED"
    MAINTENANCE_STARTED = "MAINTENANCE_STARTED"
    MAINTENANCE_RESOLVED = "MAINTENANCE_RESOLVED"
    AUDIT_VERIFIED = "AUDIT_VERIFIED"
    MARKED_LOST = "MARKED_LOST"
    RETIRED = "RETIRED"
    DISPOSED = "DISPOSED"
    DELETED = "DELETED"
    RESTORED = "RESTORED"


class AssetHistory(BaseModel):
    """Asset audit history log model."""

    id: PyObjectId = Field(
        default_factory=PyObjectId,
        alias="_id",
        description="MongoDB document primary key.",
    )
    asset_id: PyObjectId = Field(
        ...,
        description="Reference to the affected asset.",
    )
    event_type: HistoryEventType = Field(
        ...,
        description="The type of event that occurred.",
    )
    description: str = Field(
        ...,
        description="Human-readable description of the action.",
    )
    previous_status: Optional[AssetStatus] = Field(
        default=None,
        description="Asset status prior to this event, if changed.",
    )
    new_status: Optional[AssetStatus] = Field(
        default=None,
        description="Asset status following this event, if changed.",
    )
    performed_by: Optional[PyObjectId] = Field(
        default=None,
        description="Reference to the Employee who performed the action.",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible metadata block for custom parameters.",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the history event was recorded.",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        extra="ignore",
    )

    @field_validator("created_at", mode="before")
    @classmethod
    def parse_timestamp(cls, value: Union[str, datetime]) -> datetime:
        if isinstance(value, datetime):
            return value
        return datetime.fromisoformat(value)

    @classmethod
    def collection_name(cls) -> str:
        """Return the MongoDB collection name for history documents."""
        return "asset_history"

    @classmethod
    def index_definitions(cls) -> list[dict[str, Any]]:
        """Return index definitions used for optimization."""
        return [
            {"keys": [("asset_id", 1)], "kwargs": {"background": True}},
            {"keys": [("event_type", 1)], "kwargs": {"background": True}},
            {"keys": [("created_at", 1)], "kwargs": {"background": True}},
        ]

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        """Return a MongoDB-friendly dictionary representation of the history."""
        kwargs.setdefault("by_alias", True)
        kwargs.setdefault("exclude_none", True)
        return super().model_dump(*args, **kwargs)

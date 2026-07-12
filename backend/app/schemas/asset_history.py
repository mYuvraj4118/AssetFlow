from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.constants import AssetStatus
from app.models.asset_history import HistoryEventType


class AssetHistoryBase(BaseModel):
    """Base schema for asset history logs."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


class AssetHistoryResponse(AssetHistoryBase):
    """Response schema for asset history logs."""

    id: str = Field(..., alias="id")
    asset_id: str
    event_type: HistoryEventType
    description: str
    previous_status: Optional[AssetStatus] = None
    new_status: Optional[AssetStatus] = None
    performed_by: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime

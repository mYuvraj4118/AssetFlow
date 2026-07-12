from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection

from app.constants import AssetStatus
from app.database.mongodb import get_database
from app.models.asset_history import HistoryEventType


class AssetHistoryService:
    """Service layer for asset history and audit logs."""

    def __init__(self) -> None:
        database = get_database()
        self.collection: AsyncIOMotorCollection = database.get_collection("asset_history")

    async def log_event(
        self,
        asset_id: str,
        event_type: HistoryEventType,
        description: str,
        previous_status: Optional[AssetStatus] = None,
        new_status: Optional[AssetStatus] = None,
        performed_by: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log a historical event for an asset.

        Args:
            asset_id: The ID of the asset.
            event_type: The history event type.
            description: Description of what occurred.
            previous_status: Previous status if status changed.
            new_status: Target status if status changed.
            performed_by: Employee ID of the user performing the action.
            metadata: Extensible key-value metadata.
        """
        now = datetime.utcnow()
        document: Dict[str, Any] = {
            "asset_id": ObjectId(asset_id),
            "event_type": event_type.value if hasattr(event_type, "value") else event_type,
            "description": description,
            "previous_status": previous_status.value if previous_status and hasattr(previous_status, "value") else (previous_status if previous_status else None),
            "new_status": new_status.value if new_status and hasattr(new_status, "value") else (new_status if new_status else None),
            "performed_by": ObjectId(performed_by) if performed_by else None,
            "metadata": metadata or {},
            "created_at": now,
        }
        await self.collection.insert_one(document)

    async def get_history_by_asset_id(self, asset_id: str) -> List[Dict[str, Any]]:
        """Retrieve all history events for a given asset, sorted by timestamp descending."""
        cursor = self.collection.find({"asset_id": ObjectId(asset_id)}).sort("created_at", -1)
        return [doc async for doc in cursor]

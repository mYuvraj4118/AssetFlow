from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorCollection

from app.constants import AssetCondition, AssetStatus
from app.database.mongodb import get_database
from app.models.asset_history import HistoryEventType
from app.schemas.asset import (
    AssetCreate,
    AssetListResponse,
    AssetResponse,
    AssetUpdate,
)
from app.services.asset_history_service import AssetHistoryService
from app.services.department_service import DepartmentService
from app.utils.asset_tag import generate_next_asset_tag


class AssetService:
    """Service layer for asset lifecycle and management operations."""

    # Centralized lifecycle transition map
    # Transitions map enums to allowed target enums
    LIFECYCLE_TRANSITIONS = {
        AssetStatus.AVAILABLE: {
            AssetStatus.ALLOCATED,
            AssetStatus.RESERVED,
            AssetStatus.UNDER_MAINTENANCE,
            AssetStatus.LOST,
            AssetStatus.RETIRED,
        },
        AssetStatus.ALLOCATED: {
            AssetStatus.AVAILABLE,
            AssetStatus.UNDER_MAINTENANCE,
            AssetStatus.LOST,
        },
        AssetStatus.RESERVED: {
            AssetStatus.AVAILABLE,
            AssetStatus.ALLOCATED,
        },
        AssetStatus.UNDER_MAINTENANCE: {
            AssetStatus.AVAILABLE,
            AssetStatus.RETIRED,
        },
        AssetStatus.LOST: {
            AssetStatus.AVAILABLE,
            AssetStatus.RETIRED,
        },
        AssetStatus.RETIRED: {
            AssetStatus.DISPOSED,
        },
        AssetStatus.DISPOSED: set(),
    }

    def __init__(self) -> None:
        database = get_database()
        self.collection: AsyncIOMotorCollection = database.get_collection("assets")
        self.history_service = AssetHistoryService()

    async def create_asset(self, asset_data: AssetCreate, performed_by: Optional[str] = None) -> AssetResponse:
        """Register a new asset.

        Args:
            asset_data: AssetCreate schema containing registration details.
            performed_by: User ID of the employee performing registration.
        """
        # Validate serial number uniqueness
        if asset_data.serial_number:
            await self._ensure_unique_serial(asset_data.serial_number)

        # Validate category_id (must be valid ObjectId format)
        self._validate_object_id(asset_data.category_id, "category_id")

        # Validate department_id if provided
        if asset_data.department_id:
            dep_id = self._validate_object_id(asset_data.department_id, "department_id")
            try:
                await DepartmentService().get_department_by_id(str(dep_id))
            except HTTPException as exc:
                if exc.status_code == status.HTTP_404_NOT_FOUND:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Department with ID {asset_data.department_id} not found."
                    )
                raise

        # Generate atomic sequential asset tag
        database = get_database()
        asset_tag = await generate_next_asset_tag(database)

        now = datetime.now(timezone.utc)
        document: Dict[str, Any] = {
            "asset_tag": asset_tag,
            "name": asset_data.name,
            "category_id": ObjectId(asset_data.category_id),
            "serial_number": asset_data.serial_number,
            "acquisition_date": asset_data.acquisition_date,
            "acquisition_cost": asset_data.acquisition_cost,
            "condition": asset_data.condition.value if hasattr(asset_data.condition, "value") else asset_data.condition,
            "department_id": ObjectId(asset_data.department_id) if asset_data.department_id else None,
            "location": asset_data.location,
            "status": AssetStatus.AVAILABLE.value,
            "is_shared_resource": asset_data.is_shared_resource,
            "photo_url": asset_data.photo_url,
            "document_urls": asset_data.document_urls or [],
            "created_at": now,
            "updated_at": now,
            "created_by": ObjectId(performed_by) if performed_by else None,
            "updated_by": ObjectId(performed_by) if performed_by else None,
            "is_deleted": False,
        }

        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id

        # Log Registered history event
        await self.history_service.log_event(
            asset_id=str(document["_id"]),
            event_type=HistoryEventType.REGISTERED,
            description=f"Asset registered with tag {asset_tag}.",
            new_status=AssetStatus.AVAILABLE,
            performed_by=performed_by,
        )

        return self._build_asset_response(document)

    async def get_asset_by_id(self, asset_id: str, include_deleted: bool = False) -> AssetResponse:
        """Retrieve an asset by its ID, excluding soft deleted records by default."""
        query: Dict[str, Any] = {"_id": self._validate_object_id(asset_id, "asset_id")}
        if not include_deleted:
            query["is_deleted"] = False

        document = await self.collection.find_one(query)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
        return self._build_asset_response(document)

    async def get_asset_by_tag(self, asset_tag: str, include_deleted: bool = False) -> AssetResponse:
        """Retrieve an asset by its tag, excluding soft deleted records by default."""
        query: Dict[str, Any] = {"asset_tag": asset_tag}
        if not include_deleted:
            query["is_deleted"] = False

        document = await self.collection.find_one(query)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
        return self._build_asset_response(document)

    async def get_asset_by_serial_number(self, serial_number: str, include_deleted: bool = False) -> Optional[AssetResponse]:
        """Retrieve an asset by its serial number, excluding soft deleted records by default."""
        query: Dict[str, Any] = {"serial_number": serial_number}
        if not include_deleted:
            query["is_deleted"] = False

        document = await self.collection.find_one(query)
        return self._build_asset_response(document) if document else None

    async def list_assets(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category_id: Optional[str] = None,
        department_id: Optional[str] = None,
        status_filter: Optional[AssetStatus] = None,
        condition: Optional[AssetCondition] = None,
        location: Optional[str] = None,
        is_shared_resource: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> AssetListResponse:
        """Retrieve a paginated list of assets with search, filters, sorting, and pagination."""
        # Enforce page size bounds
        page_size = max(1, min(100, page_size))
        page = max(1, page)

        filters: Dict[str, Any] = {"is_deleted": False}

        # Search query across: name, tag, serial number, location
        if search:
            escaped_search = re.escape(search.strip())
            filters["$or"] = [
                {"name": {"$regex": escaped_search, "$options": "i"}},
                {"asset_tag": {"$regex": escaped_search, "$options": "i"}},
                {"serial_number": {"$regex": escaped_search, "$options": "i"}},
                {"location": {"$regex": escaped_search, "$options": "i"}},
            ]

        # Apply specific filters
        if category_id:
            filters["category_id"] = self._validate_object_id(category_id, "category_id")
        if department_id:
            filters["department_id"] = self._validate_object_id(department_id, "department_id")
        if status_filter:
            filters["status"] = status_filter.value if hasattr(status_filter, "value") else status_filter
        if condition:
            filters["condition"] = condition.value if hasattr(condition, "value") else condition
        if location:
            filters["location"] = {"$regex": re.escape(location.strip()), "$options": "i"}
        if is_shared_resource is not None:
            filters["is_shared_resource"] = is_shared_resource

        # Controlled sorting fields
        allowed_sort_fields = {
            "created_at",
            "name",
            "asset_tag",
            "acquisition_date",
            "acquisition_cost",
        }
        if sort_by not in allowed_sort_fields:
            sort_by = "created_at"

        direction = -1 if sort_order.lower() == "desc" else 1

        total = await self.collection.count_documents(filters)
        
        # Calculate total pages
        total_pages = max(1, (total + page_size - 1) // page_size) if total > 0 else 0

        # Run query with pagination and stable secondary sort on _id
        cursor = (
            self.collection.find(filters)
            .sort([(sort_by, direction), ("_id", 1)])
            .skip((page - 1) * page_size)
            .limit(page_size)
        )

        assets = [self._build_asset_response(document) async for document in cursor]

        return AssetListResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=assets,
        )

    async def update_asset(
        self, asset_id: str, asset_update: AssetUpdate, performed_by: Optional[str] = None
    ) -> AssetResponse:
        """Partially update an existing asset.

        Args:
            asset_id: The ID of the asset.
            asset_update: AssetUpdate schema containing fields to update.
            performed_by: User ID of the employee performing the update.
        """
        asset_obj_id = self._validate_object_id(asset_id, "asset_id")
        existing = await self.collection.find_one({"_id": asset_obj_id, "is_deleted": False})
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

        update_data = asset_update.model_dump(exclude_unset=True)

        # Block direct status updates via generic update endpoint
        if "status" in update_data:
            del update_data["status"]
        if "asset_tag" in update_data:
            del update_data["asset_tag"]

        if not update_data:
            return self._build_asset_response(existing)

        # Validate unique serial number if provided and modified
        if "serial_number" in update_data and update_data["serial_number"]:
            if update_data["serial_number"] != existing.get("serial_number"):
                await self._ensure_unique_serial(update_data["serial_number"])

        # Validate category_id format if provided
        if "category_id" in update_data:
            update_data["category_id"] = self._validate_object_id(update_data["category_id"], "category_id")

        # Validate department_id format & existence if provided
        if "department_id" in update_data:
            if update_data["department_id"]:
                dep_id = self._validate_object_id(update_data["department_id"], "department_id")
                try:
                    await DepartmentService().get_department_by_id(str(dep_id))
                except HTTPException as exc:
                    if exc.status_code == status.HTTP_404_NOT_FOUND:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Department with ID {update_data['department_id']} not found."
                        )
                    raise
                update_data["department_id"] = dep_id
            else:
                update_data["department_id"] = None

        if "condition" in update_data and update_data["condition"]:
            cond = update_data["condition"]
            update_data["condition"] = cond.value if hasattr(cond, "value") else cond

        update_data["updated_at"] = datetime.now(timezone.utc)
        update_data["updated_by"] = ObjectId(performed_by) if performed_by else None

        updated = await self.collection.find_one_and_update(
            {"_id": asset_obj_id, "is_deleted": False},
            {"$set": update_data},
            return_document=True,
        )

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

        # Log UPDATED history event
        await self.history_service.log_event(
            asset_id=asset_id,
            event_type=HistoryEventType.UPDATED,
            description="Asset updated details.",
            performed_by=performed_by,
        )

        return self._build_asset_response(updated)

    async def soft_delete_asset(self, asset_id: str, performed_by: Optional[str] = None) -> Dict[str, str]:
        """Soft delete an asset. Rejects if operationally protected (Allocated, Under Maintenance)."""
        asset_obj_id = self._validate_object_id(asset_id, "asset_id")
        existing = await self.collection.find_one({"_id": asset_obj_id, "is_deleted": False})
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

        current_status_str = existing.get("status")
        # Normalize status string to enum if possible
        try:
            current_status = AssetStatus(current_status_str)
        except ValueError:
            # Fallback in case of string parsing issues
            current_status = None

        # Operationally protected rule checks
        protected_statuses = {AssetStatus.ALLOCATED, AssetStatus.UNDER_MAINTENANCE}
        if current_status in protected_statuses or current_status_str in ("ALLOCATED", "UNDER_MAINTENANCE", "Allocated", "Under Maintenance"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete asset with active status '{current_status_str}'."
            )

        now = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": asset_obj_id, "is_deleted": False},
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": now,
                    "updated_by": ObjectId(performed_by) if performed_by else None,
                }
            },
        )

        # Log DELETED history event
        await self.history_service.log_event(
            asset_id=asset_id,
            event_type=HistoryEventType.DELETED,
            description="Asset soft deleted.",
            performed_by=performed_by,
        )

        return {"message": "Asset deleted successfully"}

    async def restore_asset(self, asset_id: str, performed_by: Optional[str] = None) -> AssetResponse:
        """Restore a soft-deleted asset."""
        asset_obj_id = self._validate_object_id(asset_id, "asset_id")
        now = datetime.now(timezone.utc)
        updated = await self.collection.find_one_and_update(
            {"_id": asset_obj_id, "is_deleted": True},
            {
                "$set": {
                    "is_deleted": False,
                    "updated_at": now,
                    "updated_by": ObjectId(performed_by) if performed_by else None,
                }
            },
            return_document=True,
        )

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found or not deleted."
            )

        # Log RESTORED history event
        await self.history_service.log_event(
            asset_id=asset_id,
            event_type=HistoryEventType.RESTORED,
            description="Asset restored from soft deletion.",
            performed_by=performed_by,
        )

        return self._build_asset_response(updated)

    async def asset_exists(self, asset_id: str) -> bool:
        """Check if a non-deleted asset exists by its ID."""
        try:
            obj_id = ObjectId(asset_id)
        except Exception:
            return False
        count = await self.collection.count_documents({"_id": obj_id, "is_deleted": False})
        return count > 0

    async def change_asset_status(
        self, asset_id: str, target_status: AssetStatus, performed_by: Optional[str] = None
    ) -> AssetResponse:
        """Manage lifecycle transition map and change asset status atomically."""
        asset_obj_id = self._validate_object_id(asset_id, "asset_id")
        existing = await self.collection.find_one({"_id": asset_obj_id, "is_deleted": False})
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

        current_status_str = existing.get("status")
        
        # Standardize current status string to Enum
        try:
            current_status = AssetStatus(current_status_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Existing asset status '{current_status_str}' is invalid."
            )

        # Prevent same-status transition
        if current_status == target_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Asset is already in state '{target_status.value}'."
            )

        # Validate allowed transitions
        allowed_targets = self.LIFECYCLE_TRANSITIONS.get(current_status, set())
        if target_status not in allowed_targets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lifecycle transition from '{current_status.value}' to '{target_status.value}' is not permitted."
            )

        now = datetime.now(timezone.utc)
        updated = await self.collection.find_one_and_update(
            {"_id": asset_obj_id, "is_deleted": False},
            {
                "$set": {
                    "status": target_status.value,
                    "updated_at": now,
                    "updated_by": ObjectId(performed_by) if performed_by else None,
                }
            },
            return_document=True,
        )

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

        # Log STATUS_CHANGED event
        await self.history_service.log_event(
            asset_id=asset_id,
            event_type=HistoryEventType.STATUS_CHANGED,
            description=f"Status changed from {current_status.value} to {target_status.value}.",
            previous_status=current_status,
            new_status=target_status,
            performed_by=performed_by,
        )

        return self._build_asset_response(updated)

    async def _ensure_unique_serial(self, serial_number: str) -> None:
        count = await self.collection.count_documents({
            "serial_number": serial_number,
            "is_deleted": False,
        })
        if count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Serial number '{serial_number}' is already registered."
            )

    @staticmethod
    def _validate_object_id(object_id: str, field_name: str) -> ObjectId:
        try:
            return ObjectId(object_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid format for {field_name}. Must be a valid 24-character hex string."
            )

    @staticmethod
    def _build_asset_response(document: Dict[str, Any]) -> AssetResponse:
        return AssetResponse(
            id=str(document["_id"]),
            asset_tag=document["asset_tag"],
            name=document["name"],
            category_id=str(document["category_id"]),
            serial_number=document.get("serial_number"),
            acquisition_date=document.get("acquisition_date"),
            acquisition_cost=document.get("acquisition_cost"),
            condition=AssetCondition(document["condition"]),
            department_id=str(document["department_id"]) if document.get("department_id") else None,
            location=document.get("location"),
            status=AssetStatus(document["status"]),
            is_shared_resource=document.get("is_shared_resource", False),
            photo_url=document.get("photo_url"),
            document_urls=document.get("document_urls") or [],
            created_at=document.get("created_at"),
            updated_at=document.get("updated_at"),
            created_by=str(document["created_by"]) if document.get("created_by") else None,
            updated_by=str(document["updated_by"]) if document.get("updated_by") else None,
            is_deleted=document.get("is_deleted", False),
        )

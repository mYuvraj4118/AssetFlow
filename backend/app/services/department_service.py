from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorCollection

from app.database.mongodb import get_database
from app.schemas.department import (
    DepartmentCreate,
    DepartmentListResponse,
    DepartmentResponse,
    DepartmentUpdate,
)


class DepartmentService:
    """Service layer for department operations."""

    def __init__(self) -> None:
        database = get_database()
        self.collection: AsyncIOMotorCollection = database.get_collection("departments")

    async def create_department(self, department: DepartmentCreate) -> DepartmentResponse:
        """Create a new department.

        Args:
            department: DepartmentCreate schema containing department details.

        Returns:
            DepartmentResponse: The created department.

        Raises:
            HTTPException: If department name or code already exists.
        """
        await self._ensure_unique_name(department.name)
        await self._ensure_unique_code(department.code)

        now = datetime.utcnow()
        document: Dict[str, Any] = {
            "name": department.name,
            "code": department.code,
            "description": department.description,
            "parent_department_id": ObjectId(department.parent_department_id) if department.parent_department_id else None,
            "is_deleted": False,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id

        return self._build_department_response(document)

    async def get_department_by_id(self, department_id: str) -> DepartmentResponse:
        """Retrieve a department by its ID, excluding soft deleted records.

        Args:
            department_id: The department ObjectId as a string.

        Returns:
            DepartmentResponse: The matching department.

        Raises:
            HTTPException: If department is not found.
        """
        department = await self.collection.find_one({
            "_id": self._validate_object_id(department_id),
            "is_deleted": False,
        })
        if not department:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
        return self._build_department_response(department)

    async def get_department_by_code(self, code: str) -> Optional[DepartmentResponse]:
        """Retrieve a department by its unique code, excluding soft deleted records."""
        department = await self.collection.find_one({"code": code, "is_deleted": False})
        return self._build_department_response(department) if department else None

    async def get_all_departments(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
    ) -> DepartmentListResponse:
        """Retrieve a paginated list of departments with optional search filtering.

        Args:
            page: Current page number.
            page_size: Number of records per page.
            search: Optional search term for name and code.

        Returns:
            DepartmentListResponse: Paged departments list.
        """
        filters: Dict[str, Any] = {"is_deleted": False}
        if search:
            filters["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
            ]

        total = await self.collection.count_documents(filters)
        cursor = (
            self.collection.find(filters)
            .sort("created_at", -1)
            .skip((page - 1) * page_size)
            .limit(page_size)
        )

        departments = [self._build_department_response(document) async for document in cursor]

        return DepartmentListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=departments,
        )

    async def update_department(self, department_id: str, department: DepartmentUpdate) -> DepartmentResponse:
        """Update an existing department with provided fields."""
        department_obj_id = self._validate_object_id(department_id)
        existing = await self.collection.find_one({"_id": department_obj_id, "is_deleted": False})
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

        update_data: Dict[str, Any] = {}
        if department.name and department.name != existing.get("name"):
            await self._ensure_unique_name(department.name, exclude_id=department_obj_id)
            update_data["name"] = department.name

        if department.code and department.code != existing.get("code"):
            await self._ensure_unique_code(department.code, exclude_id=department_obj_id)
            update_data["code"] = department.code

        if department.description is not None:
            update_data["description"] = department.description

        if department.parent_department_id is not None:
            update_data["parent_department_id"] = (
                ObjectId(department.parent_department_id) if department.parent_department_id else None
            )

        if not update_data:
            return self._build_department_response(existing)

        update_data["updated_at"] = datetime.utcnow()

        updated = await self.collection.find_one_and_update(
            {"_id": department_obj_id, "is_deleted": False},
            {"$set": update_data},
            return_document=True,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
        return self._build_department_response(updated)

    async def delete_department(self, department_id: str) -> Dict[str, str]:
        """Soft delete a department by setting is_deleted flag."""
        department_obj_id = self._validate_object_id(department_id)
        result = await self.collection.update_one(
            {"_id": department_obj_id, "is_deleted": False},
            {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
        return {"message": "Department deleted successfully"}

    async def restore_department(self, department_id: str) -> DepartmentResponse:
        """Restore a previously soft deleted department."""
        department_obj_id = self._validate_object_id(department_id)
        updated = await self.collection.find_one_and_update(
            {"_id": department_obj_id, "is_deleted": True},
            {"$set": {"is_deleted": False, "updated_at": datetime.utcnow()}},
            return_document=True,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found or not deleted")
        return self._build_department_response(updated)

    async def department_exists(self, name: str, code: str) -> bool:
        """Check whether a department exists by name or code."""
        query = {
            "$or": [
                {"name": name},
                {"code": code},
            ],
            "is_deleted": False,
        }
        return await self.collection.count_documents(query) > 0

    async def get_department_tree(self) -> List[Dict[str, Any]]:
        """Build a parent-child tree of departments."""
        departments = await self.collection.find({"is_deleted": False}).to_list(length=None)
        lookup: Dict[str, Dict[str, Any]] = {}
        for document in departments:
            department_response = self._build_department_response(document)
            lookup[str(department_response.id)] = {**department_response.dict(), "children": []}

        tree: List[Dict[str, Any]] = []
        for node in lookup.values():
            parent_id = node.get("parent_department_id")
            if parent_id and str(parent_id) in lookup:
                lookup[str(parent_id)]["children"].append(node)
            else:
                tree.append(node)

        return tree

    async def _ensure_unique_name(self, name: str, exclude_id: Optional[ObjectId] = None) -> None:
        query: Dict[str, Any] = {"name": name, "is_deleted": False}
        if exclude_id:
            query["_id"] = {"$ne": exclude_id}
        if await self.collection.count_documents(query) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Department name already exists")

    async def _ensure_unique_code(self, code: str, exclude_id: Optional[ObjectId] = None) -> None:
        query: Dict[str, Any] = {"code": code, "is_deleted": False}
        if exclude_id:
            query["_id"] = {"$ne": exclude_id}
        if await self.collection.count_documents(query) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Department code already exists")

    @staticmethod
    def _validate_object_id(object_id: str) -> ObjectId:
        try:
            return ObjectId(object_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid department id")

    @staticmethod
    def _build_department_response(document: Dict[str, Any]) -> DepartmentResponse:
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

        return DepartmentResponse(
            id=str(document["_id"]),
            name=document["name"],
            code=document["code"],
            description=document.get("description"),
            parent_department_id=str(document["parent_department_id"]) if document.get("parent_department_id") else None,
            is_deleted=document.get("is_deleted", False),
            created_at=document.get("created_at"),
            updated_at=document.get("updated_at"),
        )

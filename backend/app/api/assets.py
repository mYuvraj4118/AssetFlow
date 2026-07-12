from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status

from app.auth.dependencies import get_current_employee
from app.constants import AssetCondition, AssetStatus
from app.schemas.asset import (
    AssetCreate,
    AssetListResponse,
    AssetResponse,
    AssetStatusUpdate,
    AssetUpdate,
)
from app.schemas.asset_history import AssetHistoryResponse
from app.services.asset_history_service import AssetHistoryService
from app.services.asset_service import AssetService

router = APIRouter(prefix="/assets", tags=["Assets"])


def get_asset_service() -> AssetService:
    """Dependency injection for AssetService."""
    return AssetService()


def get_history_service() -> AssetHistoryService:
    """Dependency injection for AssetHistoryService."""
    return AssetHistoryService()


def require_asset_manager_role(
    employee: dict = Depends(get_current_employee),
) -> dict:
    """RBAC dependency to require Admin or Asset Manager permissions."""
    roles = employee.get("roles") or []
    # Handle variations in role casing/naming safely
    normalized_roles = [str(r).lower().strip() for r in roles]
    has_permission = (
        "admin" in normalized_roles
        or "asset manager" in normalized_roles
        or "asset_manager" in normalized_roles
    )
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Asset Manager access required.",
        )
    return employee


@router.post(
    "",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Asset",
)
async def create_asset(
    asset_data: AssetCreate,
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(require_asset_manager_role),
) -> AssetResponse:
    """Register a new asset. Requires Admin or Asset Manager permissions."""
    performed_by = current_user.get("id")
    return await service.create_asset(asset_data, performed_by=performed_by)


@router.get(
    "",
    response_model=AssetListResponse,
    summary="List Assets",
)
async def list_assets(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, tag, serial, location"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    department_id: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[AssetStatus] = Query(None, description="Filter by status"),
    condition: Optional[AssetCondition] = Query(None, description="Filter by condition"),
    location: Optional[str] = Query(None, description="Filter by location"),
    is_shared_resource: Optional[bool] = Query(None, description="Filter by shared resource flag"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort direction (asc/desc)"),
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(get_current_employee),
) -> AssetListResponse:
    """Retrieve a paginated list of assets. Requires authenticated user."""
    return await service.list_assets(
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        department_id=department_id,
        status_filter=status,
        condition=condition,
        location=location,
        is_shared_resource=is_shared_resource,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get(
    "/tag/{asset_tag}",
    response_model=AssetResponse,
    summary="Get Asset by Tag",
)
async def get_asset_by_tag(
    asset_tag: str = Path(..., description="The unique sequential asset tag"),
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(get_current_employee),
) -> AssetResponse:
    """Retrieve an asset by its unique sequential tag. Requires authenticated user."""
    return await service.get_asset_by_tag(asset_tag)


@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
    summary="Get Asset by ID",
)
async def get_asset_by_id(
    asset_id: str = Path(..., description="The asset ObjectID as a 24-character hex string"),
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(get_current_employee),
) -> AssetResponse:
    """Retrieve an asset by its document ID. Requires authenticated user."""
    return await service.get_asset_by_id(asset_id)


@router.patch(
    "/{asset_id}",
    response_model=AssetResponse,
    summary="Update Asset",
)
async def update_asset(
    asset_id: str = Path(...),
    asset_update: AssetUpdate = Body(...),
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(require_asset_manager_role),
) -> AssetResponse:
    """Update an existing asset's fields. Requires Admin or Asset Manager permissions."""
    performed_by = current_user.get("id")
    return await service.update_asset(asset_id, asset_update, performed_by=performed_by)


@router.delete(
    "/{asset_id}",
    summary="Soft Delete Asset",
)
async def delete_asset(
    asset_id: str = Path(...),
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(require_asset_manager_role),
):
    """Soft delete an asset. Requires Admin or Asset Manager permissions."""
    performed_by = current_user.get("id")
    return await service.soft_delete_asset(asset_id, performed_by=performed_by)


@router.post(
    "/{asset_id}/restore",
    response_model=AssetResponse,
    summary="Restore Soft-Deleted Asset",
)
async def restore_asset(
    asset_id: str = Path(...),
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(require_asset_manager_role),
) -> AssetResponse:
    """Restore a previously deleted asset. Requires Admin or Asset Manager permissions."""
    performed_by = current_user.get("id")
    return await service.restore_asset(asset_id, performed_by=performed_by)


@router.patch(
    "/{asset_id}/status",
    response_model=AssetResponse,
    summary="Update Asset Lifecycle Status",
)
async def update_asset_status(
    asset_id: str = Path(...),
    status_payload: AssetStatusUpdate = None,
    service: AssetService = Depends(get_asset_service),
    current_user: dict = Depends(require_asset_manager_role),
) -> AssetResponse:
    """Trigger a lifecycle status transition. Requires Admin or Asset Manager permissions."""
    performed_by = current_user.get("id")
    return await service.change_asset_status(
        asset_id, status_payload.status, performed_by=performed_by
    )


@router.get(
    "/{asset_id}/history",
    response_model=list[AssetHistoryResponse],
    summary="Get Asset History Log",
)
async def get_asset_history(
    asset_id: str = Path(...),
    history_service: AssetHistoryService = Depends(get_history_service),
    current_user: dict = Depends(get_current_employee),
) -> list[AssetHistoryResponse]:
    """Retrieve all historical lifecycle events for an asset. Requires authenticated user."""
    events = await history_service.get_history_by_asset_id(asset_id)
    # Format document list to response model
    return [
        AssetHistoryResponse(
            id=str(doc["_id"]),
            asset_id=str(doc["asset_id"]),
            event_type=doc["event_type"],
            description=doc["description"],
            previous_status=doc.get("previous_status"),
            new_status=doc.get("new_status"),
            performed_by=str(doc["performed_by"]) if doc.get("performed_by") else None,
            metadata=doc.get("metadata") or {},
            created_at=doc["created_at"],
        )
        for doc in events
    ]

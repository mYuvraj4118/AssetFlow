from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from typing import List

from app.services.department_service import DepartmentService
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentListResponse,
)


router = APIRouter(prefix="/departments", tags=["Departments"])


def get_department_service() -> DepartmentService:
    """Dependency injection for DepartmentService."""
    return DepartmentService()


@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Department",
    description="Create a new department in the system.",
)
async def create_department(
    department_data: DepartmentCreate,
    service: DepartmentService = Depends(get_department_service),
) -> DepartmentResponse:
    """
    Create a new department.

    Args:
        department_data: The department creation data containing name, description,
            and optional parent_id for hierarchical organization.
        service: Injected DepartmentService instance for business logic operations.

    Returns:
        DepartmentResponse: The created department with assigned ID and metadata.

    Raises:
        HTTPException: If parent department not found or validation fails.
    """
    department = await service.create(department_data)
    return DepartmentResponse.from_orm(department)


@router.get(
    "/",
    response_model=DepartmentListResponse,
    summary="List Departments",
    description="Retrieve a paginated list of all departments with optional search filtering.",
)
async def list_departments(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    search: str = Query(None, description="Search departments by name or code"),
    service: DepartmentService = Depends(get_department_service),
) -> DepartmentListResponse:
    """
    Retrieve a paginated list of departments with optional search.

    Args:
        page: The page number for pagination (1-indexed).
        page_size: The number of departments per page (1-100).
        search: Optional search term to filter departments by name or code.
        service: Injected DepartmentService instance for business logic operations.

    Returns:
        DepartmentListResponse: A paginated response containing departments and metadata.
    """
    result = await service.list_departments(
        page=page,
        page_size=page_size,
        search=search,
    )
    return result


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
    summary="Get Department",
    description="Retrieve a specific department by ID.",
)
async def get_department(
    department_id: str = Path(..., description="The unique identifier of the department"),
    service: DepartmentService = Depends(get_department_service),
) -> DepartmentResponse:
    """
    Retrieve a specific department by ID.

    Args:
        department_id: The unique identifier of the department to retrieve.
        service: Injected DepartmentService instance for business logic operations.

    Returns:
        DepartmentResponse: The department details.

    Raises:
        HTTPException: 404 if department not found.
    """
    department = await service.get_by_id(department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found",
        )
    return DepartmentResponse.from_orm(department)


@router.patch(
    "/{department_id}",
    response_model=DepartmentResponse,
    summary="Update Department",
    description="Update an existing department with partial or full modifications.",
)
async def update_department(
    department_id: str = Path(..., description="The unique identifier of the department"),
    department_data: DepartmentUpdate = None,
    service: DepartmentService = Depends(get_department_service),
) -> DepartmentResponse:
    """
    Update an existing department.

    Args:
        department_id: The unique identifier of the department to update.
        department_data: Partial or complete department update data.
        service: Injected DepartmentService instance for business logic operations.

    Returns:
        DepartmentResponse: The updated department details.

    Raises:
        HTTPException: 404 if department not found or validation error occurs.
    """
    department = await service.update(department_id, department_data)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found",
        )
    return DepartmentResponse.from_orm(department)


@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Department",
    description="Soft delete a department (data is not permanently removed).",
)
async def delete_department(
    department_id: str = Path(..., description="The unique identifier of the department"),
    service: DepartmentService = Depends(get_department_service),
) -> None:
    """
    Soft delete a department.

    Args:
        department_id: The unique identifier of the department to delete.
        service: Injected DepartmentService instance for business logic operations.

    Raises:
        HTTPException: 404 if department not found.
    """
    success = await service.soft_delete(department_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found",
        )


@router.post(
    "/{department_id}/restore",
    response_model=DepartmentResponse,
    summary="Restore Department",
    description="Restore a soft-deleted department.",
)
async def restore_department(
    department_id: str = Path(..., description="The unique identifier of the department"),
    service: DepartmentService = Depends(get_department_service),
) -> DepartmentResponse:
    """
    Restore a soft-deleted department.

    Args:
        department_id: The unique identifier of the department to restore.
        service: Injected DepartmentService instance for business logic operations.

    Returns:
        DepartmentResponse: The restored department details.

    Raises:
        HTTPException: 404 if department not found.
    """
    department = await service.restore(department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found",
        )
    return DepartmentResponse.from_orm(department)


@router.get(
    "/tree",
    response_model=List[DepartmentResponse],
    summary="Get Department Hierarchy Tree",
    description="Retrieve the complete department hierarchy organized as a tree structure.",
)
async def get_department_tree(
    service: DepartmentService = Depends(get_department_service),
) -> List[DepartmentResponse]:
    """
    Retrieve the complete department hierarchy tree.

    Args:
        service: Injected DepartmentService instance for business logic operations.

    Returns:
        List[DepartmentHierarchyResponse]: Complete hierarchical structure of departments
            with parent-child relationships.
    """
    tree = await service.get_hierarchy_tree()
    return tree

from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_employee
from app.constants import UserRole
from app.models.employee import Employee


def require_admin(
    employee: Employee = Depends(get_current_employee),
):
    if employee.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return employee


def require_asset_manager(
    employee: Employee = Depends(get_current_employee),
):
    if employee.role not in (
        UserRole.ADMIN,
        UserRole.ASSET_MANAGER,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Asset Manager access required.",
        )
    return employee


def require_department_head(
    employee: Employee = Depends(get_current_employee),
):
    if employee.role not in (
        UserRole.ADMIN,
        UserRole.DEPARTMENT_HEAD,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Department Head access required.",
        )
    return employee


def require_employee(
    employee: Employee = Depends(get_current_employee),
):
    return employee
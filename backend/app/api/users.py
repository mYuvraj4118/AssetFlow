from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_employee
from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeResponse,
    EmployeeUpdate,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=EmployeeResponse,
    summary="Get current employee profile",
)
async def get_current_user(
    current_employee: Employee = Depends(get_current_employee),
):
    """
    Return the currently authenticated employee.
    """
    return current_employee


@router.patch(
    "/profile",
    response_model=EmployeeResponse,
    summary="Update employee profile",
)
async def update_profile(
    payload: EmployeeUpdate,
    current_employee: Employee = Depends(get_current_employee),
):
    """
    Update the authenticated employee's profile.

    Currently returns the authenticated employee.
    Database update logic will be added in the service layer.
    """

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(current_employee, key, value)

    return current_employee

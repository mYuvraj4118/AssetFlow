from typing import Dict, List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/employees", tags=["Employees"])

# In-memory storage for employees
_employees: Dict[UUID, Dict] = {}


class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    role: str = Field(..., min_length=1)
    department_id: str = Field(..., min_length=1)
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    """Schema for creating a new employee."""


class EmployeeUpdate(BaseModel):
    """Schema for updating an existing employee. All fields optional."""

    first_name: Optional[str] = Field(None, min_length=1)
    last_name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, min_length=1)
    department_id: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None


class EmployeeResponse(EmployeeBase):
    id: UUID


def _find_by_email(email: str) -> Optional[UUID]:
    for eid, data in _employees.items():
        if data["email"].lower() == email.lower():
            return eid
    return None


@router.get("/", response_model=List[EmployeeResponse])
def list_employees() -> List[EmployeeResponse]:
    """Return a list of all employees."""
    return [EmployeeResponse(id=eid, **data) for eid, data in _employees.items()]


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: UUID) -> EmployeeResponse:
    """Return an employee by ID.

    Raises 404 if the employee does not exist.
    """
    employee = _employees.get(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return EmployeeResponse(id=employee_id, **employee)


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate) -> EmployeeResponse:
    """Create a new employee. Rejects duplicate emails."""
    if _find_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    eid = uuid4()
    _employees[eid] = payload.dict()
    return EmployeeResponse(id=eid, **_employees[eid])


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: UUID, payload: EmployeeUpdate) -> EmployeeResponse:
    """Update an existing employee. Raises 404 if not found."""
    employee = _employees.get(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    update_data = payload.dict(exclude_unset=True)
    # If updating email, ensure uniqueness
    if "email" in update_data:
        found = _find_by_email(update_data["email"])
        if found and found != employee_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    employee.update(update_data)
    _employees[employee_id] = employee
    return EmployeeResponse(id=employee_id, **employee)


@router.delete("/{employee_id}")
def delete_employee(employee_id: UUID):
    """Delete an employee. Returns a success message."""
    if employee_id not in _employees:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    del _employees[employee_id]
    return {"detail": "Employee deleted successfully"}

from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeRole(str, Enum):
    ADMIN = "Admin"
    ASSET_MANAGER = "Asset Manager"
    DEPARTMENT_HEAD = "Department Head"
    EMPLOYEE = "Employee"


class EmployeeStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class Employee(BaseModel):
    id: UUID
    clerk_user_id: UUID
    name: str
    email: EmailStr
    department_id: UUID
    role: EmployeeRole
    status: EmployeeStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        title="Employee",
        json_schema_extra={
            "examples": [
                {
                    "id": "a3e7f889-3f2b-47e1-af8a-f176e8c8d6e1",
                    "clerk_user_id": "d4b2c9f7-6dd3-4a4a-9b92-6f13d625c4bb",
                    "name": "Jane Doe",
                    "email": "jane.doe@example.com",
                    "department_id": "0f9d2a1b-5d87-4189-9099-5c64187ffc65",
                    "role": "Asset Manager",
                    "status": "Active",
                    "created_at": "2026-01-01T08:00:00Z",
                    "updated_at": "2026-01-15T08:00:00Z",
                }
            ]
        },
    )

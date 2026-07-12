from __future__ import annotations

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.constants import UserRole


class EmployeeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EmployeeCreate(EmployeeBase):
    clerk_user_id: str
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    department_id: str
    designation: str
    role: UserRole
    status: bool = True
    profile_image: Optional[str] = None

    @field_validator("employee_code")
    def validate_employee_code(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("employee_code must be at least 3 characters")
        return value

    @field_validator("first_name", "last_name")
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name fields must not be empty")
        return value

    @field_validator("email")
    def normalize_email(cls, value: EmailStr) -> EmailStr:
        return value.strip().lower()

    @field_validator("phone")
    def validate_phone(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"^\+?\d{7,15}$", value):
            raise ValueError("phone must contain only digits and may include a leading +")
        return value

    @field_validator("department_id", "designation")
    def validate_non_empty(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("department_id and designation must not be empty")
        return value

    @field_validator("profile_image")
    def validate_profile_image(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        return value


class EmployeeUpdate(EmployeeBase):
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[bool] = None
    profile_image: Optional[str] = None

    @field_validator("employee_code")
    def validate_employee_code(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 3:
            raise ValueError("employee_code must be at least 3 characters")
        return value

    @field_validator("first_name", "last_name")
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("name fields must not be empty")
        return value

    @field_validator("email")
    def normalize_email(cls, value: Optional[EmailStr]) -> Optional[EmailStr]:
        if value is None:
            return value
        return value.strip().lower()

    @field_validator("phone")
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not re.fullmatch(r"^\+?\d{7,15}$", value):
            raise ValueError("phone must contain only digits and may include a leading +")
        return value

    @field_validator("department_id", "designation")
    def validate_non_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("department_id and designation must not be empty")
        return value

    @field_validator("profile_image")
    def validate_profile_image(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return value.strip()


class EmployeeResponse(EmployeeBase):
    id: str
    clerk_user_id: str
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    department_id: str
    designation: str
    role: UserRole
    status: bool
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class EmployeeRoleUpdate(EmployeeBase):
    id: str
    role: UserRole

"""Application role definitions for authorization and access control."""

from enum import Enum


class UserRole(str, Enum):
    """Represents the user roles supported by the application."""

    ADMIN = "ADMIN"
    ASSET_MANAGER = "ASSET_MANAGER"
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD"
    EMPLOYEE = "EMPLOYEE"

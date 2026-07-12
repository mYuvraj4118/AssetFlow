from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/users", tags=["users"])


class User(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class SyncRequest(BaseModel):
    source: str
    force: Optional[bool] = False


class SyncResponse(BaseModel):
    synced: bool
    message: Optional[str] = None


def get_current_user():
    # Placeholder dependency. In real implementation, validate token and fetch user.
    return User(id="user_123", email="user@example.com", full_name="Example User")


@router.get("/me", response_model=User)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Return current authenticated user."""
    return current_user


@router.post("/sync", response_model=SyncResponse, status_code=status.HTTP_202_ACCEPTED)
def sync_users(payload: SyncRequest, current_user: User = Depends(get_current_user)):
    """Placeholder endpoint to trigger user sync from external source."""
    # Placeholder logic: pretend sync was accepted
    return SyncResponse(synced=True, message=f"Sync started for source={payload.source}")


@router.patch("/profile", response_model=User)
def update_profile(
    update: UserProfileUpdate, current_user: User = Depends(get_current_user)
):
    """Placeholder update profile endpoint."""
    # Placeholder: apply updates to the current_user object and return
    data = current_user.dict()
    if update.full_name is not None:
        data["full_name"] = update.full_name
    if update.email is not None:
        data["email"] = update.email
    return User(**data)

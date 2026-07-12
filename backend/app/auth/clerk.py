from typing import Any, Dict

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    # Placeholder for Clerk JWT verification logic.
    # Replace this with actual token validation and decoding.
    if token == "invalid":
        raise HTTPException(status_code=401, detail="Invalid authorization token")

    return {"sub": "clerk_user_id", "email": "user@example.com"}


def extract_user_id(claims: Dict[str, Any] = Depends(verify_jwt)) -> str:
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token claims")
    return user_id


def get_clerk_user(user_id: str = Depends(extract_user_id)) -> Dict[str, Any]:
    # Placeholder for fetching user details from Clerk.
    # Replace this with a call to Clerk API or SDK.
    if user_id == "unknown":
        raise HTTPException(status_code=404, detail="Clerk user not found")

    return {
        "id": user_id,
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "user@example.com",
    }

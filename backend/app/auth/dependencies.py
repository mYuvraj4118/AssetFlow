from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, Request, status


def _unauthorized(detail: str = "Unauthorized") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def verify_clerk_jwt(request: Request) -> Dict[str, Any]:
    """
    Placeholder for Clerk JWT verification.

    This function is intended to be replaced with a real verifier that:
    - extracts the Authorization header
    - validates the JWT signature against Clerk's JWKS
    - checks exp, iat, aud, iss as appropriate
    - returns the token claims as a dict

    For now it implements a minimal check and returns a fake claim set when
    a Bearer token is present. If no token or invalid format, raises 401.
    """
    auth: Optional[str] = request.headers.get("Authorization")
    if not auth:
        raise _unauthorized("Missing Authorization header")

    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise _unauthorized("Invalid Authorization header format")

    token = parts[1]

    # Placeholder: in production validate the token properly with Clerk
    if token == "invalid":
        raise _unauthorized("Invalid token")

    # Return a minimal claims dict to be used by downstream dependencies
    # Common Clerk JWT fields include: sub (user id), email, and possibly custom claims
    return {
        "sub": "clerk|example_user",
        "email": "user@example.com",
        "claims": {"roles": ["user"]},
    }


def get_current_user(claims: Dict[str, Any] = Depends(verify_clerk_jwt)) -> Dict[str, Any]:
    """
    Dependency that returns the current authenticated user.

    Placeholder: maps clerk claims to an application user representation.
    Raises 401 when claims are missing or malformed.
    """
    if not claims or "sub" not in claims:
        raise _unauthorized("Invalid authentication claims")

    user = {
        "id": claims.get("sub"),
        "email": claims.get("email"),
        # attach raw claims for further authorization checks
        "raw_claims": claims,
    }
    return user


def get_current_employee(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency that ensures the current user is an employee.

    Placeholder logic: checks for a 'roles' claim containing 'employee'.
    Raises 401 when the user is not authorized as an employee.
    """
    raw = user.get("raw_claims") or {}
    roles = []
    # roles may appear directly on claims or nested under 'claims'
    if isinstance(raw.get("roles"), list):
        roles = raw.get("roles")
    elif isinstance(raw.get("claims", {}).get("roles"), list):
        roles = raw.get("claims", {}).get("roles")

    if "employee" not in roles:
        raise _unauthorized("Employee role required")

    # In a real app, enrich with employee-specific info (e.g., employee id)
    employee = {
        "id": user.get("id"),
        "email": user.get("email"),
        "roles": roles,
    }
    return employee

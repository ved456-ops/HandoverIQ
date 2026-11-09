"""
Authentication & User Account Router for HandoverIQ.

Endpoints:
  POST   /api/auth/register   — Create a new account
  POST   /api/auth/login      — Sign in with email & password
  POST   /api/auth/demo       — Instant 1-click Demo Pro Account sign-in
  GET    /api/auth/me         — Retrieve current user profile & workspace state
  PATCH  /api/auth/me         — Update user profile, bio, role, & preferences
  POST   /api/auth/bookmarks  — Add a bookmarked repository
  DELETE /api/auth/bookmarks  — Remove a bookmarked repository
  POST   /api/auth/password   — Update account password
  POST   /api/auth/logout     — Sign out and revoke session token
"""
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, Query, status

from app.models.auth_models import (
    AuthSessionResponse,
    BookmarkRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    UserLoginRequest,
    UserProfile,
    UserRegisterRequest,
)
from app.services.auth_service import (
    add_bookmark,
    change_password,
    get_user_by_token,
    login_demo_user,
    login_user,
    logout_session,
    register_user,
    remove_bookmark,
    update_user_profile,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new HandoverIQ user account",
)
async def register(body: UserRegisterRequest) -> AuthSessionResponse:
    try:
        return register_user(body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.post(
    "/login",
    response_model=AuthSessionResponse,
    summary="Sign in with email and password",
)
async def login(body: UserLoginRequest) -> AuthSessionResponse:
    try:
        return login_user(body)
    except LookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.post(
    "/demo",
    response_model=AuthSessionResponse,
    summary="Instant 1-click Demo Architect login for hackathon & pitch evaluation",
)
async def demo_login() -> AuthSessionResponse:
    return login_demo_user()


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Retrieve the authenticated user's profile, preferences, bookmarks, and history",
)
async def get_me(
    authorization: Optional[str] = Header(default=None),
) -> UserProfile:
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated or session expired.",
        )
    return user


@router.patch(
    "/me",
    response_model=UserProfile,
    summary="Update user profile details and workspace preferences",
)
async def patch_me(
    body: ProfileUpdateRequest,
    authorization: Optional[str] = Header(default=None),
) -> UserProfile:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required.",
        )
    try:
        return update_user_profile(authorization, body)
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.post(
    "/bookmarks",
    response_model=UserProfile,
    summary="Bookmark a GitHub repository in user workspace",
)
async def create_bookmark(
    body: BookmarkRequest,
    authorization: Optional[str] = Header(default=None),
) -> UserProfile:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required.",
        )
    try:
        return add_bookmark(authorization, body)
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.delete(
    "/bookmarks",
    response_model=UserProfile,
    summary="Remove a bookmarked GitHub repository",
)
async def delete_bookmark(
    repo_name: str = Query(..., description="owner/repo slug to remove"),
    authorization: Optional[str] = Header(default=None),
) -> UserProfile:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required.",
        )
    try:
        return remove_bookmark(authorization, repo_name)
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.post(
    "/password",
    response_model=UserProfile,
    summary="Change account password",
)
async def update_password(
    body: PasswordChangeRequest,
    authorization: Optional[str] = Header(default=None),
) -> UserProfile:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required.",
        )
    try:
        return change_password(authorization, body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.post(
    "/logout",
    summary="Sign out and invalidate current session token",
)
async def logout(
    authorization: Optional[str] = Header(default=None),
) -> dict:
    logout_session(authorization)
    return {"status": "signed_out"}

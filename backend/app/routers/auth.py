"""
Auth router - /api/auth/*
"""
from fastapi import APIRouter, Depends, Request
from app.schemas.auth import LoginRequest, ProfileUpdateRequest
from app.services.auth_service import AuthService
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthService()


@router.post("/login")
async def login(request: LoginRequest):
    """Login endpoint."""
    return await auth_service.login(request)


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user."""
    return await auth_service.get_me(user["id"])


@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    user: dict = Depends(get_current_user)
):
    """Update profile."""
    return await auth_service.update_profile(user["id"], request)

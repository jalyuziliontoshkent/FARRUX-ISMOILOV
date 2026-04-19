"""
Categories router - /api/categories/*
"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas.categories import CategoryCreate, CategoryUpdate
from app.services.category_service import CategoryService
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/categories", tags=["categories"])
category_service = CategoryService()


@router.post("")
async def create_category(data: CategoryCreate, admin: dict = Depends(require_admin)):
    """Create category."""
    return await category_service.create(data)


@router.get("")
async def list_categories(user: dict = Depends(get_current_user)) -> List[dict]:
    """List all categories."""
    return await category_service.list_all()


@router.put("/{category_id}")
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    admin: dict = Depends(require_admin)
):
    """Update category."""
    return await category_service.update(int(category_id), data)


@router.delete("/{category_id}")
async def delete_category(category_id: str, admin: dict = Depends(require_admin)):
    """Delete category."""
    await category_service.delete(int(category_id))
    return {"message": "Deleted"}

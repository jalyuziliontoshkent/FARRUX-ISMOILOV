"""
Materials router - /api/materials/*
"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas.materials import MaterialCreate, MaterialUpdate
from app.services.material_service import MaterialService
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/materials", tags=["materials"])
material_service = MaterialService()


@router.post("")
async def create_material(data: MaterialCreate, admin: dict = Depends(require_admin)):
    """Create material."""
    return await material_service.create(data)


@router.get("")
async def list_materials(user: dict = Depends(get_current_user)) -> List[dict]:
    """List all materials."""
    return await material_service.list_all()


@router.get("/by-category/{category_id}")
async def list_by_category(
    category_id: str,
    user: dict = Depends(get_current_user)
) -> List[dict]:
    """List materials by category."""
    return await material_service.list_by_category(int(category_id))


@router.put("/{material_id}")
async def update_material(
    material_id: str,
    data: MaterialUpdate,
    admin: dict = Depends(require_admin)
):
    """Update material."""
    return await material_service.update(int(material_id), data)


@router.delete("/{material_id}")
async def delete_material(material_id: str, admin: dict = Depends(require_admin)):
    """Delete material."""
    await material_service.delete(int(material_id))
    return {"message": "Deleted"}

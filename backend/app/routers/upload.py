"""
Upload router - /api/upload-image
Uses Supabase Storage instead of local storage.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from app.services.file_service import FileService
from app.deps import require_admin

router = APIRouter(tags=["upload"])
file_service = FileService()


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    admin: dict = Depends(require_admin)
):
    """Upload image to Supabase Storage."""
    return await file_service.upload_image(file)

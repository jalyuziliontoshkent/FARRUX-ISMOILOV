"""
File service using Supabase Storage.
"""
from fastapi import UploadFile
from app.utils.supabase_storage import SupabaseStorage
from app.core.logging import get_logger

logger = get_logger(__name__)


class FileService:
    """File operations."""
    
    def __init__(self):
        self.storage = SupabaseStorage()
    
    async def upload_image(self, file: UploadFile) -> dict:
        """Upload image to Supabase Storage."""
        result = await self.storage.upload(file)
        
        if not result.get("success"):
            raise Exception(result.get("error", "Upload failed"))
        
        return {"image_url": result["image_url"]}
    
    async def delete_file(self, url: str) -> bool:
        """Delete file by URL."""
        path = self.storage.extract_path_from_url(url)
        if path:
            return await self.storage.delete(path)
        return False

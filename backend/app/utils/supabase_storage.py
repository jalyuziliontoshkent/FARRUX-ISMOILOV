"""
Supabase Storage integration for file uploads.
Replaces local storage with cloud storage.
"""
import uuid
from typing import Optional
import httpx
from fastapi import UploadFile
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class SupabaseStorage:
    """Supabase Storage client for file operations."""
    
    def __init__(self):
        self.base_url = settings.SUPABASE_URL.rstrip("/")
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.bucket = settings.SUPABASE_BUCKET
        self.allowed_types = settings.ALLOWED_IMAGE_TYPES
        self.max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    def _validate_file(self, file: UploadFile) -> tuple[bool, str]:
        """Validate file type and size."""
        content_type = file.content_type or ""
        
        if not content_type.startswith("image/"):
            return False, "Faqat rasm fayllari ruxsat etiladi"
        
        if content_type not in self.allowed_types:
            return False, f"Ruxsat etilgan formatlar: {', '.join(self.allowed_types)}"
        
        return True, ""
    
    def _generate_path(self, original_filename: str) -> str:
        """Generate unique storage path."""
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
        allowed = ["jpg", "jpeg", "png", "webp", "gif"]
        if ext not in allowed:
            ext = "jpg"
        
        return f"{uuid.uuid4().hex}.{ext}"
    
    async def upload(self, file: UploadFile) -> dict:
        """Upload file to Supabase Storage."""
        # Validate
        is_valid, error = self._validate_file(file)
        if not is_valid:
            return {"success": False, "error": error}
        
        path = self._generate_path(file.filename or "image.jpg")
        
        try:
            content = await file.read()
            
            # Check size
            if len(content) > self.max_size:
                return {"success": False, "error": f"Fayl hajmi {settings.MAX_UPLOAD_SIZE_MB}MB dan oshmasligi kerak"}
            
            # Upload to Supabase
            upload_url = f"{self.base_url}/storage/v1/object/{self.bucket}/{path}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    upload_url,
                    headers={
                        "Authorization": f"Bearer {self.service_key}",
                        "Content-Type": file.content_type or "application/octet-stream",
                    },
                    content=content,
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    # Generate public URL
                    public_url = f"{self.base_url}/storage/v1/object/public/{self.bucket}/{path}"
                    return {
                        "success": True,
                        "image_url": public_url,
                        "path": path
                    }
                else:
                    logger.error(f"Supabase upload failed: {response.text}")
                    return {"success": False, "error": "Upload failed"}
                    
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return {"success": False, "error": str(e)}
    
    async def delete(self, path: str) -> bool:
        """Delete file from storage."""
        try:
            delete_url = f"{self.base_url}/storage/v1/object/{self.bucket}/{path}"
            
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    delete_url,
                    headers={"Authorization": f"Bearer {self.service_key}"},
                    timeout=10.0
                )
                return response.status_code in [200, 204]
                
        except Exception as e:
            logger.error(f"Delete error: {e}")
            return False
    
    def extract_path_from_url(self, url: str) -> Optional[str]:
        """Extract path from public URL."""
        try:
            if f"/storage/v1/object/public/{self.bucket}/" in url:
                return url.split(f"/storage/v1/object/public/{self.bucket}/")[-1]
            return None
        except:
            return None

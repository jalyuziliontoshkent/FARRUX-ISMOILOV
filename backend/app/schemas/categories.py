"""Category schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Create category."""
    name: str = Field(..., min_length=1)
    description: str = Field(default="")
    image_url: str = Field(default="")


class CategoryUpdate(BaseModel):
    """Update category."""
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryResponse(BaseModel):
    """Category response."""
    id: str
    name: str
    description: str
    image_url: str
    created_at: str
    material_count: Optional[int] = None

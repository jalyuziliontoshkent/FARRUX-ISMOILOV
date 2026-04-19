"""Material schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class MaterialCreate(BaseModel):
    """Create material."""
    name: str = Field(..., min_length=1)
    category: str = Field(default="")
    category_id: Optional[int] = None
    price_per_sqm: float = Field(..., gt=0)
    stock_quantity: float = Field(..., ge=0)
    unit: str = Field(default="kv.m")
    description: str = Field(default="")
    image_url: str = Field(default="")


class MaterialUpdate(BaseModel):
    """Update material."""
    name: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = None
    category_id: Optional[int] = None
    price_per_sqm: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    image_url: Optional[str] = None


class MaterialResponse(BaseModel):
    """Material response."""
    id: str
    name: str
    category: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    price_per_sqm: float
    stock_quantity: float
    unit: str
    description: str
    image_url: str
    created_at: str

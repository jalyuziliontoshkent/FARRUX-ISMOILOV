"""Order schemas."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class OrderItemCreate(BaseModel):
    """Create order item."""
    material_id: str = Field(...)
    material_name: str = Field(...)
    width: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    quantity: int = Field(default=1, ge=1)
    price_per_sqm: float = Field(..., gt=0)
    notes: str = Field(default="")


class OrderCreate(BaseModel):
    """Create order."""
    items: List[OrderItemCreate] = Field(..., min_length=1)
    notes: str = Field(default="")


class OrderStatusUpdate(BaseModel):
    """Update order status."""
    status: str = Field(...)
    rejection_reason: str = Field(default="")
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = ["kutilmoqda", "tasdiqlangan", "tayyorlanmoqda", "tayyor", "yetkazilmoqda", "yetkazildi", "rad_etilgan"]
        if v not in valid:
            raise ValueError(f"Invalid status")
        return v


class AssignItemRequest(BaseModel):
    """Assign item to worker."""
    worker_id: str = Field(...)


class DeliveryInfoRequest(BaseModel):
    """Assign delivery info."""
    driver_name: str = Field(..., min_length=1)
    driver_phone: str = Field(..., min_length=1)
    plate_number: str = Field(default="")


class OrderItemResponse(BaseModel):
    """Order item in response."""
    material_id: str
    material_name: str
    width: float
    height: float
    quantity: int
    sqm: float
    price_per_sqm: float
    price: float
    notes: str
    assigned_worker_id: str = ""
    assigned_worker_name: str = ""
    worker_status: str = "pending"


class DeliveryInfoResponse(BaseModel):
    """Delivery info."""
    driver_name: str
    driver_phone: str
    plate_number: str


class OrderResponse(BaseModel):
    """Order response."""
    id: str
    order_code: str
    dealer_id: str
    dealer_name: str
    items: List[OrderItemResponse]
    total_sqm: float
    total_price: float
    status: str
    notes: str
    rejection_reason: str
    delivery_info: Optional[DeliveryInfoResponse] = None
    created_at: str
    updated_at: str


class TaskResponse(BaseModel):
    """Worker task."""
    order_id: str
    order_code: str
    dealer_name: str
    item_index: int
    material_name: str
    width: float
    height: float
    sqm: float
    notes: str
    worker_status: str
    created_at: str

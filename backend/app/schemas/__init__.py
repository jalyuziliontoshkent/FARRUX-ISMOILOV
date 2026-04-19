"""Pydantic schemas."""
from app.schemas.auth import LoginRequest, LoginResponse, ProfileUpdateRequest
from app.schemas.users import (
    DealerCreate, DealerUpdate, WorkerCreate, 
    PaymentCreate, UserResponse
)
from app.schemas.categories import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.materials import MaterialCreate, MaterialUpdate, MaterialResponse
from app.schemas.orders import (
    OrderItemCreate, OrderCreate, OrderStatusUpdate,
    AssignItemRequest, DeliveryInfoRequest, OrderResponse, TaskResponse
)
from app.schemas.messages import MessageCreate, MessageResponse, ChatPartnerResponse

__all__ = [
    "LoginRequest",
    "LoginResponse",
    "ProfileUpdateRequest",
    "DealerCreate",
    "DealerUpdate",
    "WorkerCreate",
    "PaymentCreate",
    "UserResponse",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "MaterialCreate",
    "MaterialUpdate",
    "MaterialResponse",
    "OrderItemCreate",
    "OrderCreate",
    "OrderStatusUpdate",
    "AssignItemRequest",
    "DeliveryInfoRequest",
    "OrderResponse",
    "TaskResponse",
    "MessageCreate",
    "MessageResponse",
    "ChatPartnerResponse",
]

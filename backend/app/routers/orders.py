"""
Orders router - /api/orders/*
"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas.orders import OrderCreate, OrderStatusUpdate, AssignItemRequest, DeliveryInfoRequest
from app.services.order_service import OrderService
from app.deps import get_current_user, require_admin, require_worker

router = APIRouter(prefix="/orders", tags=["orders"])
order_service = OrderService()


@router.post("")
async def create_order(
    data: OrderCreate,
    user: dict = Depends(get_current_user)
):
    """Create order."""
    if user.get("role") != "dealer":
        raise HTTPException(403, "Faqat dilerlar")
    return await order_service.create(data, user["id"], user.get("name", ""))


@router.get("")
async def list_orders(user: dict = Depends(get_current_user)) -> List[dict]:
    """List orders."""
    return await order_service.list_all(user)


@router.get("/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    """Get order by ID."""
    return await order_service.get_by_id(int(order_id), user)


@router.put("/{order_id}/status")
async def update_status(
    order_id: str,
    data: OrderStatusUpdate,
    admin: dict = Depends(require_admin)
):
    """Update order status."""
    return await order_service.update_status(int(order_id), data)


@router.put("/{order_id}/items/{item_idx}/assign")
async def assign_item(
    order_id: str,
    item_idx: int,
    data: AssignItemRequest,
    admin: dict = Depends(require_admin)
):
    """Assign item to worker."""
    return await order_service.assign_item(int(order_id), item_idx, data)


@router.put("/{order_id}/delivery")
async def assign_delivery(
    order_id: str,
    data: DeliveryInfoRequest,
    admin: dict = Depends(require_admin)
):
    """Assign delivery."""
    return await order_service.assign_delivery(int(order_id), data)


@router.put("/{order_id}/confirm-delivery")
async def confirm_delivery(order_id: str, admin: dict = Depends(require_admin)):
    """Confirm delivery."""
    return await order_service.confirm_delivery(int(order_id))


# Worker task endpoints
@router.get("/worker/tasks", response_model=List[dict])
async def get_worker_tasks(user: dict = Depends(require_worker)):
    """Get worker tasks."""
    return await order_service.get_worker_tasks(user["id"])


@router.put("/worker/tasks/{order_id}/{item_idx}/complete")
async def complete_task(
    order_id: str,
    item_idx: int,
    user: dict = Depends(require_worker)
):
    """Complete task."""
    return await order_service.complete_task(
        int(order_id), item_idx, user["id"], user.get("name", "")
    )

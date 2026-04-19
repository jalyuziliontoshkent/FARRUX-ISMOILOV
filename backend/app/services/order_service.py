"""
Order service.
"""
import json
from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import HTTPException, status
from app.core.security import generate_order_code
from app.db.base import BaseRepository
from app.schemas.orders import OrderCreate, OrderStatusUpdate, AssignItemRequest, DeliveryInfoRequest
from app.utils.cache import cache
from app.core.logging import get_logger

logger = get_logger(__name__)


class OrderService:
    """Order operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def create(self, data: OrderCreate, dealer_id: str, dealer_name: str) -> dict:
        """Create order."""
        items = []
        total_price = 0
        total_sqm = 0
        
        for item in data.items:
            sqm = item.width * item.height * item.quantity
            price = sqm * item.price_per_sqm
            total_sqm += sqm
            total_price += price
            
            items.append({
                "material_id": item.material_id,
                "material_name": item.material_name,
                "width": item.width,
                "height": item.height,
                "quantity": item.quantity,
                "sqm": round(sqm, 2),
                "price_per_sqm": item.price_per_sqm,
                "price": round(price, 2),
                "notes": item.notes,
                "assigned_worker_id": "",
                "assigned_worker_name": "",
                "worker_status": "pending"
            })
        
        order_code = generate_order_code()
        now = datetime.now(timezone.utc).isoformat()
        
        order = await self.repo.fetch_one(
            """
            INSERT INTO orders (order_code, dealer_id, dealer_name, items, total_sqm, total_price, status, notes, rejection_reason, delivery_info, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'kutilmoqda', $7, '', NULL, $8, $9)
            RETURNING *
            """,
            order_code,
            int(dealer_id),
            dealer_name,
            json.dumps(items),
            round(total_sqm, 2),
            round(total_price, 2),
            data.notes,
            now,
            now
        )
        
        # Update dealer debt
        await self.repo.execute(
            "UPDATE users SET debt = debt + $1 WHERE id = $2",
            total_price,
            int(dealer_id)
        )
        
        cache.invalidate("orders", "stats", "reports")
        
        order["items"] = items
        return order
    
    async def list_all(self, user: dict) -> List[dict]:
        """List orders for user."""
        cache_key = f"orders_{user['id']}_{user.get('role','')}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        if user.get("role") == "dealer":
            rows = await self.repo.fetch_many(
                "SELECT * FROM orders WHERE dealer_id = $1 ORDER BY created_at DESC",
                int(user["id"])
            )
        else:
            rows = await self.repo.fetch_many(
                "SELECT * FROM orders ORDER BY created_at DESC"
            )
        
        for order in rows:
            order["items"] = json.loads(order["items"]) if isinstance(order["items"], str) else order["items"]
            if order.get("delivery_info"):
                order["delivery_info"] = json.loads(order["delivery_info"]) if isinstance(order["delivery_info"], str) else order["delivery_info"]
        
        cache.set(cache_key, rows, 15)
        return rows
    
    async def get_by_id(self, order_id: int, user: dict) -> dict:
        """Get order by ID."""
        order = await self.repo.fetch_one(
            "SELECT * FROM orders WHERE id = $1",
            order_id
        )
        if not order:
            raise HTTPException(status_code=404, detail="Not found")
        
        if user.get("role") == "dealer" and order["dealer_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        order["items"] = json.loads(order["items"]) if isinstance(order["items"], str) else order["items"]
        if order.get("delivery_info"):
            order["delivery_info"] = json.loads(order["delivery_info"]) if isinstance(order["delivery_info"], str) else order["delivery_info"]
        
        return order
    
    async def update_status(self, order_id: int, data: OrderStatusUpdate) -> dict:
        """Update order status."""
        now = datetime.now(timezone.utc).isoformat()
        
        if data.status == "rad_etilgan" and data.rejection_reason:
            await self.repo.execute(
                "UPDATE orders SET status = $1, rejection_reason = $2, updated_at = $3 WHERE id = $4",
                data.status,
                data.rejection_reason,
                now,
                order_id
            )
        else:
            await self.repo.execute(
                "UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3",
                data.status,
                now,
                order_id
            )
        
        cache.invalidate("orders", "stats", "reports")
        return await self._get_raw(order_id)
    
    async def assign_item(self, order_id: int, item_idx: int, data: AssignItemRequest) -> dict:
        """Assign item to worker."""
        order = await self._get_raw(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        items = order["items"]
        if item_idx >= len(items):
            raise HTTPException(status_code=400, detail="Invalid item index")
        
        worker = await self.repo.fetch_one(
            "SELECT * FROM users WHERE id = $1 AND role = 'worker'",
            int(data.worker_id)
        )
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        
        items[item_idx]["assigned_worker_id"] = data.worker_id
        items[item_idx]["assigned_worker_name"] = worker["name"]
        items[item_idx]["worker_status"] = "assigned"
        
        await self.repo.execute(
            "UPDATE orders SET items = $1 WHERE id = $2",
            json.dumps(items),
            order_id
        )
        
        cache.invalidate("orders")
        return await self._get_raw(order_id)
    
    async def get_worker_tasks(self, worker_id: str) -> List[dict]:
        """Get worker tasks."""
        rows = await self.repo.fetch_many(
            "SELECT * FROM orders WHERE status IN ('tasdiqlangan', 'tayyorlanmoqda')"
        )
        
        tasks = []
        for order in rows:
            items = json.loads(order["items"]) if isinstance(order["items"], str) else order["items"]
            for idx, item in enumerate(items):
                if item.get("assigned_worker_id") == worker_id:
                    tasks.append({
                        "order_id": order["id"],
                        "order_code": order.get("order_code", ""),
                        "dealer_name": order.get("dealer_name", ""),
                        "item_index": idx,
                        "material_name": item["material_name"],
                        "width": item["width"],
                        "height": item["height"],
                        "sqm": item["sqm"],
                        "notes": item.get("notes", ""),
                        "worker_status": item.get("worker_status", "assigned"),
                        "created_at": order["created_at"]
                    })
        return tasks
    
    async def complete_task(self, order_id: int, item_idx: int, worker_id: str, worker_name: str) -> dict:
        """Complete worker task."""
        order = await self._get_raw(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        items = order["items"]
        if item_idx >= len(items):
            raise HTTPException(status_code=400, detail="Invalid item index")
        
        if items[item_idx].get("assigned_worker_id") != worker_id:
            raise HTTPException(status_code=403, detail="Not your task")
        
        if items[item_idx].get("worker_status") == "completed":
            return order
        
        items[item_idx]["worker_status"] = "completed"
        now = datetime.now(timezone.utc).isoformat()
        
        await self.repo.execute(
            "UPDATE orders SET items = $1, updated_at = $2 WHERE id = $3",
            json.dumps(items),
            now,
            order_id
        )
        
        # Check if all done
        all_done = all(
            it.get("worker_status") == "completed"
            for it in items if it.get("assigned_worker_id")
        )
        
        if all_done:
            await self.repo.execute(
                "UPDATE orders SET status = 'tayyor', updated_at = $1 WHERE id = $2",
                now,
                order_id
            )
            
            # Notify dealer
            admin = await self.repo.fetch_one("SELECT id, name FROM users WHERE role = 'admin' LIMIT 1")
            if admin and order.get("dealer_id"):
                await self.repo.execute(
                    """
                    INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, text, read, created_at)
                    VALUES ($1, $2, 'admin', $3, $4, FALSE, $5)
                    """,
                    admin["id"],
                    admin["name"] or "Admin",
                    order["dealer_id"],
                    f"Buyurtma #{order['order_code']} tayyor! Barcha ishlar tugallandi.",
                    now
                )
            logger.info(f"Order #{order['order_code']} ready")
        else:
            # Notify admin
            admin = await self.repo.fetch_one("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
            if admin:
                completed = sum(1 for it in items if it.get("worker_status") == "completed")
                total = sum(1 for it in items if it.get("assigned_worker_id"))
                await self.repo.execute(
                    """
                    INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, text, read, created_at)
                    VALUES ($1, $2, 'worker', $3, $4, FALSE, $5)
                    """,
                    int(worker_id),
                    worker_name,
                    admin["id"],
                    f"#{order['order_code']}: {items[item_idx]['material_name']} tayyor ({completed}/{total})",
                    now
                )
        
        cache.invalidate("orders", "stats", "reports")
        return await self._get_raw(order_id)
    
    async def assign_delivery(self, order_id: int, data: DeliveryInfoRequest) -> dict:
        """Assign delivery."""
        order = await self.repo.fetch_one("SELECT id FROM orders WHERE id = $1", order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
        
        delivery_info = json.dumps({
            "driver_name": data.driver_name,
            "driver_phone": data.driver_phone,
            "plate_number": data.plate_number
        })
        
        now = datetime.now(timezone.utc).isoformat()
        
        await self.repo.execute(
            "UPDATE orders SET delivery_info = $1, status = 'yetkazilmoqda', updated_at = $2 WHERE id = $3",
            delivery_info,
            now,
            order_id
        )
        
        cache.invalidate("orders", "stats")
        return await self._get_raw(order_id)
    
    async def confirm_delivery(self, order_id: int) -> dict:
        """Confirm delivery."""
        order = await self.repo.fetch_one("SELECT id FROM orders WHERE id = $1", order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
        
        now = datetime.now(timezone.utc).isoformat()
        
        await self.repo.execute(
            "UPDATE orders SET status = 'yetkazildi', updated_at = $1 WHERE id = $2",
            now,
            order_id
        )
        
        cache.invalidate("orders", "stats", "reports")
        return await self._get_raw(order_id)
    
    async def _get_raw(self, order_id: int) -> dict:
        """Get order without access control."""
        order = await self.repo.fetch_one(
            "SELECT * FROM orders WHERE id = $1",
            order_id
        )
        if order:
            order["items"] = json.loads(order["items"]) if isinstance(order["items"], str) else order["items"]
            if order.get("delivery_info"):
                order["delivery_info"] = json.loads(order["delivery_info"]) if isinstance(order["delivery_info"], str) else order["delivery_info"]
        return order

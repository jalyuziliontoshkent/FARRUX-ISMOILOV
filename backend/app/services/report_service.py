"""
Report service.
"""
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List
from app.db.base import BaseRepository
from app.utils.cache import cache


class ReportService:
    """Report operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def get_statistics(self) -> Dict:
        """Get dashboard stats."""
        cached = cache.get("stats_all")
        if cached:
            return cached
        
        total_revenue = await self.repo.fetchval(
            "SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status IN ('tasdiqlangan','tayyorlanmoqda','tayyor','yetkazilmoqda','yetkazildi')"
        )
        
        result = {
            "total_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders"),
            "pending_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'kutilmoqda'"),
            "approved_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'tasdiqlangan'"),
            "preparing_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'tayyorlanmoqda'"),
            "ready_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'tayyor'"),
            "delivering_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'yetkazilmoqda'"),
            "delivered_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'yetkazildi'"),
            "rejected_orders": await self.repo.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'rad_etilgan'"),
            "total_dealers": await self.repo.fetchval("SELECT COUNT(*) FROM users WHERE role = 'dealer'"),
            "total_workers": await self.repo.fetchval("SELECT COUNT(*) FROM users WHERE role = 'worker'"),
            "total_materials": await self.repo.fetchval("SELECT COUNT(*) FROM materials"),
            "total_revenue": round(float(total_revenue), 2),
        }
        
        cache.set("stats_all", result, 30)
        return result
    
    async def get_reports(self) -> Dict:
        """Get detailed reports."""
        cached = cache.get("reports_all")
        if cached:
            return cached
        
        now = datetime.now(timezone.utc)
        week_ago = (now - timedelta(days=7)).isoformat()
        month_ago = (now - timedelta(days=30)).isoformat()
        
        # Revenue
        weekly_revenue = await self.repo.fetchval(
            "SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE created_at >= $1 AND status NOT IN ('rad_etilgan')",
            week_ago
        )
        
        monthly_revenue = await self.repo.fetchval(
            "SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE created_at >= $1 AND status NOT IN ('rad_etilgan')",
            month_ago
        )
        
        total_revenue = await self.repo.fetchval(
            "SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status NOT IN ('rad_etilgan')"
        )
        
        # Orders
        weekly_orders = await self.repo.fetchval(
            "SELECT COUNT(*) FROM orders WHERE created_at >= $1",
            week_ago
        )
        
        monthly_orders = await self.repo.fetchval(
            "SELECT COUNT(*) FROM orders WHERE created_at >= $1",
            month_ago
        )
        
        total_orders = await self.repo.fetchval("SELECT COUNT(*) FROM orders")
        
        # Top materials
        all_orders = await self.repo.fetch_many(
            "SELECT items FROM orders WHERE status NOT IN ('rad_etilgan')"
        )
        
        mat_stats = {}
        for row in all_orders:
            items = json.loads(row["items"]) if isinstance(row["items"], str) else row["items"]
            for item in items:
                name = item.get("material_name", "Noma'lum")
                sqm = item.get("sqm", 0)
                price = item.get("price", 0)
                
                if name not in mat_stats:
                    mat_stats[name] = {"name": name, "total_sqm": 0, "total_price": 0, "count": 0}
                
                mat_stats[name]["total_sqm"] += sqm
                mat_stats[name]["total_price"] += price
                mat_stats[name]["count"] += 1
        
        top_materials = sorted(mat_stats.values(), key=lambda x: x["total_price"], reverse=True)[:5]
        
        # Top dealers
        dealer_rows = await self.repo.fetch_many(
            """
            SELECT u.name, COUNT(o.id) as order_count, COALESCE(SUM(o.total_price), 0) as revenue
            FROM orders o JOIN users u ON o.dealer_id = u.id
            WHERE o.status NOT IN ('rad_etilgan')
            GROUP BY u.name ORDER BY revenue DESC LIMIT 5
            """
        )
        
        top_dealers = [
            {"name": r["name"], "orders": r["order_count"], "revenue": round(float(r["revenue"]), 2)}
            for r in dealer_rows
        ]
        
        # Daily stats
        daily = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0).isoformat()
            day_end = (now - timedelta(days=i)).replace(hour=23, minute=59, second=59).isoformat()
            
            cnt = await self.repo.fetchval(
                "SELECT COUNT(*) FROM orders WHERE created_at >= $1 AND created_at <= $2",
                day_start,
                day_end
            )
            
            rev = await self.repo.fetchval(
                "SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE created_at >= $1 AND created_at <= $2 AND status NOT IN ('rad_etilgan')",
                day_start,
                day_end
            )
            
            day_label = (now - timedelta(days=i)).strftime("%d.%m")
            daily.append({"day": day_label, "orders": cnt, "revenue": round(float(rev), 2)})
        
        result = {
            "weekly_revenue": round(float(weekly_revenue), 2),
            "monthly_revenue": round(float(monthly_revenue), 2),
            "total_revenue": round(float(total_revenue), 2),
            "weekly_orders": weekly_orders,
            "monthly_orders": monthly_orders,
            "total_orders": total_orders,
            "top_materials": top_materials,
            "top_dealers": top_dealers,
            "daily": daily,
        }
        
        cache.set("reports_all", result, 60)
        return result
    
    async def get_orders_for_export(self) -> List[Dict]:
        """Get orders for Excel export."""
        return await self.repo.fetch_many(
            "SELECT * FROM orders ORDER BY created_at DESC"
        )

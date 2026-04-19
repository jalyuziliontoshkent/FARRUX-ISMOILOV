"""
Message service.
"""
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from app.db.base import BaseRepository
from app.schemas.messages import MessageCreate
from app.utils.cache import cache


class MessageService:
    """Message operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def send(self, sender: dict, data: MessageCreate) -> dict:
        """Send message."""
        now = datetime.now(timezone.utc).isoformat()
        
        message = await self.repo.fetch_one(
            """
            INSERT INTO messages (sender_id, sender_name, sender_role, receiver_id, text, read, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            """,
            int(sender["id"]),
            sender.get("name", ""),
            sender.get("role", ""),
            int(data.receiver_id),
            data.text,
            False,
            now
        )
        
        cache.invalidate("chat")
        return message
    
    async def get_conversation(self, user_id: str, partner_id: str) -> List[dict]:
        """Get conversation."""
        messages = await self.repo.fetch_many(
            """
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
            """,
            int(user_id),
            int(partner_id)
        )
        
        # Mark as read
        await self.repo.execute(
            "UPDATE messages SET read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE",
            int(partner_id),
            int(user_id)
        )
        
        return messages
    
    async def get_chat_partners(self, user: dict) -> List[dict]:
        """Get chat partners."""
        if user.get("role") == "admin":
            # Admin sees all dealers
            dealers = await self.repo.fetch_many(
                "SELECT * FROM users WHERE role = 'dealer' ORDER BY name"
            )
            
            for dealer in dealers:
                last_msg = await self.repo.fetch_one(
                    """
                    SELECT text, created_at FROM messages 
                    WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    int(user["id"]),
                    int(dealer["id"])
                )
                
                unread = await self.repo.fetchval(
                    "SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE",
                    int(dealer["id"]),
                    int(user["id"])
                )
                
                dealer["last_message"] = last_msg["text"] if last_msg else ""
                dealer["last_message_time"] = last_msg["created_at"] if last_msg else ""
                dealer["unread_count"] = unread or 0
            
            return dealers
        else:
            # Others see admin
            admin = await self.repo.fetch_one(
                "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
            )
            if not admin:
                return []
            
            last_msg = await self.repo.fetch_one(
                """
                SELECT text, created_at FROM messages 
                WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
                ORDER BY created_at DESC LIMIT 1
                """,
                int(user["id"]),
                int(admin["id"])
            )
            
            unread = await self.repo.fetchval(
                "SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE",
                int(admin["id"]),
                int(user["id"])
            )
            
            admin["last_message"] = last_msg["text"] if last_msg else ""
            admin["last_message_time"] = last_msg["created_at"] if last_msg else ""
            admin["unread_count"] = unread or 0
            
            return [admin]

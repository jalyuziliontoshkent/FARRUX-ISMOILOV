"""
Messages router - /api/messages/*
"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas.messages import MessageCreate
from app.services.message_service import MessageService
from app.deps import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])
message_service = MessageService()


@router.post("")
async def send_message(
    data: MessageCreate,
    user: dict = Depends(get_current_user)
):
    """Send message."""
    return await message_service.send(user, data)


@router.get("/{partner_id}")
async def get_messages(
    partner_id: str,
    user: dict = Depends(get_current_user)
) -> List[dict]:
    """Get conversation."""
    return await message_service.get_conversation(user["id"], partner_id)


# Chat partners endpoint at /api/chat/partners
router_partners = APIRouter(prefix="/chat", tags=["chat"])


@router_partners.get("/partners")
async def get_chat_partners(user: dict = Depends(get_current_user)):
    """Get chat partners."""
    return await message_service.get_chat_partners(user)

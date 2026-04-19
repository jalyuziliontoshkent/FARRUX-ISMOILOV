"""Message schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    """Create message."""
    receiver_id: str = Field(...)
    text: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    """Message response."""
    id: str
    sender_id: str
    sender_name: str
    sender_role: str
    receiver_id: str
    text: str
    read: bool
    created_at: str


class ChatPartnerResponse(BaseModel):
    """Chat partner."""
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    credit_limit: Optional[float] = None
    debt: Optional[float] = None
    specialty: Optional[str] = None
    created_at: Optional[str] = None
    last_message: str = ""
    last_message_time: str = ""
    unread_count: int = 0

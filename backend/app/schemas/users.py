"""User schemas."""
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class DealerCreate(BaseModel):
    """Create dealer."""
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=4)
    phone: str = Field(default="")
    address: str = Field(default="")
    credit_limit: float = Field(default=0.0, ge=0)
    
    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class DealerUpdate(BaseModel):
    """Update dealer."""
    name: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = None
    address: Optional[str] = None
    credit_limit: Optional[float] = Field(None, ge=0)


class WorkerCreate(BaseModel):
    """Create worker."""
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=4)
    phone: str = Field(default="")
    specialty: str = Field(default="")
    
    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class PaymentCreate(BaseModel):
    """Create payment."""
    amount: float = Field(..., gt=0)
    note: str = Field(default="")


class UserResponse(BaseModel):
    """User response."""
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

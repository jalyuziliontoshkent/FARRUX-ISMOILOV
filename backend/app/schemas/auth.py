"""Auth schemas."""
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    """Login request."""
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    
    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class UserInToken(BaseModel):
    """User data in token response."""
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


class LoginResponse(BaseModel):
    """Login response."""
    token: str
    user: UserInToken


class ProfileUpdateRequest(BaseModel):
    """Profile update."""
    email: Optional[str] = None
    password: Optional[str] = Field(None, min_length=4)
    current_password: str = Field(..., min_length=1)
    
    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return v.strip().lower()
        return v

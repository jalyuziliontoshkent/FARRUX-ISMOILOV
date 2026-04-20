"""
Application configuration with Supabase integration.
"""
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Production settings with Supabase integration."""
    
    # Application
    APP_NAME: str = "Jalyuzi LionToshkent API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    BCRYPT_ROUNDS: int = 12
    
    # Database - Supabase PostgreSQL
    DATABASE_URL: str  #postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
    DB_POOL_MIN_SIZE: int = 2
    DB_POOL_MAX_SIZE: int = 20
    DB_COMMAND_TIMEOUT: int = 60
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_BUCKET: str = "uploads"
    
    # Redis (optional caching)
    REDIS_URL: Optional[str] = None
    CACHE_DEFAULT_TTL: int = 300
    
    # File Upload (Supabase Storage)
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    
    # Admin
    ADMIN_EMAIL: str = "admin@curtain.uz"
    ADMIN_PASSWORD: str = "admin123"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # External APIs
    CBU_API_URL: str = "https://cbu.uz/oz/arkhiv-kursov-valyut/json/USD/"
    
    model_config = SettingsConfigDict(
        env_file=(".env", "dotenv.txt"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

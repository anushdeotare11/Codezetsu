"""Configuration and database connection utilities."""

import os
from functools import lru_cache
from typing import AsyncGenerator, Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    neon_db_url: str = os.getenv("NEON_DB_URL", "")
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    @property
    def has_database(self) -> bool:
        """Check if a valid database URL is configured."""
        url = self.neon_db_url
        return bool(url) and "your-neon-host" not in url and "localhost" not in url
    
    # Convert postgresql:// to postgresql+asyncpg:// for async support
    @property
    def async_database_url(self) -> str:
        url = self.neon_db_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        # Remove sslmode from URL (asyncpg uses ssl= instead)
        if "sslmode=" in url:
            import re
            url = re.sub(r'[?&]sslmode=[^&]*', '', url)
            # Clean up any trailing ? or &&
            url = url.rstrip('?').replace('?&', '?').replace('&&', '&')
        return url
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

Base = declarative_base()

# Database engine and session - only create if we have a valid DB URL
engine = None
AsyncSessionLocal = None

if settings.has_database:
    engine = create_async_engine(
        settings.async_database_url,
        echo=settings.environment == "development",
        pool_pre_ping=True,
    )
    
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


class MockSession:
    """Mock session that does nothing - used when DB is not available."""
    
    async def execute(self, *args, **kwargs):
        raise Exception("Database not configured")
    
    async def commit(self):
        pass
    
    async def close(self):
        pass
    
    def add(self, *args, **kwargs):
        pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    if AsyncSessionLocal is not None:
        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    else:
        # Return mock session when DB is not configured
        yield MockSession()


async def init_db():
    """Initialize database tables."""
    if engine is not None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:
        print("   No database configured - skipping table creation")

import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    github_id = Column(String(100), unique=True, index=True, nullable=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(150), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    github_access_token = Column(String(500), nullable=True)
    plan = Column(String(50), default="free")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    repositories = relationship("Repository", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")

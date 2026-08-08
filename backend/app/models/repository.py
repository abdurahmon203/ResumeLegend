import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    github_repo_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    github_url = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(100), nullable=True)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    is_sync_active = Column(Boolean, default=True)
    ai_analysis = Column(JSON, nullable=True)  # Store JSON representation of stack, role, summary, and bullet points
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="repositories")

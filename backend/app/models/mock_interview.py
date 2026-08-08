import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(String(36), nullable=True)
    title = Column(String(200), default="Tech & Behavioral Mock Interview")
    competencies = Column(JSON, nullable=False) # e.g. {"languages": ["TypeScript"], "frameworks": ["React", "Next.js"], "tools": ["Docker", "Git", "PostgreSQL", "Redis"]}
    questions = Column(JSON, nullable=False) # Array of 20 questions
    answers = Column(JSON, nullable=True) # Candidate answers submitted
    evaluation = Column(JSON, nullable=True) # AI evaluation result including scores, tech breakdown, weak spots, model answers
    overall_score = Column(Integer, nullable=True, default=0)
    status = Column(String(50), default="in_progress") # in_progress, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="mock_interviews")

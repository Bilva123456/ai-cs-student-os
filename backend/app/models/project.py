import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(Text, nullable=True)   # stored as comma-separated string
    status = Column(String(30), default="Planned")  # Planned, In Progress, Completed
    progress = Column(Integer, default=0)
    github_url = Column(Text, nullable=True)
    live_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

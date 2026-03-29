import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class PracticeItem(Base):
    __tablename__ = "practice_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plugin_id = Column(UUID(as_uuid=True), ForeignKey("plugins.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(100), nullable=True)
    difficulty = Column(String(20), default="Medium")   # Easy, Medium, Hard
    status = Column(String(30), default="Planned")       # Planned, Solving, Mastered
    revision_count = Column(Integer, default=0)
    source_link = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

from sqlalchemy import Column, Integer, String, DateTime, func, Text
from core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    severity = Column(String(16), nullable=False, default="medium")
    source = Column(String(64), nullable=False, default="system")
    message = Column(Text, nullable=True)
    status = Column(String(16), nullable=False, default="new")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

from sqlalchemy import Column, Integer, String, Float, DateTime, func, Text
from core.database import Base

class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String(512), nullable=False)
    scan_type = Column(String(32), nullable=False)
    status = Column(String(16), nullable=False, default="pending")
    findings = Column(Text, nullable=True)
    risk_score = Column(Float, default=0.0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

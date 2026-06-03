import json
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from core.database import get_db
from models.scan import ScanJob
from services.scanner.code_scanner import scan_directory, calculate_risk_score
from services.scanner.secret_scanner import scan_path_for_secrets

router = APIRouter(prefix="/scans", tags=["scans"])

class ScanRequest(BaseModel):
    target: str
    scan_type: str = "code"

@router.post("")
async def create_scan(req: ScanRequest, db: AsyncSession = Depends(get_db)):
    scan = ScanJob(target=req.target, scan_type=req.scan_type, status="running", started_at=datetime.datetime.now(datetime.timezone.utc))
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    findings = []
    try:
        if req.scan_type in ("code", "full"):
            code_findings = scan_directory(req.target)
            findings.extend(f.to_dict() for f in code_findings)
        if req.scan_type in ("secret", "full"):
            secret_findings = scan_path_for_secrets(req.target)
            findings.extend(f.to_dict() for f in secret_findings)
        risk_score = calculate_risk_score(code_findings) if req.scan_type in ("code", "full") else 0.0
        scan.findings = json.dumps(findings, default=str)
        scan.risk_score = risk_score
        scan.status = "completed"
    except Exception as e:
        scan.status = "failed"
        scan.findings = json.dumps([{"error": str(e)}])
    scan.completed_at = datetime.datetime.now(datetime.timezone.utc)
    await db.commit()
    await db.refresh(scan)
    return {
        "id": scan.id,
        "target": scan.target,
        "scan_type": scan.scan_type,
        "status": scan.status,
        "findings_count": len(findings),
        "risk_score": scan.risk_score,
    }

@router.get("")
async def list_scans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ScanJob).order_by(ScanJob.created_at.desc()).offset(skip).limit(limit))
    scans = result.scalars().all()
    return [
        {
            "id": s.id,
            "target": s.target,
            "scan_type": s.scan_type,
            "status": s.status,
            "risk_score": s.risk_score,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in scans
    ]

@router.get("/{scan_id}")
async def get_scan(scan_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScanJob).where(ScanJob.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {
        "id": scan.id,
        "target": scan.target,
        "scan_type": scan.scan_type,
        "status": scan.status,
        "risk_score": scan.risk_score,
        "findings": json.loads(scan.findings) if scan.findings else [],
        "started_at": scan.started_at.isoformat() if scan.started_at else None,
        "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
    }

@router.delete("/{scan_id}")
async def delete_scan(scan_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScanJob).where(ScanJob.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    await db.delete(scan)
    await db.commit()
    return {"detail": "Scan deleted"}

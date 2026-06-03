from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from services.alerter import alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("")
async def list_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    alerts = await alert_service.get_alerts(db, severity=severity, status=status, skip=skip, limit=limit)
    return [
        {
            "id": a.id,
            "title": a.title,
            "severity": a.severity,
            "source": a.source,
            "message": a.message,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
        }
        for a in alerts
    ]

@router.put("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await alert_service.acknowledge_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"id": alert.id, "status": alert.status}

@router.put("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await alert_service.resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"id": alert.id, "status": alert.status, "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None}

@router.get("/stats")
async def alert_stats(db: AsyncSession = Depends(get_db)):
    return await alert_service.get_stats(db)

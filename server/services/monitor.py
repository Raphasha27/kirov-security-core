import time
from typing import Dict, Any
from sqlalchemy import select, func
from core.database import async_session
from models.scan import ScanJob
from models.alert import Alert

_start_time = time.time()

async def get_uptime() -> float:
    return round(time.time() - _start_time, 2)

async def health_check() -> Dict[str, Any]:
    uptime = await get_uptime()
    async with async_session() as db:
        active_scans_q = await db.execute(
            select(func.count(ScanJob.id)).where(ScanJob.status.in_(["pending", "running"]))
        )
        active_scans = active_scans_q.scalar() or 0

        total_alerts_q = await db.execute(select(func.count(Alert.id)))
        total_alerts = total_alerts_q.scalar() or 0

        new_alerts_q = await db.execute(
            select(func.count(Alert.id)).where(Alert.status == "new")
        )
        new_alerts = new_alerts_q.scalar() or 0

    return {
        "status": "healthy",
        "uptime_seconds": uptime,
        "active_scans": active_scans,
        "total_alerts": total_alerts,
        "new_alerts": new_alerts,
        "version": "1.0.0",
    }

async def get_dashboard_summary() -> Dict[str, Any]:
    async with async_session() as db:
        total_scans_q = await db.execute(select(func.count(ScanJob.id)))
        total_scans = total_scans_q.scalar() or 0

        active_alerts_q = await db.execute(
            select(func.count(Alert.id)).where(Alert.status.in_(["new", "acknowledged"]))
        )
        active_alerts = active_alerts_q.scalar() or 0

        avg_risk_q = await db.execute(select(func.avg(ScanJob.risk_score)))
        avg_risk = round(avg_risk_q.scalar() or 0.0, 1)

    return {
        "total_scans": total_scans,
        "active_alerts": active_alerts,
        "average_risk_score": avg_risk,
        "uptime_seconds": await get_uptime(),
        "status": "operational",
    }

async def get_recent_activity(limit: int = 10) -> list:
    async with async_session() as db:
        scans_q = await db.execute(
            select(ScanJob).order_by(ScanJob.created_at.desc()).limit(limit)
        )
        scans = scans_q.scalars().all()
        alerts_q = await db.execute(
            select(Alert).order_by(Alert.created_at.desc()).limit(limit)
        )
        alerts = alerts_q.scalars().all()

    activities = []
    for s in scans:
        activities.append({
            "type": "scan",
            "description": f"Scan [{s.scan_type}] of '{s.target}' -> {s.status}",
            "timestamp": s.created_at.isoformat() if s.created_at else "",
        })
    for a in alerts:
        activities.append({
            "type": "alert",
            "description": f"Alert [{a.severity}] {a.title}",
            "timestamp": a.created_at.isoformat() if a.created_at else "",
        })

    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

async def get_trends(days: int = 7) -> Dict[str, Any]:
    from datetime import datetime, timedelta, timezone
    since = datetime.now(timezone.utc) - timedelta(days=days)
    async with async_session() as db:
        scans_q = await db.execute(
            select(func.date(ScanJob.created_at), func.count(ScanJob.id))
            .where(ScanJob.created_at >= since)
            .group_by(func.date(ScanJob.created_at))
        )
        scan_trends = [{"date": str(row[0]), "count": row[1]} for row in scans_q]

        alerts_q = await db.execute(
            select(func.date(Alert.created_at), func.count(Alert.id))
            .where(Alert.created_at >= since)
            .group_by(func.date(Alert.created_at))
        )
        alert_trends = [{"date": str(row[0]), "count": row[1]} for row in alerts_q]

    return {
        "scans": scan_trends,
        "alerts": alert_trends,
        "period_days": days,
    }

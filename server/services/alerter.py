import json
import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.alert import Alert

logger = logging.getLogger("kirov")

class AlertService:
    def __init__(self):
        self.webhook_url: Optional[str] = None

    async def create_alert(
        self, db: AsyncSession, title: str, severity: str = "medium",
        source: str = "system", message: str = ""
    ) -> Alert:
        alert = Alert(
            title=title,
            severity=severity,
            source=source,
            message=message,
            status="new",
        )
        db.add(alert)
        await db.commit()
        await db.refresh(alert)
        logger.warning(f"Alert created: [{severity.upper()}] {title}")
        await self.route_alert(alert)
        return alert

    async def get_alerts(
        self, db: AsyncSession, severity: Optional[str] = None,
        status: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[Alert]:
        query = select(Alert)
        if severity:
            query = query.where(Alert.severity == severity)
        if status:
            query = query.where(Alert.status == status)
        query = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def acknowledge_alert(self, db: AsyncSession, alert_id: int) -> Optional[Alert]:
        result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert = result.scalar_one_or_none()
        if alert:
            alert.status = "acknowledged"
            await db.commit()
            await db.refresh(alert)
        return alert

    async def resolve_alert(self, db: AsyncSession, alert_id: int) -> Optional[Alert]:
        result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert = result.scalar_one_or_none()
        if alert:
            alert.status = "resolved"
            alert.resolved_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(alert)
        return alert

    async def get_stats(self, db: AsyncSession) -> dict:
        from sqlalchemy import func
        total_q = await db.execute(select(func.count(Alert.id)))
        total = total_q.scalar() or 0
        new_q = await db.execute(select(func.count(Alert.id)).where(Alert.status == "new"))
        new_count = new_q.scalar() or 0
        crit_q = await db.execute(select(func.count(Alert.id)).where(Alert.severity == "critical"))
        crit_count = crit_q.scalar() or 0
        resolved_q = await db.execute(select(func.count(Alert.id)).where(Alert.status == "resolved"))
        resolved_count = resolved_q.scalar() or 0
        return {
            "total": total,
            "new": new_count,
            "critical": crit_count,
            "acknowledged": total - new_count - resolved_count,
            "resolved": resolved_count,
        }

    async def route_alert(self, alert: Alert):
        logger.info(f"Alert routed: {alert.title}")
        if self.webhook_url:
            try:
                import httpx
                async with httpx.AsyncClient() as client:
                    await client.post(self.webhook_url, json={
                        "title": alert.title,
                        "severity": alert.severity,
                        "message": alert.message,
                    })
            except Exception as e:
                logger.error(f"Webhook failed for alert {alert.id}: {e}")


alert_service = AlertService()

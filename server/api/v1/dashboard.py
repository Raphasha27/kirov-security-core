from fastapi import APIRouter
from services.monitor import get_dashboard_summary, get_recent_activity, get_trends

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def dashboard_summary():
    return await get_dashboard_summary()

@router.get("/recent")
async def recent_activity():
    return await get_recent_activity()

@router.get("/trends")
async def trends():
    return await get_trends()

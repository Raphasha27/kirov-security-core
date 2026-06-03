from fastapi import APIRouter
from .auth import router as auth_router
from .scans import router as scans_router
from .alerts import router as alerts_router
from .dashboard import router as dashboard_router
from .assistant import router as assistant_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(scans_router)
api_router.include_router(alerts_router)
api_router.include_router(dashboard_router)
api_router.include_router(assistant_router)

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core.config import settings

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("kirov")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        elapsed = time.time() - start
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({elapsed:.3f}s)"
        )
        return response

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config.settings import settings


from app.constants import AssetStatus, UserRole
from app.database.connection import shutdown, startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize application services on startup and close them on shutdown."""
    await startup()
    try:
        yield
    finally:
        await shutdown()

print("Loaded Mongo URI:", settings.MONGODB_URI)
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for AssetFlow ERP",
    lifespan=lifespan,
)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }


@app.get("/constants")
def get_constants():
    return {
        "roles": [role.value for role in UserRole],
        "asset_status": [status.value for status in AssetStatus],
    }


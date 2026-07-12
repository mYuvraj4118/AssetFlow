from fastapi import FastAPI

from app.config.settings import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for AssetFlow ERP",
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
        "status": "healthy"
    }

from app.constants import UserRole, AssetStatus


@app.get("/constants")
def get_constants():
    return {
        "roles": [role.value for role in UserRole],
        "asset_status": [status.value for status in AssetStatus],
    }
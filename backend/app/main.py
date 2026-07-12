from fastapi import FastAPI


# Initialize FastAPI application with metadata.
app = FastAPI(
    title="AssetFlow API",
    description="Backend API for AssetFlow Asset Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.get("/", response_model=dict[str, str])
def read_root() -> dict[str, str]:
    """Root endpoint for basic API connectivity checks."""
    return {
        "message": "Welcome to AssetFlow API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health", response_model=dict[str, str])
def health_check() -> dict[str, str]:
    """Health endpoint for readiness and liveness probes."""
    return {"status": "healthy"}

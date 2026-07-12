from fastapi import APIRouter, status, Query, Depends
from app.schemas.activity_log import ActivityLogCreate, ActivityLogResponse, ActivityLogFilter
from app.services.activity_log_service import ActivityLogService

router = APIRouter(
    prefix="/api/activity-logs",
    tags=["Activity Logs"],
)

@router.get(
    "",
    response_model=list[ActivityLogResponse],
)
async def get_activity_logs(
    module: str | None = Query(None, description="Filter by module"),
    user: str | None = Query(None, description="Filter by user name"),
    action_status: str | None = Query(None, description="Filter by status")
):
    filters = ActivityLogFilter(module=module, user=user, status=action_status)
    return await ActivityLogService.get_activity_logs(filters)

@router.get(
    "/recent",
    response_model=list[ActivityLogResponse],
)
async def get_recent_activities(limit: int = Query(10, ge=1, le=100, description="Max logs count to return")):
    return await ActivityLogService.get_recent_activities(limit)

@router.post(
    "",
    response_model=ActivityLogResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_activity_log(data: ActivityLogCreate):
    return await ActivityLogService.create_activity_log(data)

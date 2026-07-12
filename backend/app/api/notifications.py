from beanie import PydanticObjectId
from fastapi import APIRouter, status, Query, HTTPException
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)

@router.get(
    "",
    response_model=list[NotificationResponse],
)
async def get_notifications(user_id: PydanticObjectId | None = Query(None, description="Filter by user ID")):
    return await NotificationService.get_notifications(user_id)

@router.get(
    "/unread",
    response_model=list[NotificationResponse],
)
async def get_unread_notifications(user_id: PydanticObjectId | None = Query(None, description="Filter by user ID")):
    return await NotificationService.get_unread_notifications(user_id)

@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification(data: NotificationCreate):
    return await NotificationService.create_notification(data)

@router.patch(
    "/{id}/read",
    response_model=NotificationResponse,
)
async def mark_as_read(id: PydanticObjectId):
    return await NotificationService.mark_as_read(id)

@router.patch(
    "/read-all",
)
async def mark_all_as_read(user_id: PydanticObjectId | None = Query(None, description="Filter by user ID")):
    count = await NotificationService.mark_all_as_read(user_id)
    return {"message": f"Successfully marked {count} notifications as read."}

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_notification(id: PydanticObjectId):
    await NotificationService.delete_notification(id)

@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def clear_all_notifications(user_id: PydanticObjectId | None = Query(None, description="Filter by user ID")):
    await NotificationService.clear_all_notifications(user_id)

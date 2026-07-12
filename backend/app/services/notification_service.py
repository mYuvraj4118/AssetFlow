from beanie import PydanticObjectId
from fastapi import HTTPException, status
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from datetime import datetime, timezone

class NotificationService:
    # Optional listeners for WebSockets / SSE integrations
    _listeners = []

    @classmethod
    def register_listener(cls, callback):
        cls._listeners.append(callback)

    @classmethod
    def unregister_listener(cls, callback):
        if callback in cls._listeners:
            cls._listeners.remove(callback)

    @classmethod
    async def _notify_listeners(cls, notification: Notification):
        for listener in cls._listeners:
            try:
                await listener(notification)
            except Exception:
                pass

    @staticmethod
    async def create_notification(data: NotificationCreate) -> Notification:
        # Check priority validity
        if data.priority not in ["Critical", "High", "Medium", "Low"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notification priority level."
            )

        notification = Notification(**data.model_dump())
        await notification.insert()

        # Trigger listeners asynchronously
        await NotificationService._notify_listeners(notification)
        return notification

    @staticmethod
    async def get_notifications(user_id: PydanticObjectId | None = None) -> list[Notification]:
        if user_id:
            return await Notification.find(Notification.user_id == user_id).sort(-Notification.created_at).to_list()
        return await Notification.find_all().sort(-Notification.created_at).to_list()

    @staticmethod
    async def get_unread_notifications(user_id: PydanticObjectId | None = None) -> list[Notification]:
        if user_id:
            return await Notification.find(Notification.user_id == user_id, Notification.read == False).sort(-Notification.created_at).to_list()
        return await Notification.find(Notification.read == False).sort(-Notification.created_at).to_list()

    @staticmethod
    async def mark_as_read(notif_id: PydanticObjectId) -> Notification:
        notif = await Notification.get(notif_id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found."
            )

        # Duplicate read protection
        if notif.read:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Notification is already marked as read."
            )

        notif.read = True
        notif.updated_at = datetime.now(timezone.utc)
        await notif.save()
        return notif

    @staticmethod
    async def mark_all_as_read(user_id: PydanticObjectId | None = None) -> int:
        if user_id:
            unread = await Notification.find(Notification.user_id == user_id, Notification.read == False).to_list()
            for u in unread:
                u.read = True
                u.updated_at = datetime.now(timezone.utc)
                await u.save()
            return len(unread)
        
        unread = await Notification.find(Notification.read == False).to_list()
        for u in unread:
            u.read = True
            u.updated_at = datetime.now(timezone.utc)
            await u.save()
        return len(unread)

    @staticmethod
    async def delete_notification(notif_id: PydanticObjectId) -> None:
        notif = await Notification.get(notif_id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found."
            )
        await notif.delete()

    @staticmethod
    async def clear_all_notifications(user_id: PydanticObjectId | None = None) -> None:
        if user_id:
            await Notification.find(Notification.user_id == user_id).delete()
        else:
            await Notification.find_all().delete()

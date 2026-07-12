from beanie import PydanticObjectId
from fastapi import HTTPException
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogCreate, ActivityLogFilter

class ActivityLogService:

    @staticmethod
    async def create_activity_log(data: ActivityLogCreate) -> ActivityLog:
        log = ActivityLog(**data.model_dump())
        await log.insert()
        return log

    @staticmethod
    async def get_activity_logs(filters: ActivityLogFilter | None = None) -> list[ActivityLog]:
        query = {}
        if filters:
            if filters.module:
                query[ActivityLog.module] = filters.module
            if filters.user:
                query[ActivityLog.user] = filters.user
            if filters.status:
                query[ActivityLog.status] = filters.status

        # If query has fields, find matching logs; otherwise get all
        if query:
            return await ActivityLog.find(query).sort(-ActivityLog.timestamp).to_list()
        return await ActivityLog.find_all().sort(-ActivityLog.timestamp).to_list()

    @staticmethod
    async def get_recent_activities(limit: int = 10) -> list[ActivityLog]:
        return await ActivityLog.find_all().sort(-ActivityLog.timestamp).limit(limit).to_list()

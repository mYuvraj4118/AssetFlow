import logging
from typing import Optional

from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
)

from app.database.mongodb import close_mongo_connection, connect_to_mongo

logger = logging.getLogger(__name__)

# Global database connection instance
_db_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def startup() -> None:
    """Initialize database connection during application startup."""
    global _db_client, _database

    logger.info("Initializing database connection...")
    await connect_to_mongo()
    _db_client = get_client()
    _database = get_database()
    
    # Initialize Beanie ODM
    from beanie import init_beanie
    from app.models.allocation import Allocation
    from app.models.booking import Booking
    from app.models.maintenance import Maintenance
    from app.models.transfer import Transfer
    from app.models.audit import AuditCycle, AuditRecord
    from app.models.report import Report, ReportSnapshot, AnalyticsCache
    from app.models.notification import Notification, NotificationPreferences
    from app.models.activity_log import ActivityLog

    await init_beanie(
        database=_database,
        document_models=[
            Allocation,
            Booking,
            Maintenance,
            Transfer,
            AuditCycle,
            AuditRecord,
            Report,
            ReportSnapshot,
            AnalyticsCache,
            Notification,
            NotificationPreferences,
            ActivityLog
        ]
    )

    logger.info("Database connection and Beanie ODM established successfully")


async def shutdown() -> None:
    """Close database connection during application shutdown."""
    global _db_client, _database

    logger.info("Closing database connection...")
    await close_mongo_connection()
    _db_client = None
    _database = None
    logger.info("Database connection closed successfully")


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Get the current database instance."""
    from app.database.mongodb import get_database as get_mongo_database

    return get_mongo_database()


def get_client() -> Optional[AsyncIOMotorClient]:
    """Get the current MongoDB client instance."""
    from app.database.mongodb import _db_client as mongo_client

    return mongo_client

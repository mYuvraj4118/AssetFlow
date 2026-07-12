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
    logger.info("Database connection established successfully")

    # Idempotent Index Initialization for Assets and AssetHistory
    try:
        from app.models.asset import Asset
        from app.models.asset_history import AssetHistory

        logger.info("Initializing database indexes...")
        
        asset_coll = _database.get_collection(Asset.collection_name())
        for definition in Asset.index_definitions():
            await asset_coll.create_index(definition["keys"], **definition["kwargs"])
            
        history_coll = _database.get_collection(AssetHistory.collection_name())
        for definition in AssetHistory.index_definitions():
            await history_coll.create_index(definition["keys"], **definition["kwargs"])

        logger.info("Database indexes initialized successfully")
    except Exception as exc:
        logger.error(f"Failed to initialize database indexes: {exc}")



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

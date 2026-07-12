"""MongoDB connection module for AssetFlow backend.

This module provides async MongoDB connection management using Motor.
It implements a singleton pattern for database connections.
"""

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import settings

# Global database instance
_db_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    """
    Establish connection to MongoDB.

    Initializes the global Motor client and database connection.
    Should be called on application startup.

    Raises:
        ValueError: If MONGODB_URI is not configured.
        Exception: If connection to MongoDB fails.
    """
    global _db_client, _database

    try:
        if not settings.MONGODB_URI:
            raise ValueError("MONGODB_URI is not configured in settings")

        _db_client = AsyncIOMotorClient(settings.MONGODB_URI)

        # Verify connection by pinging the server
        await _db_client.admin.command("ping")

        _database = _db_client[settings.DATABASE_NAME]

    except ValueError:
        raise
    except Exception as exc:
        raise RuntimeError(
            f"Failed to connect to MongoDB at {settings.MONGODB_URI}"
        ) from exc


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection.

    Should be called on application shutdown.
    Safely closes the global Motor client if it exists.
    """
    global _db_client

    if _db_client is not None:
        _db_client.close()
        _db_client = None


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the MongoDB database instance.

    Returns:
        AsyncIOMotorDatabase: The connected database instance.

    Raises:
        RuntimeError: If database connection is not established.
    """
    if _database is None:
        raise RuntimeError(
            "Database connection not established. "
            "Call connect_to_mongo() first."
        )

    return _database

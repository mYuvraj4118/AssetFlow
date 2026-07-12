from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument


async def generate_next_asset_tag(db: AsyncIOMotorDatabase) -> str:
    """Atomically generate the next sequential unique asset tag in MongoDB.

    Uses a counters collection with an atomic find_one_and_update and $inc
    operation to ensure concurrency safety.

    Args:
        db: The connected AsyncIOMotorDatabase instance.

    Returns:
        str: The generated tag, e.g., 'AF-0001'.
    """
    counters_collection = db.get_collection("counters")

    counter = await counters_collection.find_one_and_update(
        {"_id": "asset_tag"},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    sequence = counter.get("sequence", 1)
    return f"AF-{sequence:04d}"

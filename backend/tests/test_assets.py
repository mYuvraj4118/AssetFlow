from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import pytest
from bson import ObjectId
from fastapi import HTTPException, status

from app.constants import AssetCondition, AssetStatus
from app.models.asset import Asset
from app.models.asset_history import HistoryEventType
from app.schemas.asset import AssetCreate, AssetUpdate, AssetStatusUpdate
from app.services.asset_history_service import AssetHistoryService
from app.services.asset_service import AssetService
from app.services.department_service import DepartmentService


# ==========================================================================
# MOCK MONGODB ENGINE FOR IN-MEMORY TESTING
# ==========================================================================

class MockAsyncCursor:
    """Mock MongoDB async cursor class."""

    def __init__(self, items: list[dict[str, Any]]) -> None:
        self.items = items
        self.index = 0

    def sort(self, keys: Any, direction: int = 1) -> MockAsyncCursor:
        # Simple sorting implementation
        if isinstance(keys, list) and len(keys) > 0:
            key, dir_val = keys[0]
        else:
            key, dir_val = keys, direction

        def sort_key(doc: dict[str, Any]) -> Any:
            val = doc.get(key)
            if val is None:
                return ""
            return val

        rev = dir_val == -1
        self.items.sort(key=sort_key, reverse=rev)
        return self

    def skip(self, count: int) -> MockAsyncCursor:
        self.items = self.items[count:]
        return self

    def limit(self, count: int) -> MockAsyncCursor:
        self.items = self.items[:count]
        return self

    def __aiter__(self) -> MockAsyncCursor:
        return self

    async def __anext__(self) -> dict[str, Any]:
        if self.index >= len(self.items):
            raise StopAsyncIteration
        item = self.items[self.index]
        self.index += 1
        return item


class MockCollection:
    """Mock MongoDB collection that handles CRUD actions asynchronously in memory."""

    def __init__(self, data_list: list[dict[str, Any]]) -> None:
        self.data_list = data_list

    async def insert_one(self, document: dict[str, Any]) -> Any:
        if "_id" not in document:
            document["_id"] = ObjectId()
        self.data_list.append(document)

        class Result:
            inserted_id = document["_id"]

        return Result()

    async def find_one(self, query: dict[str, Any]) -> Optional[dict[str, Any]]:
        for item in self.data_list:
            if self._matches(item, query):
                return item
        return None

    def find(self, query: dict[str, Any]) -> MockAsyncCursor:
        matched = [item for item in self.data_list if self._matches(item, query)]
        return MockAsyncCursor(matched)

    async def count_documents(self, query: dict[str, Any]) -> int:
        matched = [item for item in self.data_list if self._matches(item, query)]
        return len(matched)

    async def find_one_and_update(
        self,
        query: dict[str, Any],
        update: dict[str, Any],
        return_document: Any = None,
        upsert: bool = False,
    ) -> Optional[dict[str, Any]]:
        target = None
        for item in self.data_list:
            if self._matches(item, query):
                target = item
                break

        if not target:
            if upsert:
                new_item = {"_id": query.get("_id") or ObjectId()}
                self.data_list.append(new_item)
                target = new_item
            else:
                return None

        if "$set" in update:
            target.update(update["$set"])
        if "$inc" in update:
            for k, v in update["$inc"].items():
                target[k] = target.get(k, 0) + v

        return target

    async def update_one(self, query: dict[str, Any], update: dict[str, Any]) -> Any:
        matched_count_val = 0
        for item in self.data_list:
            if self._matches(item, query):
                matched_count_val += 1
                if "$set" in update:
                    item.update(update["$set"])

        class Result:
            def __init__(self, count: int) -> None:
                self.matched_count = count

        return Result(matched_count_val)

    def _matches(self, item: dict[str, Any], query: dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or":
                or_match = False
                for sub_q in v:
                    if self._matches(item, sub_q):
                        or_match = True
                        break
                if not or_match:
                    return False
            elif k == "_id":
                if item.get("_id") != v:
                    return False
            elif k == "is_deleted":
                if item.get("is_deleted") != v:
                    return False
            elif isinstance(v, dict):
                val = item.get(k)
                for op, op_val in v.items():
                    if op == "$regex":
                        if not re.search(op_val, str(val or ""), re.IGNORECASE):
                            return False
                    elif op == "$ne":
                        if val == op_val:
                            return False
                    elif op == "$type":
                        if op_val == "string" and not isinstance(val, str):
                            return False
            else:
                if item.get(k) != v:
                    return False
        return True


# ==========================================================================
# PYTEST FIXTURES & SETUP
# ==========================================================================

@pytest.fixture
def mock_db() -> Dict[str, list[dict[str, Any]]]:
    """In-memory database collections storage."""
    return {
        "assets": [],
        "asset_history": [],
        "counters": [],
        "departments": [
            {
                "_id": ObjectId("65d12d4a9c8d7e6f0a1b2c41"),
                "name": "Engineering",
                "code": "ENG",
                "is_deleted": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        ],
    }


@pytest.fixture(autouse=True)
def patch_services(monkeypatch: pytest.MonkeyPatch, mock_db: Dict[str, list[dict[str, Any]]]) -> None:
    """Monkeypatch the service layers to use the in-memory mock collections instead of real MongoDB."""

    def mock_asset_init(self: AssetService) -> None:
        self.collection = MockCollection(mock_db["assets"])
        self.history_service = AssetHistoryService()

    def mock_history_init(self: AssetHistoryService) -> None:
        self.collection = MockCollection(mock_db["asset_history"])

    def mock_department_init(self: DepartmentService) -> None:
        self.collection = MockCollection(mock_db["departments"])

    async def mock_generate_next_asset_tag(db: Any) -> str:
        # Atomic tag generator in-memory implementation
        counters = MockCollection(mock_db["counters"])
        counter = await counters.find_one_and_update(
            {"_id": "asset_tag"},
            {"$inc": {"sequence": 1}},
            upsert=True,
        )
        seq = counter.get("sequence", 1)
        return f"AF-{seq:04d}"

    class MockDatabase:
        def get_collection(self, name: str) -> MockCollection:
            return MockCollection(mock_db.setdefault(name, []))

    monkeypatch.setattr(AssetService, "__init__", mock_asset_init)
    monkeypatch.setattr(AssetHistoryService, "__init__", mock_history_init)
    monkeypatch.setattr(DepartmentService, "__init__", mock_department_init)
    monkeypatch.setattr("app.services.asset_service.generate_next_asset_tag", mock_generate_next_asset_tag)
    
    # Mock all get_database calls to return MockDatabase
    monkeypatch.setattr("app.services.asset_service.get_database", MockDatabase)
    monkeypatch.setattr("app.services.asset_history_service.get_database", MockDatabase)
    monkeypatch.setattr("app.services.department_service.get_database", MockDatabase)
    monkeypatch.setattr("app.database.mongodb.get_database", MockDatabase)


# ==========================================================================
# COMPREHENSIVE PHASE 5 TEST SUITE
# ==========================================================================

@pytest.mark.asyncio
async def test_create_valid_asset() -> None:
    """Test standard asset registration generates correct fields and sequential tags."""
    service = AssetService()

    asset_in = AssetCreate(
        name="MacBook Pro 16",
        category_id=str(ObjectId()),
        serial_number="MBP-2026-X12",
        acquisition_cost=2499.99,
        condition=AssetCondition.EXCELLENT,
        department_id="65d12d4a9c8d7e6f0a1b2c41",  # Valid mock department
        location="HQ Office 3rd Floor",
        is_shared_resource=False,
    )

    result = await service.create_asset(asset_in, performed_by=str(ObjectId()))

    assert result.id is not None
    assert result.asset_tag == "AF-0001"
    assert result.name == "MacBook Pro 16"
    assert result.status == AssetStatus.AVAILABLE
    assert result.is_deleted is False


@pytest.mark.asyncio
async def test_asset_tag_generation_concurrency_and_sequence() -> None:
    """Test sequential asset tag generation generates unique sequential tags."""
    service = AssetService()

    asset1 = AssetCreate(
        name="Monitor Dell 27",
        category_id=str(ObjectId()),
        serial_number="SN-DELL-1",
        condition=AssetCondition.GOOD,
    )
    asset2 = AssetCreate(
        name="Monitor Dell 27",
        category_id=str(ObjectId()),
        serial_number="SN-DELL-2",
        condition=AssetCondition.GOOD,
    )

    res1 = await service.create_asset(asset1)
    res2 = await service.create_asset(asset2)

    assert res1.asset_tag == "AF-0001"
    assert res2.asset_tag == "AF-0002"


@pytest.mark.asyncio
async def test_duplicate_serial_number_prevention() -> None:
    """Test duplicate non-empty serial number is rejected, but multiple None values are allowed."""
    service = AssetService()
    cat_id = str(ObjectId())

    asset1 = AssetCreate(
        name="Asset 1",
        category_id=cat_id,
        serial_number="SAME-SERIAL-123",
        condition=AssetCondition.GOOD,
    )
    await service.create_asset(asset1)

    # 1. Reject duplicate serial number
    asset2 = AssetCreate(
        name="Asset 2",
        category_id=cat_id,
        serial_number="SAME-SERIAL-123",
        condition=AssetCondition.GOOD,
    )
    with pytest.raises(HTTPException) as exc:
        await service.create_asset(asset2)
    assert exc.value.status_code == status.HTTP_409_CONFLICT

    # 2. Multiple empty serial numbers (None) are allowed
    empty1 = AssetCreate(
        name="Empty Serial 1",
        category_id=cat_id,
        serial_number=None,
        condition=AssetCondition.GOOD,
    )
    empty2 = AssetCreate(
        name="Empty Serial 2",
        category_id=cat_id,
        serial_number="",  # Schema normalizes "" to None
        condition=AssetCondition.GOOD,
    )

    res1 = await service.create_asset(empty1)
    res2 = await service.create_asset(empty2)

    assert res1.serial_number is None
    assert res2.serial_number is None


@pytest.mark.asyncio
async def test_invalid_and_missing_objectid_handling() -> None:
    """Test malformed ObjectID formats return 400 Bad Request error."""
    service = AssetService()

    # 1. Invalid ID check
    with pytest.raises(HTTPException) as exc:
        await service.get_asset_by_id("invalid-id-format")
    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST

    # 2. Missing/Non-existent ID check
    with pytest.raises(HTTPException) as exc:
        await service.get_asset_by_id(str(ObjectId()))
    assert exc.value.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_partial_asset_update() -> None:
    """Test partial updates and unique serial check on update."""
    service = AssetService()
    cat_id = str(ObjectId())

    # Create initial asset
    asset = await service.create_asset(
        AssetCreate(
            name="Original Name",
            category_id=cat_id,
            serial_number="SERIAL-UPDATE",
            condition=AssetCondition.GOOD,
        )
    )

    # 1. Perform partial update
    update_data = AssetUpdate(
        name="Updated Name",
        location="Warehouse A",
    )
    updated = await service.update_asset(asset.id, update_data)

    assert updated.name == "Updated Name"
    assert updated.location == "Warehouse A"
    assert updated.serial_number == "SERIAL-UPDATE"  # Unchanged


@pytest.mark.asyncio
async def test_lifecycle_status_transitions() -> None:
    """Test lifecycle transition map constraints."""
    service = AssetService()
    cat_id = str(ObjectId())

    asset = await service.create_asset(
        AssetCreate(
            name="Lifecycle Asset",
            category_id=cat_id,
            condition=AssetCondition.GOOD,
        )
    )

    # 1. Available -> Allocated: Valid
    updated = await service.change_asset_status(asset.id, AssetStatus.ALLOCATED)
    assert updated.status == AssetStatus.ALLOCATED

    # 2. Allocated -> Disposed: Invalid transition
    with pytest.raises(HTTPException) as exc:
        await service.change_asset_status(asset.id, AssetStatus.DISPOSED)
    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST

    # 3. Allocated -> Available: Valid
    updated = await service.change_asset_status(asset.id, AssetStatus.AVAILABLE)
    assert updated.status == AssetStatus.AVAILABLE


@pytest.mark.asyncio
async def test_soft_delete_and_restore() -> None:
    """Test soft deletion, restore, and exclusion from active search results."""
    service = AssetService()
    cat_id = str(ObjectId())

    asset = await service.create_asset(
        AssetCreate(
            name="Deleted Asset",
            category_id=cat_id,
            condition=AssetCondition.GOOD,
        )
    )

    # 1. Soft delete
    await service.soft_delete_asset(asset.id)

    # 2. Excluded from normal search
    with pytest.raises(HTTPException) as exc:
        await service.get_asset_by_id(asset.id)
    assert exc.value.status_code == status.HTTP_404_NOT_FOUND

    # 3. Restore
    restored = await service.restore_asset(asset.id)
    assert restored.is_deleted is False

    # 4. Accessible again
    active_asset = await service.get_asset_by_id(asset.id)
    assert active_asset.name == "Deleted Asset"


@pytest.mark.asyncio
async def test_soft_delete_protection_rule() -> None:
    """Test that assets with operational statuses (Allocated/Under Maintenance) cannot be deleted."""
    service = AssetService()
    cat_id = str(ObjectId())

    asset = await service.create_asset(
        AssetCreate(
            name="Active Workflow Asset",
            category_id=cat_id,
            condition=AssetCondition.GOOD,
        )
    )

    # Transition to Allocated
    await service.change_asset_status(asset.id, AssetStatus.ALLOCATED)

    # Verify soft delete is rejected
    with pytest.raises(HTTPException) as exc:
        await service.soft_delete_asset(asset.id)
    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_asset_history_event_logging() -> None:
    """Test append-only history logs are recorded for all lifecycle events."""
    service = AssetService()
    history_service = AssetHistoryService()
    cat_id = str(ObjectId())

    # 1. Create -> REGISTERED event
    asset = await service.create_asset(
        AssetCreate(
            name="Audited Asset",
            category_id=cat_id,
            condition=AssetCondition.GOOD,
        )
    )

    # 2. Update -> UPDATED event
    await service.update_asset(asset.id, AssetUpdate(location="Office Room 2"))

    # 3. Status change -> STATUS_CHANGED event
    await service.change_asset_status(asset.id, AssetStatus.RESERVED)
    await service.change_asset_status(asset.id, AssetStatus.AVAILABLE)

    # 4. Soft Delete -> DELETED event
    await service.soft_delete_asset(asset.id)

    # 5. Restore -> RESTORED event
    await service.restore_asset(asset.id)

    events = await history_service.get_history_by_asset_id(asset.id)

    # History logs should be sorted descending by timestamp
    assert len(events) == 6
    assert events[0]["event_type"] == HistoryEventType.RESTORED.value
    assert events[1]["event_type"] == HistoryEventType.DELETED.value
    assert events[2]["event_type"] == HistoryEventType.STATUS_CHANGED.value
    assert events[3]["event_type"] == HistoryEventType.STATUS_CHANGED.value
    assert events[4]["event_type"] == HistoryEventType.UPDATED.value
    assert events[5]["event_type"] == HistoryEventType.REGISTERED.value


@pytest.mark.asyncio
async def test_list_assets_filtering_and_search() -> None:
    """Test directory listing filters, text search, sorting, and pagination."""
    service = AssetService()
    cat_id = str(ObjectId())
    dep_id = "65d12d4a9c8d7e6f0a1b2c41"

    # Create 3 dummy assets
    await service.create_asset(
        AssetCreate(
            name="Alpha Server",
            category_id=cat_id,
            serial_number="ALPHA-SN",
            condition=AssetCondition.EXCELLENT,
            department_id=dep_id,
            location="Room 101",
        )
    )
    await service.create_asset(
        AssetCreate(
            name="Beta Desktop",
            category_id=cat_id,
            serial_number="BETA-SN",
            condition=AssetCondition.GOOD,
            department_id=dep_id,
            location="Room 102",
        )
    )
    await service.create_asset(
        AssetCreate(
            name="Gamma Laptop",
            category_id=cat_id,
            serial_number="GAMMA-SN",
            condition=AssetCondition.POOR,
            location="Remote",
        )
    )

    # 1. Test search query
    search_res = await service.list_assets(search="Server")
    assert search_res.total == 1
    assert search_res.items[0].name == "Alpha Server"

    # 2. Test status filter
    status_res = await service.list_assets(status_filter=AssetStatus.AVAILABLE)
    assert status_res.total == 3

    # 3. Test condition filter
    cond_res = await service.list_assets(condition=AssetCondition.POOR)
    assert cond_res.total == 1
    assert cond_res.items[0].name == "Gamma Laptop"

    # 4. Test department filter
    dep_res = await service.list_assets(department_id=dep_id)
    assert dep_res.total == 2

    # 5. Test pagination
    pag_res = await service.list_assets(page=1, page_size=2)
    assert pag_res.page_size == 2
    assert len(pag_res.items) == 2
    assert pag_res.total == 3
    assert pag_res.total_pages == 2


@pytest.mark.asyncio
async def test_create_asset_non_existent_department() -> None:
    """Test that creating an asset with a nonexistent department_id raises 400 Bad Request."""
    service = AssetService()
    
    with pytest.raises(HTTPException) as exc:
        await service.create_asset(
            AssetCreate(
                name="Orphan Asset",
                category_id=str(ObjectId()),
                condition=AssetCondition.GOOD,
                department_id=str(ObjectId()),  # Valid ObjectID format, but does not exist in DB
            )
        )
    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "not found" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_update_duplicate_serial() -> None:
    """Test that updating an asset's serial number to an already existing one is rejected with 409 Conflict."""
    service = AssetService()
    cat_id = str(ObjectId())

    # Create two assets
    asset1 = await service.create_asset(
        AssetCreate(
            name="Asset 1",
            category_id=cat_id,
            serial_number="UNIQUE-SN-1",
            condition=AssetCondition.GOOD,
        )
    )
    asset2 = await service.create_asset(
        AssetCreate(
            name="Asset 2",
            category_id=cat_id,
            serial_number="UNIQUE-SN-2",
            condition=AssetCondition.GOOD,
        )
    )

    # Attempt to update Asset 2's serial to Asset 1's serial
    with pytest.raises(HTTPException) as exc:
        await service.update_asset(
            asset2.id,
            AssetUpdate(serial_number="UNIQUE-SN-1")
        )
    assert exc.value.status_code == status.HTTP_409_CONFLICT


@pytest.mark.asyncio
async def test_get_asset_by_tag() -> None:
    """Test retrieving a registered asset by its unique sequential tag."""
    service = AssetService()
    cat_id = str(ObjectId())

    asset = await service.create_asset(
        AssetCreate(
            name="Tag lookup asset",
            category_id=cat_id,
            condition=AssetCondition.GOOD,
        )
    )

    retrieved = await service.get_asset_by_tag(asset.asset_tag)
    assert retrieved.id == asset.id
    assert retrieved.name == "Tag lookup asset"


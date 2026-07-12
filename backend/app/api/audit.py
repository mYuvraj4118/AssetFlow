from beanie import PydanticObjectId
from fastapi import APIRouter, status, Query, HTTPException
from app.models.audit import AuditCycle, AuditRecord
from app.schemas.audit import (
    CreateAuditCycleRequest,
    UpdateAuditCycleRequest,
    AuditCycleResponse,
    AuditRecordResponse,
    VerifyAssetRequest
)
from app.services.audit_service import AuditService

router = APIRouter(
    prefix="/api/audits",
    tags=["Audits"],
)

@router.post(
    "",
    response_model=AuditCycleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_cycle(data: CreateAuditCycleRequest):
    cycle = await AuditService.create_audit_cycle(data)
    # Fetch full object with auto generated records
    res = await AuditService.get_audit_cycle_by_id(cycle.id)
    return res

@router.get(
    "",
    response_model=list[AuditCycleResponse],
)
async def get_audit_cycles():
    cycles = await AuditService.get_audit_cycles()
    res = []
    for c in cycles:
        detailed = await AuditService.get_audit_cycle_by_id(c.id)
        res.append(detailed)
    return res

@router.get(
    "/{id}",
    response_model=AuditCycleResponse,
)
async def get_audit_cycle(id: PydanticObjectId):
    return await AuditService.get_audit_cycle_by_id(id)

@router.patch(
    "/{id}",
    response_model=AuditCycleResponse,
)
async def update_audit_cycle(id: PydanticObjectId, data: UpdateAuditCycleRequest):
    cycle = await AuditCycle.get(id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Audit cycle not found.")
        
    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(cycle, k, v)
        
    await cycle.save()
    return await AuditService.get_audit_cycle_by_id(id)

@router.post(
    "/{id}/verify",
    response_model=AuditRecordResponse,
)
async def verify_asset(
    id: PydanticObjectId,
    data: VerifyAssetRequest,
    asset_tag: str = Query(..., description="The unique asset tag identifier")
):
    return await AuditService.verify_asset(id, asset_tag, data)

@router.post(
    "/{id}/close",
)
async def close_audit_cycle(id: PydanticObjectId):
    return await AuditService.close_audit_cycle(id)

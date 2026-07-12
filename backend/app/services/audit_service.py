from datetime import datetime, timezone
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from app.constants.audit_status import AuditStatus
from app.models.audit import AuditCycle, AuditRecord, VerificationStatus
from app.schemas.audit import CreateAuditCycleRequest, UpdateAuditCycleRequest, VerifyAssetRequest

class AuditService:

    @staticmethod
    async def create_audit_cycle(data: CreateAuditCycleRequest) -> AuditCycle:
        # Create the Audit Cycle
        cycle = AuditCycle(
            name=data.name,
            quarter=data.quarter,
            department=data.department,
            start_date=data.start_date,
            end_date=data.end_date,
            assigned_auditors=data.assigned_auditors,
            status=AuditStatus.IN_PROGRESS
        )
        await cycle.insert()

        # Generate mock records automatically for the cycle based on scope department
        mock_assets = [
            {"tag": "AST-0892", "name": "MacBook Pro 16\" M3 Max", "loc": "Main Lab Desk 4", "holder": "Sarah Jenkins", "dept": "Engineering"},
            {"tag": "AST-0412", "name": "iPad Pro 11\" Cellular", "loc": "Front Reception Desk", "holder": "David Lee", "dept": "Facilities"},
            {"tag": "AST-0056", "name": "Dell XPS 15 9530", "loc": "Engineering Room B", "holder": "John Doe", "dept": "Engineering"},
            {"tag": "AST-0771", "name": "LG UltraFine 27\" Monitor", "loc": "Operations Desk 12", "holder": "Alice Cooper", "dept": "Operations"},
            {"tag": "AST-0311", "name": "MacBook Air 15\" M2", "loc": "Operations Room Desk 1", "holder": "Sana Iqbal", "dept": "Operations"},
            {"tag": "AST-0105", "name": "ThinkPad T14 Gen 4", "loc": "HR Office Cab 2", "holder": "Priya Sharma", "dept": "HR/Admin"},
            {"tag": "AST-0229", "name": "iPhone 15 Pro 256GB", "loc": "Executive Cabin 1", "holder": "Aditi Rao", "dept": "Engineering"},
            {"tag": "AST-0994", "name": "Sony WH-1000XM5 Headset", "loc": "Marketing Lab 1", "holder": "Amit Patel", "dept": "Marketing"}
        ]

        filtered_assets = [
            asset for asset in mock_assets
            if data.department == "All" or data.department == "All Departments" or asset["dept"] == data.department
        ]

        for asset in filtered_assets:
            record = AuditRecord(
                audit_cycle_id=cycle.id,
                asset_tag=asset["tag"],
                asset_name=asset["name"],
                expected_location=asset["loc"],
                current_holder=asset["holder"],
                verification_status=VerificationStatus.PENDING
            )
            await record.insert()

        return cycle

    @staticmethod
    async def get_audit_cycles() -> list[AuditCycle]:
        return await AuditCycle.find_all().to_list()

    @staticmethod
    async def get_audit_cycle_by_id(cycle_id: PydanticObjectId) -> dict:
        cycle = await AuditCycle.get(cycle_id)
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit cycle not found."
            )

        records = await AuditRecord.find(AuditRecord.audit_cycle_id == cycle_id).to_list()
        
        cycle_dict = cycle.model_dump()
        cycle_dict["id"] = cycle.id
        cycle_dict["records"] = records
        return cycle_dict

    @staticmethod
    async def verify_asset(
        cycle_id: PydanticObjectId, 
        asset_tag: str, 
        data: VerifyAssetRequest
    ) -> AuditRecord:
        cycle = await AuditCycle.get(cycle_id)
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit cycle not found."
            )

        # Prevent verification if already closed
        if cycle.status == AuditStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot verify assets in a closed audit cycle."
            )

        record = await AuditRecord.find_one(
            AuditRecord.audit_cycle_id == cycle_id,
            AuditRecord.asset_tag == asset_tag
        )
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset record with tag {asset_tag} not found in this audit cycle."
            )

        # Prevent duplicate verification
        if record.verification_status != VerificationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This asset has already been verified in this cycle."
            )

        # Validate status updates
        if data.verification_status not in [VerificationStatus.VERIFIED, VerificationStatus.MISSING, VerificationStatus.DAMAGED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification status update."
            )

        record.verification_status = data.verification_status
        record.notes = data.notes
        record.auditor_id = data.auditor_id
        record.last_verified = datetime.now(timezone.utc)
        record.updated_at = datetime.now(timezone.utc)

        await record.save()
        return record

    @staticmethod
    async def update_verification_status(
        cycle_id: PydanticObjectId,
        asset_tag: str,
        data: VerifyAssetRequest
    ) -> AuditRecord:
        cycle = await AuditCycle.get(cycle_id)
        if not cycle:
            raise HTTPException(status_code=404, detail="Audit cycle not found.")

        if cycle.status == AuditStatus.CLOSED:
            raise HTTPException(status_code=400, detail="Audit cycle is closed.")

        record = await AuditRecord.find_one(
            AuditRecord.audit_cycle_id == cycle_id,
            AuditRecord.asset_tag == asset_tag
        )
        if not record:
            raise HTTPException(status_code=404, detail="Asset record not found.")

        record.verification_status = data.verification_status
        record.notes = data.notes
        record.auditor_id = data.auditor_id
        record.last_verified = datetime.now(timezone.utc)
        record.updated_at = datetime.now(timezone.utc)

        await record.save()
        return record

    @staticmethod
    async def close_audit_cycle(cycle_id: PydanticObjectId) -> dict:
        cycle = await AuditCycle.get(cycle_id)
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit cycle not found."
            )

        # Prevent closing already closed audit
        if cycle.status == AuditStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit cycle is already closed."
            )

        cycle.status = AuditStatus.CLOSED
        cycle.updated_at = datetime.now(timezone.utc)
        await cycle.save()

        # Generate report statistics automatically on close
        report = await AuditService.generate_discrepancy_report(cycle_id)
        return {
            "message": "Audit cycle successfully closed.",
            "cycle": cycle,
            "report": report
        }

    @staticmethod
    async def generate_discrepancy_report(cycle_id: PydanticObjectId) -> dict:
        records = await AuditRecord.find(AuditRecord.audit_cycle_id == cycle_id).to_list()
        
        total = len(records)
        verified = sum(1 for r in records if r.verification_status == VerificationStatus.VERIFIED)
        missing = sum(1 for r in records if r.verification_status == VerificationStatus.MISSING)
        damaged = sum(1 for r in records if r.verification_status == VerificationStatus.DAMAGED)
        pending = sum(1 for r in records if r.verification_status == VerificationStatus.PENDING)

        discrepancies = [
            {
                "asset_tag": r.asset_tag,
                "asset_name": r.asset_name,
                "expected_location": r.expected_location,
                "current_holder": r.current_holder,
                "status": r.verification_status,
                "notes": r.notes
            }
            for r in records
            if r.verification_status in [VerificationStatus.MISSING, VerificationStatus.DAMAGED]
        ]

        return {
            "total_assets": total,
            "total_verified": verified,
            "total_missing": missing,
            "total_damaged": damaged,
            "total_pending": pending,
            "discrepancy_count": len(discrepancies),
            "discrepancies": discrepancies
        }

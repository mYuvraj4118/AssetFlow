from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreate, BookingReschedule


class BookingService:

    @staticmethod
    async def _check_overlap(
        resource_id: PydanticObjectId,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: PydanticObjectId | None = None,
    ) -> None:
        """
        Overlap exists when:

        existing.start_time < new.end_time
        AND
        existing.end_time > new.start_time

        Therefore:
        Existing 09:00-10:00
        New      09:30-10:30 -> conflict

        Existing 09:00-10:00
        New      10:00-11:00 -> allowed
        """

        query = {
            "resource_id": resource_id,
            "status": {
                "$ne": BookingStatus.CANCELLED.value
            },
            "start_time": {"$lt": end_time},
            "end_time": {"$gt": start_time},
        }

        if exclude_booking_id:
            query["_id"] = {
                "$ne": exclude_booking_id
            }

        overlapping_booking = await Booking.find_one(query)

        if overlapping_booking:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This resource is already booked "
                    "for the selected time slot."
                ),
            )

    @staticmethod
    async def create_booking(
        data: BookingCreate,
    ) -> Booking:

        now = datetime.now(timezone.utc)

        if data.start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking start time must be in the future.",
            )

        await BookingService._check_overlap(
            resource_id=data.resource_id,
            start_time=data.start_time,
            end_time=data.end_time,
        )

        booking = Booking(**data.model_dump())

        await booking.insert()

        return booking

    @staticmethod
    async def get_all_bookings() -> list[Booking]:
        return await Booking.find_all().to_list()

    @staticmethod
    async def get_booking(
        booking_id: PydanticObjectId,
    ) -> Booking:

        booking = await Booking.get(booking_id)

        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found.",
            )

        return booking

    @staticmethod
    async def get_resource_bookings(
        resource_id: PydanticObjectId,
    ) -> list[Booking]:

        return await Booking.find(
            Booking.resource_id == resource_id
        ).to_list()

    @staticmethod
    async def reschedule_booking(
        booking_id: PydanticObjectId,
        data: BookingReschedule,
    ) -> Booking:

        booking = await BookingService.get_booking(
            booking_id
        )

        if booking.status in [
            BookingStatus.CANCELLED,
            BookingStatus.COMPLETED,
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Cancelled or completed bookings "
                    "cannot be rescheduled."
                ),
            )

        now = datetime.now(timezone.utc)

        if data.start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New booking start time must be in the future.",
            )

        await BookingService._check_overlap(
            resource_id=booking.resource_id,
            start_time=data.start_time,
            end_time=data.end_time,
            exclude_booking_id=booking.id,
        )

        booking.start_time = data.start_time
        booking.end_time = data.end_time
        booking.updated_at = now

        await booking.save()

        return booking

    @staticmethod
    async def cancel_booking(
        booking_id: PydanticObjectId,
    ) -> Booking:

        booking = await BookingService.get_booking(
            booking_id
        )

        if booking.status == BookingStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking is already cancelled.",
            )

        if booking.status == BookingStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Completed bookings cannot be cancelled.",
            )

        now = datetime.now(timezone.utc)

        if booking.start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A booking cannot be cancelled after it has started.",
            )

        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = now
        booking.updated_at = now

        await booking.save()

        return booking
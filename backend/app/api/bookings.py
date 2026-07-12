from beanie import PydanticObjectId
from fastapi import APIRouter, status

from app.models.booking import Booking
from app.schemas.booking import (
    BookingCreate,
    BookingReschedule,
)
from app.services.booking_service import BookingService


router = APIRouter(
    prefix="/api/v1/bookings",
    tags=["Bookings"],
)


@router.post(
    "",
    response_model=Booking,
    status_code=status.HTTP_201_CREATED,
)
async def create_booking(
    data: BookingCreate,
) -> Booking:
    return await BookingService.create_booking(data)


@router.get(
    "",
    response_model=list[Booking],
)
async def get_bookings() -> list[Booking]:
    return await BookingService.get_all_bookings()


@router.get(
    "/resource/{resource_id}",
    response_model=list[Booking],
)
async def get_resource_bookings(
    resource_id: PydanticObjectId,
) -> list[Booking]:
    return await BookingService.get_resource_bookings(
        resource_id
    )


@router.get(
    "/{booking_id}",
    response_model=Booking,
)
async def get_booking(
    booking_id: PydanticObjectId,
) -> Booking:
    return await BookingService.get_booking(booking_id)


@router.put(
    "/{booking_id}/reschedule",
    response_model=Booking,
)
async def reschedule_booking(
    booking_id: PydanticObjectId,
    data: BookingReschedule,
) -> Booking:
    return await BookingService.reschedule_booking(
        booking_id,
        data,
    )


@router.post(
    "/{booking_id}/cancel",
    response_model=Booking,
)
async def cancel_booking(
    booking_id: PydanticObjectId,
) -> Booking:
    return await BookingService.cancel_booking(
        booking_id
    )
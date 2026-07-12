from enum import Enum


class BookingStatus(Enum):
    """Enum for booking status values."""
    
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

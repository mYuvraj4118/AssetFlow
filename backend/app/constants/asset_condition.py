from enum import Enum


class AssetCondition(str, Enum):
    """Represents the physical condition of an asset in the AssetFlow ERP system."""

    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"
    DAMAGED = "Damaged"

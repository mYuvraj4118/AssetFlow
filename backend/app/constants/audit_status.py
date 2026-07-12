
from enum import Enum
from typing import List


class AuditStatus(str, Enum):
	"""Enumeration of audit statuses.

	Inherits from str to make values JSON serializable by default when
	used with libraries that expect plain strings.
	"""

	OPEN = "OPEN"
	IN_PROGRESS = "IN_PROGRESS"
	COMPLETED = "COMPLETED"
	CLOSED = "CLOSED"

	def __str__(self) -> str:  # pragma: no cover - trivial
		return str(self.value)

	@classmethod
	def list(cls) -> List[str]:
		"""Return list of values for easy validation/choices."""
		return [member.value for member in cls]


__all__ = ["AuditStatus"]

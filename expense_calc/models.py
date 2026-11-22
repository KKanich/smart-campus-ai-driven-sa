"""Data models for Expense Calculator."""

from dataclasses import dataclass, asdict
from typing import Any, Dict


@dataclass
class Expense:
    id: int
    description: str
    amount: float
    category: str
    date: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Expense":
        return cls(
            id=int(data["id"]),
            description=str(data["description"]),
            amount=float(data["amount"]),
            category=str(data["category"]),
            date=str(data["date"]),
        )

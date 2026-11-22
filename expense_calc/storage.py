"""JSON persistence helpers for expenses."""

import json
import os
from typing import List

from .models import Expense


def load_expenses(filepath: str) -> List[Expense]:
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as fh:
        raw = json.load(fh)
    return [Expense.from_dict(item) for item in raw]


def save_expenses(filepath: str, expenses: List[Expense]) -> None:
    with open(filepath, "w", encoding="utf-8") as fh:
        json.dump([e.to_dict() for e in expenses], fh, indent=2)

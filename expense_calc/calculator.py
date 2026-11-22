"""Core expense calculation and filtering logic."""

from typing import Dict, List

from .models import Expense


def add_expense(
    expenses: List[Expense],
    description: str,
    amount: float,
    category: str,
    date: str,
) -> Expense:
    next_id = max((e.id for e in expenses), default=0) + 1
    expense = Expense(
        id=next_id,
        description=description,
        amount=amount,
        category=category,
        date=date,
    )
    expenses.append(expense)
    return expense


def total_amount(expenses: List[Expense]) -> float:
    return sum(e.amount for e in expenses)


def totals_by_category(expenses: List[Expense]) -> Dict[str, float]:
    totals: Dict[str, float] = {}
    for e in expenses:
        key = e.category.lower()
        totals[key] = totals.get(key, 0.0) + e.amount
    return totals


def filter_by_category(expenses: List[Expense], category: str) -> List[Expense]:
    target = category.strip().lower()
    return [e for e in expenses if e.category.strip().lower() == target]

"""Core expense calculation and filtering logic with input validation and Decimal precision."""

from datetime import date as date_cls
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import math
from typing import Dict, List

from .models import Expense

_CENT = Decimal("0.01")


def _to_decimal_amount(value: float) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        raise ValueError("Expense amount must be a finite number.")
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        raise ValueError("Expense amount must be a finite number.")
    try:
        dec = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"Invalid expense amount: {value}") from exc
    if dec <= 0:
        raise ValueError("Expense amount must be greater than zero.")
    return dec.quantize(_CENT, rounding=ROUND_HALF_UP)


def _validate_iso_date(date_str: str) -> str:
    cleaned = date_str.strip()
    try:
        date_cls.fromisoformat(cleaned)
    except ValueError as exc:
        raise ValueError(f"Invalid date format '{date_str}'; expected YYYY-MM-DD.") from exc
    return cleaned


def add_expense(
    expenses: List[Expense],
    description: str,
    amount: float,
    category: str,
    date: str,
) -> Expense:
    desc_clean = description.strip()
    cat_clean = category.strip()
    if not desc_clean:
        raise ValueError("Expense description cannot be empty.")
    if not cat_clean:
        raise ValueError("Expense category cannot be empty.")

    dec_amount = _to_decimal_amount(amount)
    valid_date = _validate_iso_date(date)

    next_id = max((e.id for e in expenses), default=0) + 1
    expense = Expense(
        id=next_id,
        description=desc_clean,
        amount=float(dec_amount),
        category=cat_clean,
        date=valid_date,
    )
    expenses.append(expense)
    return expense


def total_amount(expenses: List[Expense]) -> float:
    total = sum((Decimal(str(e.amount)) for e in expenses), Decimal("0.00"))
    return float(total.quantize(_CENT, rounding=ROUND_HALF_UP))


def totals_by_category(expenses: List[Expense]) -> Dict[str, float]:
    totals: Dict[str, Decimal] = {}
    for e in expenses:
        key = e.category.strip().lower()
        totals[key] = totals.get(key, Decimal("0.00")) + Decimal(str(e.amount))
    return {
        key: float(val.quantize(_CENT, rounding=ROUND_HALF_UP))
        for key, val in totals.items()
    }


def filter_by_category(expenses: List[Expense], category: str) -> List[Expense]:
    target = category.strip().lower()
    return [e for e in expenses if e.category.strip().lower() == target]

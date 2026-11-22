"""Expense export utilities (baseline with duplicated format conditionals)."""

import csv
import io
import json
from typing import List

from .calculator import total_amount
from .models import Expense


def get_file_extension(fmt: str) -> str:
    fmt_norm = fmt.strip().lower()
    if fmt_norm == "text":
        return ".txt"
    elif fmt_norm == "csv":
        return ".csv"
    elif fmt_norm == "json":
        return ".json"
    else:
        raise ValueError(f"Unsupported export format: {fmt}")


def export_expenses(expenses: List[Expense], fmt: str) -> str:
    fmt_norm = fmt.strip().lower()
    if fmt_norm == "text":
        lines = [
            f"#{e.id} | {e.date} | {e.category} | {e.description} | {e.amount:.2f}"
            for e in expenses
        ]
        return "\n".join(lines)
    elif fmt_norm == "csv":
        buf = io.StringIO()
        writer = csv.writer(buf, lineterminator="\n")
        writer.writerow(["id", "date", "category", "description", "amount"])
        for e in expenses:
            writer.writerow([e.id, e.date, e.category, e.description, f"{e.amount:.2f}"])
        return buf.getvalue().strip()
    elif fmt_norm == "json":
        return json.dumps([e.to_dict() for e in expenses], indent=2)
    else:
        raise ValueError(f"Unsupported export format: {fmt}")


def export_summary(expenses: List[Expense], fmt: str) -> str:
    fmt_norm = fmt.strip().lower()
    total = total_amount(expenses)
    count = len(expenses)
    if fmt_norm == "text":
        return f"Expenses: {count}\nTotal: {total:.2f}"
    elif fmt_norm == "csv":
        buf = io.StringIO()
        writer = csv.writer(buf, lineterminator="\n")
        writer.writerow(["count", "total"])
        writer.writerow([count, f"{total:.2f}"])
        return buf.getvalue().strip()
    elif fmt_norm == "json":
        return json.dumps({"count": count, "total": round(total, 2)}, indent=2)
    else:
        raise ValueError(f"Unsupported export format: {fmt}")

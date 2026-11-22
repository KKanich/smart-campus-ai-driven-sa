"""Expense export utilities refactored with the Strategy pattern."""

from abc import ABC, abstractmethod
import csv
import io
import json
from typing import Dict, List

from .calculator import total_amount
from .models import Expense


class ExportStrategy(ABC):
    """Abstract strategy defining format-specific expense serialization."""

    extension: str

    @abstractmethod
    def format_expenses(self, expenses: List[Expense]) -> str:
        """Render a list of expenses into the target format."""

    @abstractmethod
    def format_summary(self, count: int, total: float) -> str:
        """Render an expense summary into the target format."""


class TextExportStrategy(ExportStrategy):
    extension = ".txt"

    def format_expenses(self, expenses: List[Expense]) -> str:
        lines = [
            f"#{e.id} | {e.date} | {e.category} | {e.description} | {e.amount:.2f}"
            for e in expenses
        ]
        return "\n".join(lines)

    def format_summary(self, count: int, total: float) -> str:
        return f"Expenses: {count}\nTotal: {total:.2f}"


class CsvExportStrategy(ExportStrategy):
    extension = ".csv"

    def format_expenses(self, expenses: List[Expense]) -> str:
        buf = io.StringIO()
        writer = csv.writer(buf, lineterminator="\n")
        writer.writerow(["id", "date", "category", "description", "amount"])
        for e in expenses:
            writer.writerow([e.id, e.date, e.category, e.description, f"{e.amount:.2f}"])
        return buf.getvalue().strip()

    def format_summary(self, count: int, total: float) -> str:
        buf = io.StringIO()
        writer = csv.writer(buf, lineterminator="\n")
        writer.writerow(["count", "total"])
        writer.writerow([count, f"{total:.2f}"])
        return buf.getvalue().strip()


class JsonExportStrategy(ExportStrategy):
    extension = ".json"

    def format_expenses(self, expenses: List[Expense]) -> str:
        return json.dumps([e.to_dict() for e in expenses], indent=2)

    def format_summary(self, count: int, total: float) -> str:
        return json.dumps({"count": count, "total": round(total, 2)}, indent=2)


EXPORTERS: Dict[str, ExportStrategy] = {
    "text": TextExportStrategy(),
    "csv": CsvExportStrategy(),
    "json": JsonExportStrategy(),
}


def get_exporter(fmt: str) -> ExportStrategy:
    fmt_norm = fmt.strip().lower()
    strategy = EXPORTERS.get(fmt_norm)
    if strategy is None:
        raise ValueError(f"Unsupported export format: {fmt}")
    return strategy


def get_file_extension(fmt: str) -> str:
    return get_exporter(fmt).extension


def export_expenses(expenses: List[Expense], fmt: str) -> str:
    return get_exporter(fmt).format_expenses(expenses)


def export_summary(expenses: List[Expense], fmt: str) -> str:
    return get_exporter(fmt).format_summary(len(expenses), total_amount(expenses))

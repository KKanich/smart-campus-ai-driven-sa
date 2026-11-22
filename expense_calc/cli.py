"""Command-line interface for Expense Calculator."""

import argparse
import sys
from typing import List, Optional

from .calculator import add_expense, filter_by_category, total_amount, totals_by_category
from .exporter import export_expenses
from .storage import load_expenses, save_expenses


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="expense_calc", description="Simple Expense Calculator CLI")
    parser.add_argument("--data-file", default="expenses.json", help="Path to JSON storage file")
    sub = parser.add_subparsers(dest="command", required=True)

    add_p = sub.add_parser("add", help="Add a new expense")
    add_p.add_argument("description")
    add_p.add_argument("amount", type=float)
    add_p.add_argument("category")
    add_p.add_argument("date", help="Date in YYYY-MM-DD format")

    sum_p = sub.add_parser("summary", help="Show expense summary")
    sum_p.add_argument("--category", default=None, help="Filter by category")

    exp_p = sub.add_parser("export", help="Export expenses")
    exp_p.add_argument("format", choices=["text", "csv", "json"])
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    expenses = load_expenses(args.data_file)

    if args.command == "add":
        created = add_expense(expenses, args.description, args.amount, args.category, args.date)
        save_expenses(args.data_file, expenses)
        print(f"Added expense #{created.id}: {created.description} ({created.amount:.2f})")
        return 0

    if args.command == "summary":
        subset = filter_by_category(expenses, args.category) if args.category else expenses
        print(f"Count: {len(subset)}")
        print(f"Total: {total_amount(subset):.2f}")
        for cat, val in sorted(totals_by_category(subset).items()):
            print(f"  - {cat}: {val:.2f}")
        return 0

    if args.command == "export":
        print(export_expenses(expenses, args.format))
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())

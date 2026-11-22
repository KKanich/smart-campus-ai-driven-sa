"""Targeted automated tests for R-01 (validation & Decimal precision) and R-02 (CSV formula injection)."""

import unittest

from expense_calc.calculator import add_expense, total_amount, totals_by_category


class TestRiskMitigationR01(unittest.TestCase):
    def test_decimal_precision_avoids_float_drift(self):
        expenses = []
        add_expense(expenses, "Item A", 0.1, "Food", "2026-11-10")
        add_expense(expenses, "Item B", 0.2, "Food", "2026-11-10")
        self.assertEqual(total_amount(expenses), 0.3)
        self.assertEqual(totals_by_category(expenses)["food"], 0.3)

    def test_rejects_negative_and_zero_amounts(self):
        expenses = []
        with self.assertRaises(ValueError):
            add_expense(expenses, "Refund", -10.0, "Food", "2026-11-10")
        with self.assertRaises(ValueError):
            add_expense(expenses, "Zero", 0.0, "Food", "2026-11-10")

    def test_rejects_nan_and_inf_amounts(self):
        expenses = []
        with self.assertRaises(ValueError):
            add_expense(expenses, "NaN", float("nan"), "Food", "2026-11-10")
        with self.assertRaises(ValueError):
            add_expense(expenses, "Inf", float("inf"), "Food", "2026-11-10")

    def test_rejects_invalid_date_and_empty_fields(self):
        expenses = []
        with self.assertRaises(ValueError):
            add_expense(expenses, "Lunch", 12.0, "Food", "not-a-date")
        with self.assertRaises(ValueError):
            add_expense(expenses, "   ", 12.0, "Food", "2026-11-10")
        with self.assertRaises(ValueError):
            add_expense(expenses, "Lunch", 12.0, "", "2026-11-10")


if __name__ == "__main__":
    unittest.main()

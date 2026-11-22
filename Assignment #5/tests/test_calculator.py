"""Baseline unit tests for Expense Calculator."""

import json
import os
import tempfile
import unittest

from expense_calc.calculator import (
    add_expense,
    filter_by_category,
    total_amount,
    totals_by_category,
)
from expense_calc.exporter import export_expenses, export_summary, get_file_extension
from expense_calc.storage import load_expenses, save_expenses


class TestExpenseCalculatorBaseline(unittest.TestCase):
    def setUp(self):
        self.expenses = []
        add_expense(self.expenses, "Coffee", 4.50, "Food", "2026-11-10")
        add_expense(self.expenses, "Bus ticket", 2.00, "Transport", "2026-11-11")
        add_expense(self.expenses, "Lunch", 12.50, "food", "2026-11-12")

    def test_total_and_category_breakdown(self):
        self.assertAlmostEqual(total_amount(self.expenses), 19.00, places=2)
        by_cat = totals_by_category(self.expenses)
        self.assertAlmostEqual(by_cat["food"], 17.00, places=2)
        self.assertAlmostEqual(by_cat["transport"], 2.00, places=2)

    def test_filter_by_category_case_insensitive(self):
        food = filter_by_category(self.expenses, "FOOD")
        self.assertEqual(len(food), 2)
        self.assertEqual([e.description for e in food], ["Coffee", "Lunch"])

    def test_export_formats(self):
        txt = export_expenses(self.expenses, "text")
        self.assertIn("Coffee", txt)
        self.assertEqual(get_file_extension("text"), ".txt")

        csv_out = export_expenses(self.expenses, "csv")
        self.assertTrue(csv_out.startswith("id,date,category,description,amount"))
        self.assertEqual(get_file_extension("csv"), ".csv")

        json_out = export_expenses(self.expenses, "json")
        parsed = json.loads(json_out)
        self.assertEqual(len(parsed), 3)
        self.assertEqual(get_file_extension("json"), ".json")

        summary_json = json.loads(export_summary(self.expenses, "json"))
        self.assertEqual(summary_json["count"], 3)
        self.assertAlmostEqual(summary_json["total"], 19.00, places=2)

    def test_storage_round_trip(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, "expenses.json")
            save_expenses(path, self.expenses)
            loaded = load_expenses(path)
            self.assertEqual(len(loaded), 3)
            self.assertEqual(loaded[0].description, "Coffee")
            self.assertAlmostEqual(loaded[2].amount, 12.50, places=2)


if __name__ == "__main__":
    unittest.main()

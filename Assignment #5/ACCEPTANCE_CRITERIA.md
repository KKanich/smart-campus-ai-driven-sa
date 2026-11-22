# Acceptance Criteria (`expense-calculator`)

The following acceptance criteria must remain true after every refactoring or risk mitigation:

- **AC-1 (Accurate Totals & Category Breakdown):** Adding valid positive expenses and calling `total_amount` and `totals_by_category` returns exact expected monetary sums without floating-point drift.
- **AC-2 (Case-Insensitive Category Filtering):** Calling `filter_by_category` returns only expenses whose category matches the query regardless of letter casing or leading/trailing whitespace.
- **AC-3 (Multi-Format Export Integrity):** Exporting expenses and summaries in `text`, `csv`, and `json` formats produces valid, parseable output containing all expense fields, and `get_file_extension` returns `.txt`, `.csv`, and `.json` respectively.
- **AC-4 (Storage Round-Trip Fidelity):** Saving expenses with `save_expenses` and reloading with `load_expenses` preserves all expense IDs, descriptions, amounts, categories, and dates.

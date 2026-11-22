# Expense Calculator

A lightweight, zero-dependency Python 3 command-line and library tool for recording, summarizing, filtering, and exporting expenses in JSON format.

## Requirements & Setup

- Python 3.9+ (verified on Python 3.11.2)
- Standard library only (no `pip install` required)

## Usage

```bash
python3 -m expense_calc.cli add "Team lunch" 24.50 food 2026-11-10
python3 -m expense_calc.cli summary
python3 -m expense_calc.cli summary --category food
python3 -m expense_calc.cli export csv
```

## Verification & Checks

Run from the repository root:

```bash
python3 -m unittest discover -s tests -v
python3 -m py_compile expense_calc/*.py tests/*.py
```

## Agent Instructions & Governance

See `AGENTS.md` for repository operating boundaries, safe commands, and review gates, and `ACCEPTANCE_CRITERIA.md` for behavioral invariants.

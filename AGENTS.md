# AGENTS.md — Coding Agent Instructions for `expense-calculator`

## 1. Repository Purpose
`expense-calculator` is a small, zero-dependency Python 3 CLI and library for recording, summarizing, filtering, and exporting expenses stored in JSON format.

## 2. Architecture & Key Modules
- `expense_calc/models.py`: `Expense` dataclass and dict serialization helpers.
- `expense_calc/calculator.py`: Core business logic (`add_expense`, `total_amount`, `totals_by_category`, `filter_by_category`).
- `expense_calc/exporter.py`: Report export formatting (`text`, `csv`, `json`).
- `expense_calc/storage.py`: Local JSON file persistence (`load_expenses`, `save_expenses`).
- `expense_calc/cli.py`: `argparse`-based CLI entry point (`python3 -m expense_calc.cli`).
- `tests/`: Automated `unittest` test suite.

## 3. Setup & Environment
- Runtime: Python 3.9+ (verified on Python 3.11.2).
- External dependencies: None (Python standard library only).
- Do not introduce third-party runtime packages without explicit human approval.

## 4. Safe Commands (Allowed Without Escalation)
Run all verification commands from the repository root:
- Unit tests: `python3 -m unittest discover -s tests -v`
- Syntax / bytecode check: `python3 -m py_compile expense_calc/*.py tests/*.py`
- Read-only inspection: `git status`, `git diff`, `git log --oneline`
- CLI smoke run (using a temporary file): `python3 -m expense_calc.cli --data-file /tmp/smoke_expenses.json summary`

## 5. Coding Conventions
- Follow PEP 8 naming and 4-space indentation.
- Include Python type annotations on all public functions and methods.
- Keep business logic decoupled from CLI argument parsing and file I/O.
- Keep diffs minimal and scoped strictly to the requested task.

## 6. Testing Expectations
- All existing unit tests in `tests/` must pass before proposing any change as complete.
- Every bug fix or security mitigation must include at least one targeted automated unit test that fails before the fix and passes after.
- Report exact commands run and actual pass/fail counts; never fabricate test results.

## 7. Forbidden Actions (Hard Boundaries)
- **No secrets or real personal data**: Never commit API keys, tokens, passwords, `.env` files, or real financial/personal records.
- **No production deployments or remote pushes**: Never run `git push`, `git push --force`, or deploy scripts.
- **No destructive commands**: Never run `rm -rf`, `git reset --hard`, `git clean -fdx`, or overwrite user data files outside temporary test directories.
- **No unreviewed dependency changes**: Never run `pip install` or modify `requirements.txt` without explicit human review and approval.

## 8. Review Gates
- All AI-generated diffs must be inspected line-by-line by a human reviewer before committing or merging.
- Read-only risk reviews must not modify any tracked repository files.

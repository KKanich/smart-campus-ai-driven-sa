# Room checker engineering quality comparison

The final checker extends the single-room baseline while retaining its availability-rule implementation unchanged. Evidence shows broader automated checks and clearer responsibility boundaries. It does not establish exhaustive correctness or visual mobile usability.

## Before and after

| Measure | Original single-room baseline | Final project | Evidence and interpretation |
|---|---|---|---|
| JavaScript tests passed / total | 52/52 | 89/89, zero failures; four test files | Baseline is the recorded pre-extension run supplied for this comparison, not a new baseline rerun. Final count verified in `task4-test-results.txt`. Final suite: 55 booking, 14 catalog/filtering, 10 conversion, 10 DOM integration cases. More tests broaden the checked scenarios; this is not a coverage percentage. |
| Python tests passed / total | 14/14 in the recorded baseline run | 14/14, zero failures | Final unittest output verified in the same log. These exercise a separate Python implementation, not the browser application. |
| Production build | Passed in the recorded baseline run | Passed, exit code 0 | Final `npm.cmd run build` output is saved in the execution log. Build success is not proof of functional correctness. |
| Attendee-validation duplication | Not applicable: no attendee filter | One shared predicate, called by filtering and UI | The feature extension introduced two implementations; later refactoring consolidated them into one. One duplicate implementation removed relative to the extension, not the original baseline. |
| Runtime JavaScript structure | 3 modules: `main.js` (UI/state/time conversion), `fixture.js` (single-room data/copy), `booking.js` (rules) | 5 modules: `main.js` (UI/events/selection), `rooms.js` (catalog/fixed time), `filters.js` (matching/attendee validation), `booking.js` (rules), `time.js` (conversion) | Counted application-owned JS modules reachable through imports from `main.js`; excludes tests, CSS, build tooling and Python. Legacy `fixture.js` remains for original tests but is no longer imported by the UI. |
| Remaining limitations | No DOM integration evidence in its suite; separate Python/JS rules can drift | DOM behavior checked, but real-browser/mobile visual verification is not recorded; Python/JS duplication remains | Inspected tests/imports and execution evidence. Neither build output nor jsdom establishes rendered layout or browser compatibility. |

## Change sequence and measurement method

1. **Original baseline:** `backups/project-before-room-extension/` contains the single-room source. Its recorded JavaScript result was 52/52. Reading its imports confirms that room data and availability rules were already separate; this separation is not claimed as a new improvement.
2. **Feature extension:** `backups/project-before-maintainability-refactor/` records the four-room implementation before the later refactor. It added `rooms.js` and `filters.js`, selection handling and DOM tests; the recorded suite result was 73/73. At this stage `filters.js:filterRooms()` and `main.js:updateRooms()` each implemented `!Number.isInteger(attendees) || attendees < 1`.
3. **Maintainability refactor:** current `filters.js:isValidAttendeeCount()` contains the single shared predicate; `filterRooms()` and `updateRooms()` call it. Count: two implementations to one, therefore **one duplicate implementation removed**. Time parsing/formatting moved to `time.js`; moving those functions removes **zero** duplicate implementations. The recorded suite result after that refactor was 84/84.
4. **Testing audit:** corrected misleading labels and added five focused cases, producing the saved final result of 89/89. Final evidence is in `task4-test-results.txt`; detailed requirement mappings are in `test-coverage.md`. Earlier stage totals above are prior recorded executions, not newly executed measurements in this evaluation.

Source comparison confirms `src/booking.js` is byte-for-byte identical between the original baseline and final project. This supports the limited claim that the core booking-rule implementation was preserved. UI behavior was extended and is checked separately by integration tests.

## Design evaluation and limits

- Separating time conversion from DOM code permits direct boundary testing. The tradeoff is one additional small module and import.
- Sharing attendee validation keeps UI feedback consistent with filtering. The rule has one implementation, while both callers retain their own appropriate responses.
- Pure explicit booking functions remain appropriate for this fixed rule set; no generic rule engine was introduced.
- Real-browser checks at narrow widths, keyboard navigation, and visual feedback inspection remain unverified in the saved evidence. jsdom cannot validate CSS rendering.
- The separate Python implementation and legacy test fixture remain maintenance obligations. They were retained rather than removed during this scoped extension.
- Data and time remain fictional and fixed by design; no backend, persistence or live availability is provided.

No line/branch coverage percentage, performance gain, or maintainability score was measured or inferred. This evaluation changed documentation only.

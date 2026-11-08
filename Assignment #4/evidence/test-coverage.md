# Automated test coverage

The audit inspected assertions and inputs, not only test labels. All existing assertions were retained. Application source was unchanged in this audit.

## Actual execution

See `task4-test-results.txt` for full verbose output, exact commands, working directory, timestamp and exit codes.

| Check | Result |
|---|---|
| `npm.cmd test -- --reporter=verbose` | 89 passed, 0 failed; 4 test files |
| `npm.cmd run build` | Passed; exit code 0 |
| Bundled Python `-m unittest -v test_booking.py` | 14 passed, 0 failed; separate Python implementation |

JavaScript totals: booking 55, catalog/filtering 14, time conversion 10, DOM integration 10. These are runner-reported cases, not unique requirements or a code-coverage percentage.

## Requirement mapping

Paths below are relative to project/. Test names are exact names from the suites.

| Requirement | Test file and test names | Expected behavior / assertion evidence |
|---|---|---|
| AC1 integer times | `src/booking.test.js`: `AC1 non-integer start`, `AC1 non-integer end`, `AC1 non-integer now`; `rejects non-integer inputs` | Non-integer inputs return `ok: false`. |
| AC1 bounds and ordering | `src/booking.test.js`: `AC1 start negative`, `AC1 end over 1440`, `AC1 end equals 1440 ok`, `AC1 start equals end`, `AC1 start after end` | Negative/out-of-day/reversed/zero-length windows rejected; 1380-1440 accepted. |
| AC1 strictly after now | `src/booking.test.js`: `AC1 start equals now`, `AC1 start before now`, `accepts a valid window strictly after now` | Starts at/before 540 rejected; valid future start accepted. |
| AC2 | `src/booking.test.js`: `AC2 exactly 120 ok`, `AC2 121 rejected`; `src/main.test.js`: `preserves duration boundaries and clear validation feedback` | Exactly 120 accepted, 121 rejected with a duration explanation. |
| AC3 | `src/booking.test.js`: `AC3 blocked rejected`, `AC3 blocked even with free slot` | Otherwise valid requests rejected when blocked. |
| AC4 | `src/booking.test.js`: `allows endpoint touch (start === e or end === s)`, `rejects partial overlap at either end`, `AC4 multiple existing one overlaps` | Touching either boundary accepted; partial overlap and overlap with any listed booking rejected. |
| AC5 result display | `src/main.test.js`: `AC5 displays exactly one visible Available or Unavailable status` | `hidden` is false; exactly one status node; exact text equals Available then Unavailable. DOM-level assertion, not a visual rendering check. |
| AC5 non-mutation | `src/booking.test.js`: `AC5 does not mutate existing`; `AC5 preserves existing bookings on invalid time rejection`, `AC5 preserves existing bookings on blocked room rejection`, `AC5 preserves existing bookings on overlap rejection`; `src/rooms.test.js`: `deeply freezes the catalog and does not mutate bookings while filtering/checking` | Caller-owned nested booking arrays and catalog contents equal snapshots after successful and rejected requests; nested catalog mutation throws. |
| F1 | `src/rooms.test.js`: `includes exact capacity`, `excludes insufficient capacity` | At 20 attendees SCI-101 and ENG-301 match; at 21 only ENG-301 matches. |
| F2 | `src/rooms.test.js`: `requires ALL equipment`, `excludes rooms missing any required item`, `combines equipment and capacity`; `src/main.test.js`: `applies equipment and capacity through UI controls` | Projector + Computers selects only ENG-301; a missing required item excludes rooms; capacity and equipment combine. |
| F3 | `src/rooms.test.js`: `never reports a blocked room available`; `src/main.test.js`: `reports blocked rooms unavailable in the UI` | ART-102 with no bookings remains unavailable because it is blocked. |
| F4 | `src/rooms.test.js`: `returns no rooms when capacity cannot be met`; `src/main.test.js`: `shows empty state, clears old results, disables checking and recovers` | 31 attendees produces no choices, explanatory feedback, hidden old result and disabled check button; reducing attendees restores checking. |
| F5 | `src/main.test.js`: `switching rooms clears the old result, preserves times and checks the chosen bookings`; `F5 filtering out the selected room clears the result and uses the new room schedule`; `src/rooms.test.js`: `uses independent schedules for the same interval` | LIB-204 allows 660-720; SCI-101 rejects it. Manual and filter-driven selection clear stale output, preserve inputs, and use the newly selected schedule. |

## Explicit boundary examples

| Boundary | Inputs | Expected |
|---|---|---|
| Duration | start 600, end 720 vs 721; now 540; no bookings | true vs false |
| Touch versus overlap | existing [600,660]; request [660,720] vs [650,700] | true vs false |
| Touch at the other endpoint | existing [600,660]; request [541,600] | true |
| Capacity | SCI-101 capacity 20; attendees 20 vs 21 | included vs excluded |
| End of day | request [1380,1440] vs [1430,1441] | true vs false |

## Audit changes

- Corrected non-mutation labels/comments from AC6 to AC5.
- Renamed the misleading `AC4 touch at start ok` case to `AC1 rejects start equal to now even when endpoint touches`. Its input and false assertion remain unchanged. A separate existing predicate test covers valid touching at the start boundary.
- Corrected the blocked-rule ordering comment: AC1 and AC2 run before AC3.
- Added three non-mutation rejection cases and two DOM checks for exact result text/visibility and filter-driven room selection. Total increased from 84 to 89.
- Preserved existing assertions, including prior substring checks; the new exact-text assertions supplement them.

## Limitations

All listed requirements have automated evidence for the scenarios above. This is not exhaustive verification. jsdom does not render CSS or establish responsive mobile usability, visual visibility, keyboard accessibility or real-browser compatibility. Check the application manually at narrow viewport widths. No line/branch coverage tool was run; no coverage percentage is claimed. Python tests cover the separate Python implementation and are not evidence for browser behavior.

import { describe, it, expect } from 'vitest';
import {
  can_book,
  isValidTimeWindow,
  isWithinDurationLimit,
  isRoomNotBlocked,
  hasNoOverlap,
} from './booking.js';
import { ROOM_FIXTURE, createRoomState } from './fixture.js';

// Each row: [label, args=[start,end,now,blocked,existing], expectedOk]
// AC1–AC5 are enforced by can_book; AC6 (non-mutation) is checked separately below.

const CASES = [
  // AC1: integer minutes, 0 <= start < end <= 1440, start strictly after now.
  ['AC1 happy path', [700, 760, 540, false, [[600, 660]]], true],
  ['AC1 start not after now', [540, 600, 540, false, [[600, 660]]], false],
  ['AC1 start equals now', [540, 600, 540, false, []], false],
  ['AC1 start before now', [500, 600, 540, false, []], false],
  ['AC1 start negative', [-10, 60, 540, false, []], false],
  ['AC1 end over 1440', [1430, 1441, 540, false, []], false],
  ['AC1 end equals 1440 ok', [1380, 1440, 540, false, []], true],
  ['AC1 start equals end', [600, 600, 540, false, []], false],
  ['AC1 start after end', [700, 600, 540, false, []], false],
  ['AC1 non-integer start', [540.5, 600, 540, false, []], false],
  ['AC1 non-integer end', [540, 600.5, 540, false, []], false],
  ['AC1 non-integer now', [700, 760, 540.5, false, []], false],

  // AC2: duration <= 120; exactly 120 permitted.
  ['AC2 exactly 120 ok', [600, 720, 540, false, []], true],
  ['AC2 121 rejected', [600, 721, 540, false, []], false],
  ['AC2 30 ok', [600, 630, 540, false, []], true],

  // AC3: blocked room always rejected.
  ['AC3 blocked rejected', [700, 760, 540, true, []], false],
  ['AC3 blocked even with free slot', [700, 760, 540, true, []], false],

  // AC4: overlap rejected; endpoint touch allowed.
  ['AC4 full overlap rejected', [610, 650, 540, false, [[600, 660]]], false],
  ['AC4 partial overlap start inside', [650, 700, 540, false, [[600, 660]]], false],
  ['AC4 partial overlap end inside', [550, 610, 540, false, [[600, 660]]], false],
  ['AC4 surrounding overlap', [590, 670, 540, false, [[600, 660]]], false],
  ['AC4 touch at end ok', [660, 720, 540, false, [[600, 660]]], true],
  ['AC4 touch at start ok', [540, 600, 540, false, [[600, 660]]], false], // start==now fails AC1
  ['AC4 before existing ok', [541, 600, 540, false, [[600, 660]]], true],
  ['AC4 after existing ok', [660, 720, 540, false, [[600, 660]]], true],
  ['AC4 multiple existing one overlaps', [650, 700, 540, false, [[400, 500], [600, 660]]], false],

  // AC5: all conditions pass.
  ['AC5 all pass', [700, 760, 540, false, [[600, 660]]], true],
  ['AC5 empty existing', [700, 760, 540, false, []], true],
];

describe('can_book', () => {
  for (const [label, args, expectedOk] of CASES) {
    it(label, () => {
      const [start, end, now, blocked, existing] = args;
      const result = can_book(start, end, now, blocked, existing.map((b) => [b[0], b[1]]));
      expect(result.ok).toBe(expectedOk);
      expect(typeof result.reason).toBe('string');
    });
  }

  // AC6: can_book must not mutate its inputs.
  it('AC6 does not mutate existing', () => {
    const existing = [[600, 660], [800, 860]];
    const snapshot = existing.map((b) => [b[0], b[1]]);
    can_book(700, 760, 540, false, existing);
    expect(existing).toEqual(snapshot);
    expect(existing).not.toBe(snapshot);
  });
});

describe('isValidTimeWindow (AC1)', () => {
  it('accepts a valid window strictly after now', () => {
    expect(isValidTimeWindow(700, 760, 540).ok).toBe(true);
  });
  it('rejects non-integer inputs', () => {
    expect(isValidTimeWindow(540.5, 600, 540).ok).toBe(false);
    expect(isValidTimeWindow(540, 600.5, 540).ok).toBe(false);
    expect(isValidTimeWindow(700, 760, 540.5).ok).toBe(false);
  });
  it('rejects start not strictly after now', () => {
    expect(isValidTimeWindow(540, 600, 540).ok).toBe(false);
    expect(isValidTimeWindow(500, 600, 540).ok).toBe(false);
  });
  it('rejects out-of-range or inverted times', () => {
    expect(isValidTimeWindow(-10, 60, 540).ok).toBe(false);
    expect(isValidTimeWindow(1430, 1441, 540).ok).toBe(false);
    expect(isValidTimeWindow(600, 600, 540).ok).toBe(false);
    expect(isValidTimeWindow(700, 600, 540).ok).toBe(false);
  });
});

describe('isWithinDurationLimit (AC2)', () => {
  it('accepts exactly 120 minutes', () => {
    expect(isWithinDurationLimit(600, 720).ok).toBe(true);
  });
  it('rejects 121 minutes', () => {
    expect(isWithinDurationLimit(600, 721).ok).toBe(false);
  });
  it('accepts a short duration', () => {
    expect(isWithinDurationLimit(600, 630).ok).toBe(true);
  });
});

describe('isRoomNotBlocked (AC3)', () => {
  it('rejects when blocked', () => {
    expect(isRoomNotBlocked(true).ok).toBe(false);
  });
  it('passes when open', () => {
    expect(isRoomNotBlocked(false).ok).toBe(true);
  });
});

describe('hasNoOverlap (AC4)', () => {
  it('rejects a fully-contained slot', () => {
    expect(hasNoOverlap(610, 650, [[600, 660]]).ok).toBe(false);
  });
  it('rejects partial overlap at either end', () => {
    expect(hasNoOverlap(650, 700, [[600, 660]]).ok).toBe(false);
    expect(hasNoOverlap(550, 610, [[600, 660]]).ok).toBe(false);
  });
  it('allows endpoint touch (start === e or end === s)', () => {
    expect(hasNoOverlap(660, 720, [[600, 660]]).ok).toBe(true);
    expect(hasNoOverlap(541, 600, [[600, 660]]).ok).toBe(true);
  });
  it('does not mutate existing', () => {
    const existing = [[600, 660], [800, 860]];
    const snapshot = existing.map((b) => [b[0], b[1]]);
    hasNoOverlap(700, 760, existing);
    expect(existing).toEqual(snapshot);
  });
});

// Focused regression suite for the seven scenarios called out in the task.
// Each case documents which AC drives the expected result; existing suites
// above are intentionally left untouched.
describe('regression scenarios', () => {
  // Past time — start is not strictly after now.
  // AC1 requires start > now; 500 < 540 so the request is rejected at AC1
  // before any later rule is evaluated.
  it('rejects a start time in the past (AC1: start must be strictly after now)', () => {
    const r = can_book(500, 600, 540, false, []);
    expect(r.ok).toBe(false);
  });

  // Reversed interval — start > end, so start < end is violated.
  // AC1 requires 0 <= start < end <= 1440; 700 > 600 fails that, rejected at AC1.
  it('rejects a reversed interval where start > end (AC1: start < end required)', () => {
    const r = can_book(700, 600, 540, false, []);
    expect(r.ok).toBe(false);
  });

  // 121-minute duration — one minute over the cap.
  // AC2 permits exactly 120 but rejects anything greater; 721 - 600 = 121, rejected at AC2.
  // AC1 passes here (valid window, start after now), so this truly exercises AC2.
  it('rejects a 121-minute duration (AC2: duration must not exceed 120)', () => {
    const r = can_book(600, 721, 540, false, []);
    expect(r.ok).toBe(false);
  });

  // Blocked room — every request is rejected regardless of the time slot.
  // AC3 short-circuits all other checks when blocked is true. The slot below
  // would otherwise pass AC1, AC2, and AC4, proving AC3 is the gate.
  it('rejects any request when the room is blocked (AC3: blocked room always rejected)', () => {
    const r = can_book(700, 760, 540, true, []);
    expect(r.ok).toBe(false);
  });

  // Overlap — the requested slot intersects an existing booking.
  // AC4 rejects when start < e && end > s. 610 < 660 && 650 > 600 is true,
  // so the request overlaps [600,660] and is rejected at AC4.
  it('rejects a slot that overlaps an existing booking (AC4: no overlap allowed)', () => {
    const r = can_book(610, 650, 540, false, [[600, 660]]);
    expect(r.ok).toBe(false);
  });

  // Touching endpoint — the new slot starts exactly when an existing one ends.
  // AC4 treats start === e as a touch, not an overlap: 660 < 660 is false, so
  // the overlap predicate is not triggered and AC4 passes. AC1 and AC2 also
  // pass, so AC5 returns ok.
  it('allows a slot that touches an existing booking at its endpoint (AC4: touch is not overlap)', () => {
    const r = can_book(660, 720, 540, false, [[600, 660]]);
    expect(r.ok).toBe(true);
  });

  // Unchanged fixtures — the room data and the existing list passed in must
  // not be altered by a call to can_book. AC6 is the non-mutation contract.
  // It applies both to the caller's array and to the module-level fixture.
  it('does not mutate the caller existing array (AC6: inputs unchanged)', () => {
    const existing = [[600, 660], [800, 860]];
    const snapshot = existing.map((b) => [b[0], b[1]]);
    can_book(700, 760, 540, false, existing);
    expect(existing).toEqual(snapshot);
  });

  it('does not mutate ROOM_FIXTURE during checks (AC6: fixture unchanged)', () => {
    const before = JSON.stringify(ROOM_FIXTURE);
    can_book(700, 760, ROOM_FIXTURE.now, false, ROOM_FIXTURE.existing);
    expect(JSON.stringify(ROOM_FIXTURE)).toBe(before);
    expect(ROOM_FIXTURE.existing).toEqual([[600, 660]]);
  });
});

describe('fixture', () => {
  it('ROOM_FIXTURE is frozen', () => {
    expect(Object.isFrozen(ROOM_FIXTURE)).toBe(true);
    expect(Object.isFrozen(ROOM_FIXTURE.existing)).toBe(true);
  });

  it('createRoomState returns an independent mutable copy', () => {
    const a = createRoomState();
    const b = createRoomState();
    a.blocked = true;
    a.existing.push([900, 960]);
    expect(b.blocked).toBe(false);
    expect(b.existing).toEqual([[600, 660]]);
    expect(ROOM_FIXTURE.blocked).toBe(false);
    expect(ROOM_FIXTURE.existing).toEqual([[600, 660]]);
  });
});

// Pure availability rules for the Smart Campus room checker.
// Each acceptance criterion is a standalone pure predicate; can_book composes
// them in a fixed order and returns the first failure (or AC5 success).
// Inputs are never mutated.

// AC1: candidate times are integer minutes after midnight with
// 0 <= start < end <= 1440, and start must be strictly after now.
export function isValidTimeWindow(start, end, now) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(now)) {
    return { ok: false, reason: 'Start, end, and now must be whole numbers (minutes after midnight).' };
  }
  if (!(0 <= start && start < end && end <= 1440)) {
    return { ok: false, reason: 'Times must satisfy 0 <= start < end <= 1440.' };
  }
  if (!(start > now)) {
    return { ok: false, reason: `Start time must be strictly after the current time (now = ${now}).` };
  }
  return { ok: true, reason: '' };
}

// AC2: duration must not exceed 120 minutes; exactly 120 is permitted.
export function isWithinDurationLimit(start, end) {
  if (end - start > 120) {
    return { ok: false, reason: 'Duration exceeds the 120-minute maximum.' };
  }
  return { ok: true, reason: '' };
}

// AC3: reject every request when the selected room is blocked.
export function isRoomNotBlocked(blocked) {
  if (blocked) {
    return { ok: false, reason: 'This room is currently blocked and cannot be booked.' };
  }
  return { ok: true, reason: '' };
}

// AC4: reject overlap with any existing booking; intervals touching at an
// endpoint (start === e or end === s) do NOT overlap and are allowed.
export function hasNoOverlap(start, end, existing) {
  for (const [s, e] of existing) {
    if (start < e && end > s) {
      return { ok: false, reason: `Overlaps existing booking ${s}–${e}.` };
    }
  }
  return { ok: true, reason: '' };
}

// AC5: all conditions pass. Signature and return shape are unchanged.
export function can_book(start, end, now, blocked, existing) {
  const ac1 = isValidTimeWindow(start, end, now);
  if (!ac1.ok) return ac1;

  const ac2 = isWithinDurationLimit(start, end);
  if (!ac2.ok) return ac2;

  const ac3 = isRoomNotBlocked(blocked);
  if (!ac3.ok) return ac3;

  const ac4 = hasNoOverlap(start, end, existing);
  if (!ac4.ok) return ac4;

  return { ok: true, reason: 'Room is available for the requested time.' };
}

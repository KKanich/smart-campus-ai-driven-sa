// Pure conversion helpers. Booking validity remains the responsibility of booking.js.
export function minutesToHHMM(min) {
  if (min === 1440) return '24:00';
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function hhmmToMinutes(str) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(str.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h === 24 && m === 0) return 1440;
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function parseInput(raw) {
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isInteger(n) ? n : null;
  }
  return hhmmToMinutes(trimmed);
}


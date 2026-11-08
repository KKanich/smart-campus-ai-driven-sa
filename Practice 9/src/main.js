import { can_book } from './booking.js';
import { ROOM_FIXTURE, createRoomState } from './fixture.js';

// UI-owned mutable state, seeded from the immutable fixture.
const room = createRoomState(ROOM_FIXTURE);

function minutesToHHMM(min) {
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
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

const app = document.getElementById('app');

function render() {
  app.innerHTML = `
    <main class="page">
      <header class="hero">
        <h1>Smart Campus Room Availability Checker</h1>
        <p class="subtitle">Check whether a room is free for your requested time. No booking is created.</p>
      </header>

      <section class="card room-card">
        <div class="room-head">
          <span class="room-name">${room.name}</span>
          <span class="badge ${room.blocked ? 'badge-blocked' : 'badge-open'}">
            ${room.blocked ? 'Blocked' : 'Open'}
          </span>
        </div>
        <dl class="room-meta">
          <div><dt>Current time (now)</dt><dd>${minutesToHHMM(room.now)} <span class="muted">(${room.now} min)</span></dd></div>
          <div><dt>Room status</dt><dd id="roomStatus">${room.blocked ? 'Blocked — no bookings allowed' : 'Available for booking checks'}</dd></div>
        </dl>
        <div class="toggle-row">
          <label class="switch" for="blockedToggle">
            <input type="checkbox" id="blockedToggle" ${room.blocked ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
          <span class="toggle-label" id="toggleLabel">${room.blocked ? 'Blocked' : 'Open'}</span>
          <span class="hint">Flip to test the blocked-room rule.</span>
        </div>
      </section>

      <section class="card form-card">
        <h2>Check a time slot</h2>
        <form id="checkForm" novalidate>
          <div class="field">
            <label for="startInput">Start time</label>
            <input id="startInput" name="start" type="text" inputmode="numeric" placeholder="HH:MM or minutes" autocomplete="off" />
            <span class="hint">e.g. 09:30 or 570</span>
          </div>
          <div class="field">
            <label for="endInput">End time</label>
            <input id="endInput" name="end" type="text" inputmode="numeric" placeholder="HH:MM or minutes" autocomplete="off" />
            <span class="hint">e.g. 11:00 or 660</span>
          </div>
          <button type="submit" class="btn-check">Check Availability</button>
        </form>
        <div id="result" class="result" hidden></div>
      </section>

      <section class="card bookings-card">
        <h2>Existing bookings</h2>
        <ul class="bookings-list">
          ${room.existing.map(([s, e]) => `
            <li>
              <span class="time-pill">${minutesToHHMM(s)} – ${minutesToHHMM(e)}</span>
              <span class="muted">(${s}–${e} min)</span>
            </li>
          `).join('')}
        </ul>
        <p class="hint">Touching endpoints are allowed — a slot starting exactly when another ends is not an overlap.</p>
      </section>
    </main>
  `;

  document.getElementById('checkForm').addEventListener('submit', onCheck);

  document.getElementById('blockedToggle').addEventListener('change', (event) => {
    room.blocked = event.target.checked;
    const badge = document.querySelector('.room-head .badge');
    badge.className = `badge ${room.blocked ? 'badge-blocked' : 'badge-open'}`;
    badge.textContent = room.blocked ? 'Blocked' : 'Open';
    document.getElementById('roomStatus').textContent =
      room.blocked ? 'Blocked — no bookings allowed' : 'Available for booking checks';
    document.getElementById('toggleLabel').textContent = room.blocked ? 'Blocked' : 'Open';
    const resultEl = document.getElementById('result');
    if (resultEl && !resultEl.hidden) {
      resultEl.hidden = true;
    }
  });
}

function onCheck(event) {
  event.preventDefault();
  const startRaw = document.getElementById('startInput').value;
  const endRaw = document.getElementById('endInput').value;
  const resultEl = document.getElementById('result');
  resultEl.hidden = false;

  const start = parseInput(startRaw);
  const end = parseInput(endRaw);

  if (start === null || end === null) {
    showResult(false, 'Please enter valid times as HH:MM or minutes after midnight (0–1440).');
    return;
  }

  // The toggle is the live source of truth for blocked state.
  const blockedToggle = document.getElementById('blockedToggle');
  if (blockedToggle) room.blocked = blockedToggle.checked;

  // can_book is a pure function and never mutates its inputs.
  const { ok, reason } = can_book(start, end, room.now, room.blocked, room.existing);
  const note = `Slot requested: ${minutesToHHMM(start)} – ${minutesToHHMM(end)}.`;
  showResult(ok, `${reason} ${note}`);
}

function parseInput(raw) {
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isInteger(n) ? n : null;
  }
  return hhmmToMinutes(trimmed);
}

function showResult(ok, message) {
  const resultEl = document.getElementById('result');
  resultEl.className = `result ${ok ? 'result-ok' : 'result-no'}`;
  resultEl.innerHTML = `
    <div class="result-status">${ok ? 'Available' : 'Unavailable'}</div>
    <div class="result-reason">${escapeHtml(message)}</div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

render();

import { can_book } from './booking.js';
import { ROOMS, NOW, EQUIPMENT } from './rooms.js';
import { filterRooms, isValidAttendeeCount } from './filters.js';
import { minutesToHHMM, parseInput } from './time.js';

let selectedRoomId = ROOMS[0].id;
function selectedRoom() { return ROOMS.find(room => room.id === selectedRoomId); }

const app = document.getElementById('app');

function render() {
  app.innerHTML = `
    <main class="page">
      <header class="hero">
        <h1>Smart Campus Room Availability Checker</h1>
        <p class="subtitle">Check whether a room is free for your requested time. No booking is created.</p>
      </header>

      <section class="card">
        <h2>Find a room</h2>
        <div class="field">
          <label for="attendees">Attendees</label>
          <input id="attendees" type="number" min="1" step="1" value="1" />
        </div>
        <fieldset id="equipmentFilters"><legend>Required equipment (all selected items)</legend>
          ${EQUIPMENT.map(item => `<label class="equipment-option"><input type="checkbox" value="${item}" /> ${item}</label>`).join('')}
        </fieldset>
        <p id="filterFeedback" role="status"></p>
        <div id="roomList" class="room-list" aria-label="Matching rooms"></div>
      </section>
      <section id="roomDetails" class="card room-card"></section>

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
        <div id="result" class="result" role="status" aria-live="polite" hidden></div>
      </section>

      <section id="bookingsCard" class="card bookings-card">
        <h2>Existing bookings</h2>
        <ul id="bookingsList" class="bookings-list"></ul>
        <p class="hint">Touching endpoints are allowed. No bookings are created.</p>
      </section>
    </main>
  `;

  document.getElementById('checkForm').addEventListener('submit', onCheck);

  document.getElementById('attendees').addEventListener('input', updateRooms);
  document.getElementById('equipmentFilters').addEventListener('change', updateRooms);
  document.getElementById('roomList').addEventListener('change', event => {
    if (event.target.name !== 'room') return;
    selectedRoomId = event.target.value;
    updateSelectedRoom();
  });
  for (const id of ['startInput', 'endInput']) {
    document.getElementById(id).addEventListener('input', clearResult);
  }
  updateRooms();
}

function clearResult() {
  const result = document.getElementById('result');
  result.hidden = true;
  result.textContent = '';
}

function updateRooms() {
  const attendees = Number(document.getElementById('attendees').value);
  const required = [...document.querySelectorAll('#equipmentFilters input:checked')].map(input => input.value);
  const matches = filterRooms(ROOMS, attendees, required);
  if (!matches.some(room => room.id === selectedRoomId)) selectedRoomId = matches[0]?.id ?? null;
  document.getElementById('filterFeedback').textContent = !isValidAttendeeCount(attendees)
    ? 'Enter a whole attendee count of at least 1.'
    : matches.length ? `${matches.length} matching rooms` : 'No rooms match your requirements. Try fewer attendees or equipment items.';
  document.getElementById('roomList').innerHTML = matches.map(room => `
    <label class="room-option">
      <input type="radio" name="room" value="${room.id}" ${room.id === selectedRoomId ? 'checked' : ''} />
      <span><strong>${room.id} — ${room.name}</strong><br />
      Capacity: ${room.capacity} · ${room.equipment.join(', ')}<br />
      <span class="badge ${room.blocked ? 'badge-blocked' : 'badge-open'}">${room.blocked ? 'Blocked' : 'Open'}</span></span>
    </label>`).join('');
  updateSelectedRoom();
}

function updateSelectedRoom() {
  clearResult();
  const room = selectedRoom();
  document.querySelector('.btn-check').disabled = !room;
  document.getElementById('roomDetails').hidden = !room;
  document.getElementById('bookingsCard').hidden = !room;
  if (!room) return;
  document.getElementById('roomDetails').innerHTML = `
    <h2>${room.id} — ${room.name}</h2>
    <p>Current simulated time: <strong>${minutesToHHMM(NOW)} (${NOW} min)</strong></p>
    <p>${room.blocked ? 'Blocked — no bookings allowed' : 'Open for availability checks'}</p>
    <p class="hint">Selection updated. Check availability for this room using the times below.</p>`;
  document.getElementById('bookingsList').innerHTML = room.existing.length
    ? room.existing.map(([start, end]) => `<li>${minutesToHHMM(start)} – ${minutesToHHMM(end)} (${start}–${end} min)</li>`).join('')
    : '<li>No existing bookings.</li>';
}

function onCheck(event) {
  event.preventDefault();
  const room = selectedRoom();
  if (!room) return;
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

  // can_book is a pure function and never mutates its inputs.
  const { ok, reason } = can_book(start, end, NOW, room.blocked, room.existing);
  const note = `Slot requested: ${minutesToHHMM(start)} – ${minutesToHHMM(end)}.`;
  showResult(ok, `${reason} ${note}`);
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

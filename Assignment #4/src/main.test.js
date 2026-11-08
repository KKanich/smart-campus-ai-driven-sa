// @vitest-environment jsdom
import { beforeEach, it, expect, vi } from 'vitest';

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  await import('./main.js');
});
const el = id => document.getElementById(id);
function input(id, value) {
  el(id).value = value;
  el(id).dispatchEvent(new Event('input', { bubbles: true }));
}
function check() { el('checkForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }
function select(id) {
  const radio = document.querySelector(`input[name="room"][value="${id}"]`);
  radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true }));
}
it('shows four rooms initially', () => expect(document.querySelectorAll('input[name="room"]')).toHaveLength(4));
it('switching rooms clears the old result, preserves times and checks the chosen bookings', () => {
  input('startInput', '11:00'); input('endInput', '12:00'); check();
  expect(el('result').textContent).toContain('Available');
  select('SCI-101');
  expect(el('result').hidden).toBe(true); expect(el('result').textContent).toBe('');
  expect(el('startInput').value).toBe('11:00');
  expect(el('bookingsList').textContent).toContain('11:00');
  check(); expect(el('result').textContent).toContain('Unavailable');
  expect(el('result').textContent).toContain('Overlaps');
});
it('shows empty state, clears old results, disables checking and recovers', () => {
  input('startInput', '660'); input('endInput', '720'); check();
  input('attendees', '31');
  expect(el('filterFeedback').textContent).toContain('No rooms match');
  expect(document.querySelectorAll('input[name="room"]')).toHaveLength(0);
  expect(document.querySelector('.btn-check').disabled).toBe(true);
  expect(el('result').hidden).toBe(true);
  input('attendees', '1'); expect(document.querySelector('.btn-check').disabled).toBe(false);
});
it('applies equipment and capacity through UI controls', () => {
  input('attendees', '20');
  const checkbox = document.querySelector('input[value="Computers"]');
  checkbox.checked = true; checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  const radios = document.querySelectorAll('input[name="room"]');
  expect(radios).toHaveLength(1); expect(radios[0].value).toBe('ENG-301');
  expect(el('roomDetails').textContent).toContain('ENG-301');
});
it('reports blocked rooms unavailable in the UI', () => {
  select('ART-102'); input('startInput', '660'); input('endInput', '720'); check();
  expect(el('result').textContent).toContain('Unavailable');
  expect(el('result').textContent).toContain('blocked');
});
it('preserves duration boundaries and clear validation feedback', () => {
  input('startInput', '720'); input('endInput', '840'); check();
  expect(el('result').textContent).toContain('Available');
  input('endInput', '841'); check(); expect(el('result').textContent).toContain('120-minute maximum');
  input('startInput', ''); check(); expect(el('result').textContent).toContain('Please enter valid times');
});
it('accepts and displays end of day as 24:00', () => {
  input('startInput', '23:00'); input('endInput', '24:00'); check();
  expect(el('result').textContent).toContain('Available');
  expect(el('result').textContent).toContain('23:00 – 24:00');
});

it('shows invalid-attendee feedback and recovers without a stale result', () => {
  input('startInput', '660'); input('endInput', '720'); check();
  input('attendees', '1.5');
  expect(el('filterFeedback').textContent).toBe('Enter a whole attendee count of at least 1.');
  expect(document.querySelectorAll('input[name="room"]')).toHaveLength(0);
  expect(document.querySelector('.btn-check').disabled).toBe(true);
  expect(el('result').hidden).toBe(true);
  input('attendees', '8');
  expect(document.querySelectorAll('input[name="room"]')).toHaveLength(4);
  expect(document.querySelector('.btn-check').disabled).toBe(false);
});

it('AC5 displays exactly one visible Available or Unavailable status', () => {
  input('startInput', '660'); input('endInput', '720'); check();
  expect(el('result').hidden).toBe(false);
  expect(el('result').querySelectorAll('.result-status')).toHaveLength(1);
  expect(el('result').querySelector('.result-status').textContent).toBe('Available');
  select('SCI-101'); check();
  expect(el('result').hidden).toBe(false);
  expect(el('result').querySelectorAll('.result-status')).toHaveLength(1);
  expect(el('result').querySelector('.result-status').textContent).toBe('Unavailable');
});
it('F5 filtering out the selected room clears the result and uses the new room schedule', () => {
  input('startInput', '660'); input('endInput', '720'); check();
  input('attendees', '20');
  expect(document.querySelector('input[name="room"]:checked').value).toBe('SCI-101');
  expect(el('result').hidden).toBe(true);
  expect(el('result').textContent).toBe('');
  expect(el('startInput').value).toBe('660'); expect(el('endInput').value).toBe('720');
  expect(el('bookingsList').textContent).toContain('660–720');
  check();
  expect(el('result').querySelector('.result-status').textContent).toBe('Unavailable');
  expect(el('result').textContent).toContain('Overlaps');
});

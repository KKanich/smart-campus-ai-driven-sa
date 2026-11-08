import { describe, it, expect } from 'vitest';
import { ROOMS, NOW } from './rooms.js';
import { filterRooms } from './filters.js';
import { can_book } from './booking.js';

describe('room catalog and filtering', () => {
  it('has four complete rooms with unique IDs and fixed time', () => {
    expect(ROOMS).toHaveLength(4);
    expect(new Set(ROOMS.map(r => r.id)).size).toBe(4);
    expect(NOW).toBe(540);
    for (const r of ROOMS) {
      expect(r.name).toBeTruthy(); expect(r.capacity).toBeGreaterThan(0);
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.blocked).toBe('boolean'); expect(Array.isArray(r.existing)).toBe(true);
    }
  });
  it('includes exact capacity', () => expect(filterRooms(ROOMS, 20).map(r => r.id)).toEqual(['SCI-101', 'ENG-301']));
  it('excludes insufficient capacity', () => expect(filterRooms(ROOMS, 21).map(r => r.id)).toEqual(['ENG-301']));
  it('requires ALL equipment', () => expect(filterRooms(ROOMS, 1, ['Projector', 'Computers']).map(r => r.id)).toEqual(['ENG-301']));
  it('excludes rooms missing any required item', () => expect(filterRooms(ROOMS, 1, ['Projector', 'Microphone'])).toEqual([]));
  it('combines equipment and capacity', () => expect(filterRooms(ROOMS, 20, ['Projector', 'Whiteboard']).map(r => r.id)).toEqual(['SCI-101', 'ENG-301']));
  it('returns no rooms when capacity cannot be met', () => expect(filterRooms(ROOMS, 31)).toEqual([]));
  it.each([0, -1, 1.5, NaN])('rejects invalid attendee count %s', value => expect(filterRooms(ROOMS, value)).toEqual([]));
  it('uses independent schedules for the same interval', () => {
    const check = r => can_book(660, 720, NOW, r.blocked, r.existing).ok;
    expect(check(ROOMS[0])).toBe(true); expect(check(ROOMS[1])).toBe(false);
  });
  it('never reports a blocked room available', () => {
    const r = ROOMS[3]; expect(can_book(660, 720, NOW, r.blocked, r.existing).ok).toBe(false);
  });
  it('deeply freezes the catalog and does not mutate bookings while filtering/checking', () => {
    const before = JSON.stringify(ROOMS);
    expect(() => { ROOMS[0].existing[0][0] = 0; }).toThrow();
    filterRooms(ROOMS, 8, ['Whiteboard']);
    for (const r of ROOMS) can_book(660, 720, NOW, r.blocked, r.existing);
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
});

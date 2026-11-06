// Fixture room data for the Smart Campus availability checker.
// Pure data — no UI, no mutation. The UI owns a mutable copy via createRoomState().

export const ROOM_FIXTURE = Object.freeze({
  name: 'Room LIB-204 (Study Lab)',
  now: 540,
  blocked: false,
  existing: Object.freeze([[600, 660]]),
});

export function createRoomState(fixture = ROOM_FIXTURE) {
  return {
    name: fixture.name,
    now: fixture.now,
    blocked: fixture.blocked,
    existing: fixture.existing.map((b) => [b[0], b[1]]),
  };
}

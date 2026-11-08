export const NOW = 540;

// Fictional, deeply frozen catalog. Checking availability never creates bookings.
export const ROOMS = Object.freeze([
  { id: 'LIB-204', name: 'Study Lab', capacity: 8, equipment: ['Whiteboard'], blocked: false, existing: [[600, 660]] },
  { id: 'SCI-101', name: 'Science Seminar', capacity: 20, equipment: ['Projector', 'Whiteboard'], blocked: false, existing: [[660, 720]] },
  { id: 'ENG-301', name: 'Computer Lab', capacity: 30, equipment: ['Projector', 'Computers', 'Whiteboard'], blocked: false, existing: [[780, 840]] },
  { id: 'ART-102', name: 'Design Studio', capacity: 12, equipment: ['Projector', 'Whiteboard'], blocked: true, existing: [] },
].map(room => Object.freeze({
  ...room,
  equipment: Object.freeze(room.equipment),
  existing: Object.freeze(room.existing.map(interval => Object.freeze(interval))),
})));

export const EQUIPMENT = Object.freeze([...new Set(ROOMS.flatMap(room => room.equipment))].sort());

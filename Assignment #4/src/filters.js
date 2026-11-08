export function isValidAttendeeCount(attendees) {
  return Number.isInteger(attendees) && attendees >= 1;
}

// Pure filtering: capacity is inclusive; every requested item must be present.
export function filterRooms(rooms, attendees, requiredEquipment = []) {
  if (!isValidAttendeeCount(attendees)) return [];
  return rooms.filter(room => room.capacity >= attendees &&
    requiredEquipment.every(item => room.equipment.includes(item)));
}

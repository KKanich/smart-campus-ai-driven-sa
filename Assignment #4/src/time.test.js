import { it, expect } from 'vitest';
import { parseInput, minutesToHHMM } from './time.js';

it.each([
  ['09:30', 570], [' 660 ', 660], ['24:00', 1440],
  ['', null], ['abc', null], ['12:60', null], ['24:01', null],
  ['-1', null], ['660.5', null],
])('parses %j as %s', (input, expected) => expect(parseInput(input)).toBe(expected));
it('formats fixed time and end-of-day unambiguously', () => {
  expect(minutesToHHMM(540)).toBe('09:00');
  expect(minutesToHHMM(1440)).toBe('24:00');
});

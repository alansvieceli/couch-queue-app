import { addMonths, formatDateKey, isDateKey, toDateKey } from './dates';

test('toDateKey pads month and day', () =>
  expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05'));

test('addMonths clamps to month end', () =>
  expect(toDateKey(addMonths(new Date(2026, 4, 31), -3))).toBe('2026-02-28'));

test('addMonths crosses years and keeps valid days', () => {
  expect(toDateKey(addMonths(new Date(2026, 0, 15), -3))).toBe('2025-10-15');
  expect(toDateKey(addMonths(new Date(2026, 10, 30), 3))).toBe('2027-02-28');
});

test('formatDateKey', () => expect(formatDateKey('2026-10-24')).toBe('24 out 2026'));

test('isDateKey accepts real dates only', () => {
  expect(isDateKey('2026-10-24')).toBe(true);
  expect(isDateKey('2026-02-30')).toBe(false);
  expect(isDateKey('2026-2-3')).toBe(false);
  expect(isDateKey(20261024)).toBe(false);
});

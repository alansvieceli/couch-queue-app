import {
  countExpiredWatched,
  DEFAULT_HISTORY_SETTINGS,
  HISTORY_MONTH_OPTIONS,
  normalizeHistorySettings,
  periodLabel,
  purgeOldWatched,
} from './history';
import { makeState, makeTitle } from './stateFixtures';

const today = new Date(2026, 9, 24); // keepMonths 3 -> cutoff 2026-07-24
const watched = (id: string, watchedAt: string | null, groupId = 'group-default') =>
  makeTitle({ id, watchedAt, groupId });

test('keeps the cutoff day', () => {
  const state = makeState({
    titles: [watched('edge', '2026-07-24'), watched('old', '2026-07-23')],
  });
  expect(purgeOldWatched(state, 3, today).titles.map((t) => t.id)).toEqual(['edge']);
});

test('never touches queued titles', () => {
  const state = makeState({
    titles: [watched('q', null), watched('old', '2020-01-01')],
  });
  expect(purgeOldWatched(state, 3, today).titles.map((t) => t.id)).toEqual(['q']);
});

test('never deletes with keepMonths null', () => {
  const state = makeState({ titles: [watched('old', '2000-01-01')] });
  expect(purgeOldWatched(state, null, today)).toBe(state);
  expect(countExpiredWatched(state, null, today)).toBe(0);
});

test('returns the same object when nothing expires', () => {
  const state = makeState({
    titles: [watched('new', '2026-10-01'), watched('q', null)],
  });
  expect(purgeOldWatched(state, 3, today)).toBe(state);
});

test('countExpiredWatched counts across all groups', () => {
  const state = makeState({
    groups: [
      { id: 'group-default', name: 'Eu sozinha' },
      { id: 'g2', name: 'Casal' },
    ],
    titles: [
      watched('a', '2026-01-01'),
      watched('b', '2026-01-02', 'g2'),
      watched('c', '2026-10-01', 'g2'),
      watched('d', null),
    ],
  });
  expect(countExpiredWatched(state, 3, today)).toBe(2);
  expect(purgeOldWatched(state, 3, today).titles.map((t) => t.id)).toEqual(['c', 'd']);
});

test('normalizeHistorySettings falls back to 3 for unknown values and accepts null', () => {
  expect(HISTORY_MONTH_OPTIONS).toEqual([1, 3, 6, 12, null]);
  expect(DEFAULT_HISTORY_SETTINGS).toEqual({ keepMonths: 3 });
  expect(normalizeHistorySettings(undefined)).toEqual({ keepMonths: 3 });
  expect(normalizeHistorySettings({})).toEqual({ keepMonths: 3 });
  expect(normalizeHistorySettings({ keepMonths: 5 })).toEqual({ keepMonths: 3 });
  expect(normalizeHistorySettings({ keepMonths: '6' })).toEqual({ keepMonths: 3 });
  expect(normalizeHistorySettings({ keepMonths: null })).toEqual({ keepMonths: null });
  expect(normalizeHistorySettings({ keepMonths: 12 })).toEqual({ keepMonths: 12 });
});

test('labels every period option in pt-BR', () => {
  expect(HISTORY_MONTH_OPTIONS.map(periodLabel)).toEqual([
    '1 mês',
    '3 meses',
    '6 meses',
    '12 meses',
    'Nunca apagar',
  ]);
});

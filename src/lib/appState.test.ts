import {
  createDefaultState,
  isRecord,
  parseStoredState,
  validateAppState,
} from './appState';
import { makeState, makeTitle } from './stateFixtures';

test('default state has one group and the seven services in order', () => {
  const s = createDefaultState();
  expect(s.groups).toEqual([{ id: 'group-default', name: 'Eu sozinha' }]);
  expect(s.services.map((x) => x.name)).toEqual([
    'Netflix',
    'HBO+',
    'Paramount+',
    'Amazon Prime',
    'Apple TV',
    'Disney+',
    'Cinema',
  ]);
  expect(s.services.map((x) => x.id)).toEqual([
    'service-netflix',
    'service-hbo',
    'service-paramount',
    'service-prime',
    'service-appletv',
    'service-disney',
    'service-cinema',
  ]);
  expect(s.titles).toEqual([]);
});

test('accepts a valid state with queue and watched titles, trimming names', () => {
  const state = makeState({
    titles: [
      makeTitle({ id: 't1', name: '  Dark ' }),
      makeTitle({ id: 't2', kind: 'movie', watchedAt: '2026-10-24' }),
    ],
  });
  const check = validateAppState(state);
  expect(check.ok).toBe(true);
  if (check.ok) expect(check.state.titles[0].name).toBe('Dark');
});

test('accepts zero services', () =>
  expect(validateAppState({ ...createDefaultState(), services: [] }).ok).toBe(true));

test('rejects zero groups', () =>
  expect(validateAppState({ ...createDefaultState(), groups: [] }).ok).toBe(false));

test('rejects non-objects and missing lists', () => {
  expect(validateAppState(null)).toEqual({ ok: false, reason: 'shape' });
  expect(validateAppState([])).toEqual({ ok: false, reason: 'shape' });
  expect(validateAppState({ groups: [] })).toEqual({ ok: false, reason: 'shape' });
  expect(validateAppState({ ...createDefaultState(), titles: undefined })).toEqual({
    ok: false,
    reason: 'shape',
  });
});

test('rejects a bad kind or watchedAt', () => {
  const badKind = makeState({
    titles: [{ ...makeTitle(), kind: 'show' as never }],
  });
  expect(validateAppState(badKind)).toEqual({ ok: false, reason: 'shape' });
  const badDate = makeState({ titles: [makeTitle({ watchedAt: '2026-02-30' })] });
  expect(validateAppState(badDate)).toEqual({ ok: false, reason: 'shape' });
  const missingDate = makeState({
    titles: [{ ...makeTitle(), watchedAt: undefined as never }],
  });
  expect(validateAppState(missingDate)).toEqual({ ok: false, reason: 'shape' });
});

test('rejects blank text fields', () => {
  expect(validateAppState(makeState({ groups: [{ id: 'g', name: '  ' }] })).ok).toBe(
    false,
  );
  expect(validateAppState(makeState({ titles: [makeTitle({ name: '' })] })).ok).toBe(
    false,
  );
});

test('rejects titles with unknown service', () => {
  const s = makeState({ titles: [makeTitle({ serviceId: 'nope' })] });
  expect(validateAppState(s)).toEqual({ ok: false, reason: 'references' });
});

test('rejects titles with unknown group', () => {
  const s = makeState({ titles: [makeTitle({ groupId: 'nope' })] });
  expect(validateAppState(s)).toEqual({ ok: false, reason: 'references' });
});

test('parseStoredState: null -> default, not invalid; garbage -> default, invalid', () => {
  expect(parseStoredState(null)).toEqual({
    state: createDefaultState(),
    wasInvalid: false,
  });
  expect(parseStoredState('{not json')).toEqual({
    state: createDefaultState(),
    wasInvalid: true,
  });
  expect(parseStoredState('{"groups":[]}')).toEqual({
    state: createDefaultState(),
    wasInvalid: true,
  });
});

test('parseStoredState round-trips a valid state', () => {
  const state = makeState({ titles: [makeTitle()] });
  expect(parseStoredState(JSON.stringify(state))).toEqual({ state, wasInvalid: false });
});

test('isRecord', () => {
  expect(isRecord({})).toBe(true);
  expect(isRecord([])).toBe(false);
  expect(isRecord(null)).toBe(false);
});

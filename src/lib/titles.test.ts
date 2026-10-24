import { makeState, makeTitle } from './stateFixtures';
import {
  addTitle,
  deleteTitle,
  markWatched,
  queueFor,
  reorderQueue,
  returnToQueue,
  servicesInQueue,
  unwatchTitle,
  updateTitle,
  watchedFor,
} from './titles';

const draft = { name: 'Severance', kind: 'series' as const, serviceId: 'service-hbo' };
const ids = (titles: { id: string }[]) => titles.map((t) => t.id);
const abc = () =>
  makeState({
    titles: [makeTitle({ id: 'a' }), makeTitle({ id: 'b' }), makeTitle({ id: 'c' })],
  });

test('addTitle appends to the end of the group queue and ignores blank names or unknown service', () => {
  const s = abc();
  const next = addTitle(s, 'd', 'group-default', { ...draft, name: '  Severance  ' });
  expect(ids(queueFor(next, 'group-default', null))).toEqual(['a', 'b', 'c', 'd']);
  expect(next.titles[3]).toEqual({
    id: 'd',
    groupId: 'group-default',
    name: 'Severance',
    kind: 'series',
    serviceId: 'service-hbo',
    watchedAt: null,
  });
  expect(addTitle(s, 'd', 'group-default', { ...draft, name: '   ' })).toBe(s);
  expect(addTitle(s, 'd', 'group-default', { ...draft, serviceId: 'nope' })).toBe(s);
  expect(addTitle(s, 'd', 'nope', draft)).toBe(s);
});

test('updateTitle edits name, kind and service in place', () => {
  const s = abc();
  const next = updateTitle(s, 'b', {
    name: ' Dune ',
    kind: 'movie',
    serviceId: 'service-hbo',
  });
  expect(next.titles[1]).toMatchObject({
    id: 'b',
    name: 'Dune',
    kind: 'movie',
    serviceId: 'service-hbo',
  });
  expect(ids(next.titles)).toEqual(['a', 'b', 'c']);
  expect(updateTitle(s, 'zz', draft)).toBe(s);
  expect(updateTitle(s, 'b', { ...draft, name: ' ' })).toBe(s);
  expect(updateTitle(s, 'b', { ...draft, serviceId: 'nope' })).toBe(s);
});

test('deleteTitle removes the title and ignores unknown ids', () => {
  const s = abc();
  expect(ids(deleteTitle(s, 'b').titles)).toEqual(['a', 'c']);
  expect(deleteTitle(s, 'zz')).toBe(s);
});

test('markWatched stores today as YYYY-MM-DD', () => {
  const s = abc();
  const next = markWatched(s, 'b', new Date(2026, 9, 24));
  expect(next.titles[1].watchedAt).toBe('2026-10-24');
  expect(ids(next.titles)).toEqual(['a', 'b', 'c']);
  expect(markWatched(s, 'zz', new Date(2026, 9, 24))).toBe(s);
});

test('unwatchTitle keeps the queue position', () => {
  const s = abc();
  const watched = markWatched(s, 'b', new Date(2026, 9, 24));
  expect(ids(queueFor(watched, 'group-default', null))).toEqual(['a', 'c']);
  const back = unwatchTitle(watched, 'b');
  expect(ids(queueFor(back, 'group-default', null))).toEqual(['a', 'b', 'c']);
  expect(back.titles[1].watchedAt).toBeNull();
  expect(unwatchTitle(s, 'zz')).toBe(s);
});

test('returnToQueue puts the title at the end', () => {
  const watched = markWatched(abc(), 'a', new Date(2026, 9, 24));
  const next = returnToQueue(watched, 'a');
  expect(ids(queueFor(next, 'group-default', null))).toEqual(['b', 'c', 'a']);
  expect(next.titles[2].watchedAt).toBeNull();
  expect(returnToQueue(watched, 'zz')).toBe(watched);
});

const mixed = () =>
  makeState({
    groups: [
      { id: 'g1', name: 'Eu' },
      { id: 'g2', name: 'Nós' },
    ],
    titles: [
      makeTitle({ id: 'a', groupId: 'g1' }),
      makeTitle({ id: 'x', groupId: 'g2' }),
      makeTitle({ id: 'b', groupId: 'g1' }),
      makeTitle({ id: 'w', groupId: 'g1', watchedAt: '2026-10-01' }),
      makeTitle({ id: 'c', groupId: 'g1' }),
    ],
  });

test('reorderQueue reorders only the group queue', () => {
  const next = reorderQueue(mixed(), 'g1', ['c', 'a', 'b']);
  expect(ids(queueFor(next, 'g1', null))).toEqual(['c', 'a', 'b']);
  expect(ids(next.titles)).toEqual(['c', 'x', 'a', 'w', 'b']);
  expect(next.titles.find((t) => t.id === 'x')?.groupId).toBe('g2');
  expect(next.titles.find((t) => t.id === 'w')?.watchedAt).toBe('2026-10-01');
});

test('reorderQueue ignores a non-matching id list', () => {
  const s = mixed();
  expect(reorderQueue(s, 'g1', ['c', 'a'])).toBe(s); // missing id
  expect(reorderQueue(s, 'g1', ['c', 'a', 'b', 'x'])).toBe(s); // extra id
  expect(reorderQueue(s, 'g1', ['c', 'a', 'a'])).toBe(s); // duplicate id
  expect(reorderQueue(s, 'g1', ['c', 'a', 'w'])).toBe(s); // watched title
  expect(reorderQueue(s, 'g1', ['a', 'c'])).toBe(s); // filtered subset
  expect(reorderQueue(s, 'g1', [])).toBe(s);
});

test('queueFor filters by service', () => {
  const s = makeState({
    titles: [
      makeTitle({ id: 'a', serviceId: 'service-netflix' }),
      makeTitle({ id: 'b', serviceId: 'service-hbo' }),
      makeTitle({ id: 'c', serviceId: 'service-netflix', watchedAt: '2026-10-01' }),
    ],
  });
  expect(ids(queueFor(s, 'group-default', null))).toEqual(['a', 'b']);
  expect(ids(queueFor(s, 'group-default', 'service-hbo'))).toEqual(['b']);
  expect(queueFor(s, 'other', null)).toEqual([]);
});

test('watchedFor is most recent first', () => {
  const s = makeState({
    titles: [
      makeTitle({ id: 'a', watchedAt: '2026-10-01' }),
      makeTitle({ id: 'b', watchedAt: '2026-10-20' }),
      makeTitle({ id: 'c', watchedAt: '2026-10-01' }),
      makeTitle({ id: 'q' }),
    ],
  });
  expect(ids(watchedFor(s, 'group-default'))).toEqual(['b', 'c', 'a']);
});

test('servicesInQueue lists only services with queued titles, in services order', () => {
  const s = makeState({
    titles: [
      makeTitle({ id: 'a', serviceId: 'service-hbo' }),
      makeTitle({ id: 'b', serviceId: 'service-netflix', watchedAt: '2026-10-01' }),
    ],
  });
  expect(servicesInQueue(s, 'group-default').map((x) => x.id)).toEqual(['service-hbo']);
  const both = addTitle(s, 'c', 'group-default', {
    name: 'X',
    kind: 'movie',
    serviceId: 'service-netflix',
  });
  expect(servicesInQueue(both, 'group-default').map((x) => x.id)).toEqual([
    'service-netflix',
    'service-hbo',
  ]);
});

import { createDefaultState } from './appState';
import {
  addGroup,
  countGroupTitles,
  deleteGroup,
  groupDeleteBlock,
  normalizeSelectedGroup,
  renameGroup,
  resolveGroupId,
} from './groups';
import { makeState, makeTitle } from './stateFixtures';

const twoGroups = () =>
  makeState({
    groups: [
      { id: 'g1', name: 'Eu' },
      { id: 'g2', name: 'Nós' },
    ],
    titles: [
      makeTitle({ id: 't1', groupId: 'g1' }),
      makeTitle({ id: 't2', groupId: 'g2' }),
      makeTitle({ id: 't3', groupId: 'g2', watchedAt: '2026-10-01' }),
    ],
  });

test('cannot delete the last group', () => {
  const s = createDefaultState();
  expect(groupDeleteBlock(s, 'group-default')).toBe('last-group');
  expect(deleteGroup(s, 'group-default')).toBe(s);
});

test('deleteGroup removes its titles', () => {
  const s = twoGroups();
  expect(groupDeleteBlock(s, 'g2')).toBeNull();
  const next = deleteGroup(s, 'g2');
  expect(next.groups.map((g) => g.id)).toEqual(['g1']);
  expect(next.titles.map((t) => t.id)).toEqual(['t1']);
});

test('deleteGroup with an unknown id returns the same state', () => {
  const s = twoGroups();
  expect(deleteGroup(s, 'nope')).toBe(s);
});

test('countGroupTitles counts queue and watched titles', () => {
  const s = twoGroups();
  expect(countGroupTitles(s, 'g1')).toBe(1);
  expect(countGroupTitles(s, 'g2')).toBe(2);
  expect(countGroupTitles(s, 'nope')).toBe(0);
});

test('resolveGroupId falls back to the first group', () => {
  const groups = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ];
  expect(resolveGroupId(groups, 'b')).toBe('b');
  expect(resolveGroupId(groups, 'gone')).toBe('a');
  expect(resolveGroupId(groups, null)).toBe('a');
});

test('blank names are ignored and names are trimmed', () => {
  const s = createDefaultState();
  expect(addGroup(s, 'x', '  ')).toBe(s);
  const added = addGroup(s, 'x', '  Nós ');
  expect(added.groups.at(-1)).toEqual({ id: 'x', name: 'Nós' });
  expect(renameGroup(added, 'x', '')).toBe(added);
  expect(renameGroup(added, 'x', ' Casal ').groups.at(-1)?.name).toBe('Casal');
});

test('renameGroup with an unknown id returns the same state', () => {
  const s = createDefaultState();
  expect(renameGroup(s, 'nope', 'Novo')).toBe(s);
});

test('normalizeSelectedGroup keeps only a non-empty string', () => {
  expect(normalizeSelectedGroup('g1')).toBe('g1');
  expect(normalizeSelectedGroup('  ')).toBeNull();
  expect(normalizeSelectedGroup(42)).toBeNull();
  expect(normalizeSelectedGroup(null)).toBeNull();
});

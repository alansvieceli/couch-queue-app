import { createDefaultState } from './appState';
import {
  addService,
  deleteService,
  renameService,
  serviceDeleteBlock,
} from './services';
import { makeState, makeTitle } from './stateFixtures';

test('a service used by any title (queue or watched) cannot be deleted', () => {
  const queued = makeState({ titles: [makeTitle({ serviceId: 'service-hbo' })] });
  expect(serviceDeleteBlock(queued, 'service-hbo')).toBe('in-use');
  expect(deleteService(queued, 'service-hbo')).toBe(queued);
  const watched = makeState({
    titles: [makeTitle({ serviceId: 'service-hbo', watchedAt: '2026-10-01' })],
  });
  expect(serviceDeleteBlock(watched, 'service-hbo')).toBe('in-use');
});

test('an unused service can be deleted, even the last one', () => {
  const s = makeState();
  const one = deleteService(s, 'service-hbo');
  expect(one.services.map((x) => x.id)).toEqual(['service-netflix']);
  const none = deleteService(one, 'service-netflix');
  expect(none.services).toEqual([]);
  expect(serviceDeleteBlock(s, 'service-netflix')).toBeNull();
});

test('deleteService with an unknown id returns the same state', () => {
  const s = makeState();
  expect(deleteService(s, 'nope')).toBe(s);
});

test('blank names are ignored and names are trimmed', () => {
  const s = createDefaultState();
  expect(addService(s, 'x', ' ')).toBe(s);
  const added = addService(s, 'x', '  Globoplay ');
  expect(added.services.at(-1)).toEqual({ id: 'x', name: 'Globoplay' });
  expect(renameService(added, 'x', '')).toBe(added);
  expect(renameService(added, 'x', ' Max ').services.at(-1)?.name).toBe('Max');
  expect(renameService(s, 'nope', 'Max')).toBe(s);
});

import type { AppState, Title } from './appState';

export function makeTitle(partial: Partial<Title> = {}): Title {
  return {
    id: 'title-1',
    groupId: 'group-default',
    name: 'Dark',
    kind: 'series',
    serviceId: 'service-netflix',
    watchedAt: null,
    ...partial,
  };
}

export function makeState(partial: Partial<AppState> = {}): AppState {
  return {
    groups: [{ id: 'group-default', name: 'Eu sozinha' }],
    services: [
      { id: 'service-netflix', name: 'Netflix' },
      { id: 'service-hbo', name: 'HBO+' },
    ],
    titles: [],
    ...partial,
  };
}

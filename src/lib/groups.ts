import type { AppState, Group } from './appState';

export function addGroup(state: AppState, id: string, name: string): AppState {
  const trimmed = name.trim();
  if (trimmed === '') return state;
  return { ...state, groups: [...state.groups, { id, name: trimmed }] };
}

export function renameGroup(state: AppState, id: string, name: string): AppState {
  const trimmed = name.trim();
  if (trimmed === '' || !state.groups.some((group) => group.id === id)) return state;
  return {
    ...state,
    groups: state.groups.map((group) =>
      group.id === id ? { ...group, name: trimmed } : group,
    ),
  };
}

export function groupDeleteBlock(state: AppState, _id: string): 'last-group' | null {
  return state.groups.length <= 1 ? 'last-group' : null;
}

export function countGroupTitles(state: AppState, id: string) {
  return state.titles.filter((title) => title.groupId === id).length;
}

// Deleting a group also removes its titles (queue and watched).
export function deleteGroup(state: AppState, id: string): AppState {
  if (groupDeleteBlock(state, id) !== null) return state;
  if (!state.groups.some((group) => group.id === id)) return state;
  return {
    ...state,
    groups: state.groups.filter((group) => group.id !== id),
    titles: state.titles.filter((title) => title.groupId !== id),
  };
}

export function resolveGroupId(groups: Group[], id: string | null) {
  return groups.find((group) => group.id === id)?.id ?? groups[0].id;
}

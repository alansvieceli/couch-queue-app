import type { AppState, Service, Title, TitleKind } from './appState';
import { toDateKey } from './dates';

export type TitleDraft = { name: string; kind: TitleKind; serviceId: string };

function cleanDraft(state: AppState, draft: TitleDraft) {
  const name = draft.name.trim();
  const serviceKnown = state.services.some((service) => service.id === draft.serviceId);
  return name === '' || !serviceKnown ? null : { ...draft, name };
}

function patchTitle(state: AppState, id: string, patch: Partial<Title>): AppState {
  if (!state.titles.some((title) => title.id === id)) return state;
  return {
    ...state,
    titles: state.titles.map((title) =>
      title.id === id ? { ...title, ...patch } : title,
    ),
  };
}

export function addTitle(
  state: AppState,
  id: string,
  groupId: string,
  draft: TitleDraft,
): AppState {
  const clean = cleanDraft(state, draft);
  if (!clean || !state.groups.some((group) => group.id === groupId)) return state;
  return {
    ...state,
    titles: [...state.titles, { id, groupId, ...clean, watchedAt: null }],
  };
}

export function updateTitle(state: AppState, id: string, draft: TitleDraft): AppState {
  const clean = cleanDraft(state, draft);
  return clean ? patchTitle(state, id, clean) : state;
}

export function deleteTitle(state: AppState, id: string): AppState {
  if (!state.titles.some((title) => title.id === id)) return state;
  return { ...state, titles: state.titles.filter((title) => title.id !== id) };
}

export function markWatched(state: AppState, id: string, today: Date): AppState {
  return patchTitle(state, id, { watchedAt: toDateKey(today) });
}

// Undo: markWatched keeps the array position, so clearing watchedAt restores the queue slot.
export function unwatchTitle(state: AppState, id: string): AppState {
  return patchTitle(state, id, { watchedAt: null });
}

export function returnToQueue(state: AppState, id: string): AppState {
  const title = state.titles.find((item) => item.id === id);
  if (!title) return state;
  return {
    ...state,
    titles: [
      ...state.titles.filter((item) => item.id !== id),
      { ...title, watchedAt: null },
    ],
  };
}

export function queueFor(state: AppState, groupId: string, serviceId: string | null) {
  return state.titles.filter(
    (title) =>
      title.groupId === groupId &&
      title.watchedAt === null &&
      (serviceId === null || title.serviceId === serviceId),
  );
}

// Only an exact permutation of the group's current queue is applied; anything else is stale.
export function reorderQueue(
  state: AppState,
  groupId: string,
  orderedIds: string[],
): AppState {
  const queue = queueFor(state, groupId, null);
  const byId = new Map(queue.map((title) => [title.id, title]));
  if (orderedIds.length !== queue.length || new Set(orderedIds).size !== queue.length) {
    return state;
  }
  if (!orderedIds.every((id) => byId.has(id))) return state;

  const queued = new Set(queue);
  let next = 0;
  const titles = state.titles.map((title) =>
    queued.has(title) ? (byId.get(orderedIds[next++]) as Title) : title,
  );
  return { ...state, titles };
}

export function watchedFor(state: AppState, groupId: string) {
  return state.titles
    .map((title, index) => ({ title, index }))
    .filter(({ title }) => title.groupId === groupId && title.watchedAt !== null)
    .sort(
      (a, b) =>
        (b.title.watchedAt as string).localeCompare(a.title.watchedAt as string) ||
        b.index - a.index,
    )
    .map(({ title }) => title);
}

export function servicesInQueue(state: AppState, groupId: string): Service[] {
  const used = new Set(queueFor(state, groupId, null).map((title) => title.serviceId));
  return state.services.filter((service) => used.has(service.id));
}

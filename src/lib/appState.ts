import { isDateKey } from './dates';

export type TitleKind = 'series' | 'movie';
export type Group = { id: string; name: string };
export type Service = { id: string; name: string };
export type Title = {
  id: string;
  groupId: string;
  name: string;
  kind: TitleKind;
  serviceId: string;
  watchedAt: string | null;
};
export type AppState = { groups: Group[]; services: Service[]; titles: Title[] };

type StateCheck =
  | { ok: true; state: AppState }
  | { ok: false; reason: 'shape' | 'references' };

export function createDefaultState(): AppState {
  return {
    groups: [{ id: 'group-default', name: 'Eu sozinha' }],
    services: [
      { id: 'service-netflix', name: 'Netflix' },
      { id: 'service-hbo', name: 'HBO+' },
      { id: 'service-paramount', name: 'Paramount+' },
      { id: 'service-prime', name: 'Amazon Prime' },
      { id: 'service-appletv', name: 'Apple TV' },
      { id: 'service-disney', name: 'Disney+' },
      { id: 'service-cinema', name: 'Cinema' },
    ],
    titles: [],
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function parseList<T>(value: unknown, parseItem: (item: unknown) => T | null) {
  if (!Array.isArray(value)) return null;
  const parsed: T[] = [];
  for (const item of value) {
    const result = parseItem(item);
    if (result === null) return null;
    parsed.push(result);
  }
  return parsed;
}

function parseNamed(value: unknown): Group | null {
  if (!isRecord(value) || !isText(value.id) || !isText(value.name)) return null;
  return { id: value.id, name: value.name.trim() };
}

function parseTitle(value: unknown): Title | null {
  if (
    !isRecord(value) ||
    !isText(value.id) ||
    !isText(value.groupId) ||
    !isText(value.name) ||
    (value.kind !== 'series' && value.kind !== 'movie') ||
    !isText(value.serviceId) ||
    (value.watchedAt !== null && !isDateKey(value.watchedAt))
  ) {
    return null;
  }
  return {
    id: value.id,
    groupId: value.groupId,
    name: value.name.trim(),
    kind: value.kind,
    serviceId: value.serviceId,
    watchedAt: value.watchedAt,
  };
}

export function validateAppState(value: unknown): StateCheck {
  if (!isRecord(value)) return { ok: false, reason: 'shape' };

  const groups = parseList(value.groups, parseNamed);
  const services = parseList(value.services, parseNamed);
  const titles = parseList(value.titles, parseTitle);
  if (!groups || groups.length === 0 || !services || !titles) {
    return { ok: false, reason: 'shape' };
  }

  const groupIds = new Set(groups.map((group) => group.id));
  const serviceIds = new Set(services.map((service) => service.id));
  if (!titles.every((t) => groupIds.has(t.groupId) && serviceIds.has(t.serviceId))) {
    return { ok: false, reason: 'references' };
  }
  return { ok: true, state: { groups, services, titles } };
}

export function parseStoredState(raw: string | null) {
  if (raw === null) return { state: createDefaultState(), wasInvalid: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: createDefaultState(), wasInvalid: true };
  }
  const check = validateAppState(parsed);
  return check.ok
    ? { state: check.state, wasInvalid: false }
    : { state: createDefaultState(), wasInvalid: true };
}

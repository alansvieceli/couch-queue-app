import { type AppState, isRecord } from './appState';
import { addMonths, toDateKey } from './dates';

export type HistorySettings = { keepMonths: number | null }; // null = never delete

export const HISTORY_MONTH_OPTIONS: readonly (number | null)[] = [1, 3, 6, 12, null];

export const DEFAULT_HISTORY_SETTINGS: HistorySettings = { keepMonths: 3 };

export function normalizeHistorySettings(raw: unknown): HistorySettings {
  // A missing key is undefined (-> default); only an explicit null means "never".
  if (!isRecord(raw) || !('keepMonths' in raw)) return DEFAULT_HISTORY_SETTINGS;
  const keepMonths = HISTORY_MONTH_OPTIONS.find((option) => option === raw.keepMonths);
  return keepMonths === undefined ? DEFAULT_HISTORY_SETTINGS : { keepMonths };
}

// Only watched titles expire. Date keys are zero-padded, so string order is date order.
function kept(state: AppState, keepMonths: number | null, today: Date) {
  if (keepMonths === null) return state.titles;
  const cutoff = toDateKey(addMonths(today, -keepMonths));
  return state.titles.filter((t) => t.watchedAt === null || t.watchedAt >= cutoff);
}

export function purgeOldWatched(
  state: AppState,
  keepMonths: number | null,
  today: Date,
): AppState {
  const titles = kept(state, keepMonths, today);
  return titles.length === state.titles.length ? state : { ...state, titles };
}

export function countExpiredWatched(
  state: AppState,
  keepMonths: number | null,
  today: Date,
): number {
  return state.titles.length - kept(state, keepMonths, today).length;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type AppState, createDefaultState, parseStoredState } from '../lib/appState';
import {
  addGroup,
  countGroupTitles,
  deleteGroup,
  groupDeleteBlock,
  renameGroup,
} from '../lib/groups';
import { countExpiredWatched, purgeOldWatched } from '../lib/history';
import { createId } from '../lib/ids';
import {
  addService,
  deleteService,
  renameService,
  serviceDeleteBlock,
} from '../lib/services';
import {
  addTitle,
  deleteTitle,
  markWatched,
  reorderQueue,
  returnToQueue,
  type TitleDraft,
  unwatchTitle,
  updateTitle,
} from '../lib/titles';

const STORAGE_KEY = '@couch-queue-app/state/v1';
const LOAD_ERROR = 'Não foi possível ler os dados salvos. Alterações não serão salvas.';
const INVALID_NOTICE =
  'Os dados salvos estavam corrompidos e foram substituídos pelo padrão. Restaure um backup.';
const SAVE_ERROR = 'Não foi possível salvar os dados.';

export function useAppState() {
  const [state, setState] = useState<AppState>(createDefaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadNotice, setLoadNotice] = useState<string | null>(null);
  // A failed read must never be followed by a save that overwrites the stored data.
  const canSave = useRef(true);
  // The start-up cleanup can fire in the same commit as the load; it must see the
  // latest state, not a stale render.
  const latest = useRef(state);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        const loaded = parseStoredState(raw);
        if (loaded.wasInvalid && raw !== null) {
          await AsyncStorage.setItem(`${STORAGE_KEY}.invalid`, raw);
        }
        if (loaded.wasInvalid) setLoadNotice(INVALID_NOTICE);
        latest.current = loaded.state;
        setState(loaded.state);
      })
      .catch(() => {
        canSave.current = false;
        setLoadFailed(true);
        setSaveError(LOAD_ERROR);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const update = useCallback((next: AppState) => {
    latest.current = next;
    setState(next);
    if (!canSave.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      .then(() => setSaveError(null))
      .catch(() => setSaveError(SAVE_ERROR));
  }, []);

  return {
    state,
    isLoaded,
    loadFailed,
    saveError,
    loadNotice,
    addGroup: (name: string) => update(addGroup(state, createId('group'), name)),
    renameGroup: (id: string, name: string) => update(renameGroup(state, id, name)),
    deleteGroup: (id: string) => update(deleteGroup(state, id)),
    getGroupDeleteBlock: (id: string) => groupDeleteBlock(state, id),
    countGroupTitles: (id: string) => countGroupTitles(state, id),
    addService: (name: string) => update(addService(state, createId('service'), name)),
    renameService: (id: string, name: string) => update(renameService(state, id, name)),
    deleteService: (id: string) => update(deleteService(state, id)),
    getServiceDeleteBlock: (id: string) => serviceDeleteBlock(state, id),
    saveTitle: (id: string | null, groupId: string, draft: TitleDraft) =>
      update(
        id === null
          ? addTitle(state, createId('title'), groupId, draft)
          : updateTitle(state, id, draft),
      ),
    deleteTitle: (id: string) => update(deleteTitle(state, id)),
    markWatched: (id: string) => update(markWatched(state, id, new Date())),
    unwatchTitle: (id: string) => update(unwatchTitle(state, id)),
    returnToQueue: (id: string) => update(returnToQueue(state, id)),
    reorderQueue: (groupId: string, ids: string[]) =>
      update(reorderQueue(state, groupId, ids)),
    purgeOldWatched: (keepMonths: number | null) => {
      const next = purgeOldWatched(latest.current, keepMonths, new Date());
      if (next !== latest.current) update(next);
    },
    countExpiredWatched: (keepMonths: number | null) =>
      countExpiredWatched(state, keepMonths, new Date()),
    replaceState: update,
    resetState: () => update(createDefaultState()),
  };
}

export type AppStore = ReturnType<typeof useAppState>;

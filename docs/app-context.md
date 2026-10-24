# App Context

## Purpose

Couch Queue is a personal Android app (React Native, Expo, TypeScript) for one user. It keeps, in order, the series and movies the user wants to watch, separately for each group of people they watch with (for example `Eu sozinha`, `Eu e meu marido`). Every title is tagged with its streaming service. The app only lists and orders; it does not search, rate or track episodes.

## Status

Shell, the Fila tab (see "Fila tab" below) and the Manutenção tab: groups and streamings (add, inline rename, delete with the rules below), history period, backup, restore and reset. `Já vistos` is still a placeholder. See `docs/specs/001-couch-queue-app.md` for the planned behavior.

## Planned

- `Já vistos` tab: watched history per group with `Voltar para a lista` and delete (retention already runs on start).

## Data

State is one document, `AppState` (`src/lib/appState.ts`): `groups` (at least one; default `Eu sozinha`, id `group-default`), `services` (default Netflix, HBO+, Paramount+, Amazon Prime, Apple TV, Disney+, Cinema; may be empty) and `titles`. A title has a group, a name, a kind (`series` or `movie`), a streaming service and `watchedAt` (`YYYY-MM-DD`, or `null` while in the queue). Validation rejects malformed data (`shape`) and titles pointing to an unknown group or service (`references`); invalid stored data falls back to the default state. Deleting a group also deletes its titles and the last group cannot be deleted; a service used by any title cannot be deleted. Names are trimmed and blank names are ignored. `useAppState` (`src/hooks/useAppState.ts`) loads and saves the document; after a failed read nothing is saved over the stored data, and unreadable data is kept under `@couch-queue-app/state/v1.invalid`.

## Constraints

- Android only.
- All data is stored locally on the device (AsyncStorage key `@couch-queue-app/state/v1`). No backend, hosting, authentication or notifications.
- Single user.
- Visual identity: Veludo, dark only (plum background, rose accent, serif titles).
- UI copy in Brazilian Portuguese, following `docs/standards/ui-copy-policy.md`.
- Tooling: TypeScript strict, Biome, Knip, Jest.

## Queue behavior

Rules live in `src/lib/titles.ts` (pure functions). The queue of a group is its titles with `watchedAt === null`, in `titles` array order; new titles go to the end. Marking watched only sets `watchedAt`, keeping the array slot, so undo (`unwatchTitle`) restores the exact previous position, while `returnToQueue` (from history) moves the title to the end. `reorderQueue` is applied only when the id list is exactly the group's current queue (no missing, extra, duplicate or filtered ids); otherwise state is unchanged. Only the group's queued slots are rewritten, other groups and watched titles stay in place. Watched history is sorted by `watchedAt` descending, ties by later array position first. The service filter list shows only services that have queued titles, in service order.

## Fila tab

`src/components/queue/`: `GroupPicker` (card `Grupo` / name, opens a modal list), `ServiceFilter` (`Todos` + services in this group's queue; the filter is local to the screen, belongs to one group, and a service that leaves the queue counts as `Todos`), `QueueList` (`react-native-reorderable-list`) and `QueueRow`. Dragging starts from the grip (`Arrastar para reordenar`), which is shown and enabled only with `Todos`, so the reorder payload is always the full queue (`store.reorderQueue`). Positions are numbered in the visible list, the first in accent. Tapping a row opens `TitleFormModal` in edit mode (with `Excluir` and confirmation); `+` opens it to add to the end of the selected group's queue (the active filter's service is preselected). With no streamings the form says `Cadastre um streaming em Manutenção.` and cannot save. The round check marks watched without confirmation and shows `UndoToast` for 5 s; `Desfazer` calls `unwatchTitle` (same position); a new mark replaces the toast. `App.tsx` wraps everything in `GestureHandlerRootView`.

## History retention and backup

`src/lib/history.ts`: `purgeOldWatched` deletes watched titles (all groups) with `watchedAt` older than `today - keepMonths` (cutoff day is kept; queued titles never expire; same state object returned when nothing is removed). Options are 1, 3, 6, 12 months or `null` (never delete); default 3. `normalizeHistorySettings` accepts `{ keepMonths: null }` as "never" but a missing or unknown value gives the default 3.

`src/lib/backup.ts`: the backup file is JSON named `couch-queue-backup-YYYY-MM-DD.cqb` with `format: "couch-queue-backup"`, `formatVersion: 1`, `app.name: "Couch Queue"`, `data` (the whole `AppState`) and a SHA-256 hash of the canonical JSON (the hash function is injected). Restore checks, in order: JSON validity, format, version, hash, then `validateAppState` (shape, at least one group, title references), returning a pt-BR error message for each failure and never a partial state.

## Maintenance tab and device settings

Groups and streamings: add (default names `Grupo N` / `Streaming N`), rename inline, delete with confirmation. Deleting the last group is blocked (`É preciso manter ao menos um grupo.`); deleting a group with titles asks to also delete them; a streaming used by titles cannot be deleted. History period chips: `1 mês`, `3 meses`, `6 meses`, `12 meses`, `Nunca apagar`; choosing a shorter period asks for confirmation only when titles would be deleted, then saves and purges. Backup shares a `.cqb` file, restore validates it and asks before replacing data, reset asks before clearing.

Device settings (`useDeviceSetting`, AsyncStorage): history period at `@couch-queue-app/history/v1` (`{ keepMonths }`, `null` = never). The purge of old watched titles runs once per app start, only after both the data and the setting loaded, and never after a failed read of either. Selected group at `@couch-queue-app/selected-group/v1` (non-empty string or `null`, `normalizeSelectedGroup`); `CouchQueueApp` resolves it with `resolveGroupId`, so a deleted or restored-away group falls back to the first group. `Fila` and (later) `Já vistos` share it.

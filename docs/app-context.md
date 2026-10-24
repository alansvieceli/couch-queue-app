# App Context

## Purpose

Couch Queue is a personal Android app (React Native, Expo, TypeScript) for one user. It keeps, in order, the series and movies the user wants to watch, separately for each group of people they watch with (for example `Eu sozinha`, `Eu e meu marido`). Every title is tagged with its streaming service. The app only lists and orders; it does not search, rate or track episodes.

## Status

App shell only: Veludo theme, branding (popcorn bucket icon, splash, header wordmark `Couch Queue`), and the three tabs `Fila`, `Já vistos`, `Manutenção` with placeholder screens. No queue, history or data feature is implemented yet. See `docs/specs/001-couch-queue-app.md` for the planned behavior.

## Planned

- Per-group queue with manual drag-and-drop order, filter by streaming service, watched history auto-deleted after a configurable period (default 3 months).
- Manutenção: groups, streaming services, history period, backup (`.cqb`), restore, reset.

## Data

State is one document, `AppState` (`src/lib/appState.ts`): `groups` (at least one; default `Eu sozinha`, id `group-default`), `services` (default Netflix, HBO+, Paramount+, Amazon Prime, Apple TV, Disney+, Cinema; may be empty) and `titles`. A title has a group, a name, a kind (`series` or `movie`), a streaming service and `watchedAt` (`YYYY-MM-DD`, or `null` while in the queue). Validation rejects malformed data (`shape`) and titles pointing to an unknown group or service (`references`); invalid stored data falls back to the default state. Deleting a group also deletes its titles and the last group cannot be deleted; a service used by any title cannot be deleted. Names are trimmed and blank names are ignored. Persistence and history cleanup are not implemented yet.

## Constraints

- Android only.
- All data is stored locally on the device (AsyncStorage key `@couch-queue-app/state/v1`). No backend, hosting, authentication or notifications.
- Single user.
- Visual identity: Veludo, dark only (plum background, rose accent, serif titles).
- UI copy in Brazilian Portuguese, following `docs/standards/ui-copy-policy.md`.
- Tooling: TypeScript strict, Biome, Knip, Jest.

## Queue behavior

Rules live in `src/lib/titles.ts` (pure functions, no UI yet). The queue of a group is its titles with `watchedAt === null`, in `titles` array order; new titles go to the end. Marking watched only sets `watchedAt`, keeping the array slot, so undo (`unwatchTitle`) restores the exact previous position, while `returnToQueue` (from history) moves the title to the end. `reorderQueue` is applied only when the id list is exactly the group's current queue (no missing, extra, duplicate or filtered ids); otherwise state is unchanged. Only the group's queued slots are rewritten, other groups and watched titles stay in place. Watched history is sorted by `watchedAt` descending, ties by later array position first. The service filter list shows only services that have queued titles, in service order.

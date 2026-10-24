# Spec 001 - Couch Queue App

## Objective

Build `couch-queue-app`, a personal Android app (React Native, Expo, TypeScript) that keeps, in order, the series and movies the user wants to watch, separately for each group of people they watch with, each title tagged with its streaming service, with a watched history and local backup and restore.

## Context

- Single user, Android only, offline-first. All data stays on the device.
- Sibling of `life-plan-app` and `cycle12-finance-app`: one JSON document in AsyncStorage, SHA-256 backup envelope, Ionicons, `theme/colors.ts` + `theme/typography.ts`, native splash, Biome, Knip, Jest.
- Full design: `docs/superpowers/specs/2026-10-24-couch-queue-design.md`.
- UI copy is Brazilian Portuguese, sentence case, per `docs/standards/ui-copy-policy.md`.

## Goals

- Groups: user-managed list (at least 1); each has its own queue and watched history.
- Titles: name, type (`Série` or `Filme`), streaming service. Add, edit, delete, mark as watched.
- Manual queue order by drag and drop through a grip handle; filter by streaming service.
- Streaming services: pre-registered `Netflix`, `HBO+`, `Paramount+`, `Amazon Prime`, `Apple TV`, `Disney+`, `Cinema`; add, rename, delete.
- Watched history (`Já vistos`) per group, auto-deleted after a configurable period (default 3 months).
- Maintenance tab: groups, streaming services, history period, backup, restore, reset.
- App icon, splash and Veludo visual identity.

## Non-goals

- No backend, internet calls, authentication, sync, paid services, notifications.
- No metadata lookup, notes, seasons/episodes or progress.
- No iOS, web, or light theme.
- No navigation library; the 3 tabs are plain component state.
- No arrow buttons for reordering.

## Data Model

Single document under AsyncStorage key `@couch-queue-app/state/v1`:

```ts
type AppState = {
  groups: { id: string; name: string }[]; // at least 1
  services: { id: string; name: string }[]; // may be empty
  titles: {
    id: string;
    groupId: string;
    name: string;
    kind: 'series' | 'movie';
    serviceId: string;
    watchedAt: string | null;
  }[]; // ISO date, null = in queue
};
```

- Queue order is the array order of the group's unwatched titles.
- Default / reset state: group `Eu sozinha`, the 7 default services, no titles.
- Names are trimmed and non-empty. Every title references an existing group and service.
- History period is a device setting outside state and backup (`@couch-queue-app/history/v1`): 1, 3, 6, 12 months or never; default 3. The selected group is a device setting (`@couch-queue-app/selected-group/v1`).

## Screens

- Shell: header with icon and `Couch Queue` wordmark; tabs `Fila`, `Já vistos`, `Manutenção`; the selected group is shared by the first two.
- `Fila`: group selector, service filter chips, numbered rows (grip, position, name, service tag, type, check button). Drag only with `Todos`. Watched has no confirmation and a `Desfazer` toast that restores the exact position. Floating `+` form (name, type, service); new titles go to the end. Tap a row to edit or delete.
- `Já vistos`: watched titles of the group, most recent first, with date; `Voltar para a lista` (to the end of the queue) and delete with confirmation.
- `Manutenção`: `Grupos` (the last group cannot be deleted; deleting a group with titles asks confirmation and removes its queue and history), `Streamings` (a service used by any title cannot be deleted), `Histórico` (period; confirmation with count when shortening deletes something), `Dados` (backup, restore, reset).

## Backup

File `couch-queue-backup-YYYY-MM-DD.cqb`, JSON envelope (`format: "couch-queue-backup"`, `formatVersion: 1`, `exportedAt`, `app`, `integrity` SHA-256, `data`). Restore validates parse, envelope, hash, shapes, references and at least one group, then replaces atomically; any failure keeps current data and shows a pt-BR error.

## Branding

Popcorn bucket icon on a `#E77C9A` rounded square; splash background `#1A1222`; name `Couch Queue`, slug `couch-queue-app`, package `br.com.couchqueue.app`.

## Theme

Veludo, dark only: `background #1A1222`, `surface #251A30`, `surfaceMuted #33243F`, `border #40304E`, `textPrimary #F3ECF7`, `textSecondary #A898B5`, `accent #E77C9A`, `accentText #1A1222`, plus `negative #FF7A85`, `positive #7FD6A8`, `overlay rgba(10, 6, 14, 0.6)`. Serif titles in Fraunces.

## Architecture

```
src/
  lib/          pure, tested rules (queue, appState, backup, retention, dates, ids)
  hooks/        useAppState, useDeviceSetting
  components/   common/, queue/, watched/, maintenance/
  theme/        colors.ts, typography.ts, sharedStyles.ts
App.tsx
```

Screens consume `useAppState` only; they never touch AsyncStorage.

## Delivery Plans

Bootstrap, branding and shell; state, maintenance and backup; Fila; Já vistos and retention. Executed one task at a time (see `docs/superpowers/plans/`).

## Tests

`src/lib/` coverage above 80%: queue ordering, watched/unwatched transitions, retention cutoffs, group/service delete rules, validation, dates, backup round trip and every restore failure, default/reset state.

## Acceptance Criteria

- Three tabs work as described; per-group queues and histories are independent.
- Drag and drop reorders the queue; filtered views do not reorder.
- Marking watched is undoable; invalid reorder payloads change nothing.
- Retention deletes only watched titles older than the cutoff; the cutoff day survives; `Nunca apagar` deletes nothing.
- Backup, restore (atomic, validated) and reset behave as specified.
- `npm run check` passes; `src/lib/` coverage above 80%; duplication at or below 5%.
- `README.md` and `docs/app-context.md` are updated per their policies.

## Assumptions

- Dates are stored as ISO strings; retention compares calendar days in local time.
- The remembered group falls back to the first group when it no longer exists.
- Drag library: `react-native-reorderable-list` (0.18.x) instead of `react-native-draggable-flatlist`. The latter's last release (4.0.3, May 2025) predates Reanimated 4 and its sources use `Animated.SharedValue` / `Animated.AnimateProps`, which Reanimated 4's `Animated` namespace no longer exports; `react-native-reorderable-list` is actively maintained (release October 2026), pure JS on Gesture Handler + Reanimated (peers `>=2.12` / `>=3.12`), and bundles with Expo 56 / RN 0.85. No Babel config is needed: `babel-preset-expo` adds the worklets plugin automatically.
- Queue positions are numbered within the visible (filtered) list.

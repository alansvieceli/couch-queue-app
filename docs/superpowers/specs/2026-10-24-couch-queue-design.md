# Couch Queue: design

## Intent

`couch-queue-app` (display name `Couch Queue`) is a personal Android app for keeping, in order, the series and movies the user wants to watch, separately for each "group" of people they watch with (`Eu sozinha`, `Eu e meu marido`, `Eu e meu amigo`, ...). Every title is tagged with the streaming service it is on. The app only lists and orders; it does not search, rate or track episodes.

It is a sibling of `life-plan-app` and `cycle12-finance-app` (`C:\projetos\app\`) and must reuse their base and rules unchanged: Expo 56 + React Native + TypeScript strict, Android only, single user, offline-first (all data in AsyncStorage on the device), Biome, Knip, Jest, Husky, `npm run check`, the spec → plan → task workflow, and the `docs/` structure (`app-context.md`, `standards/`, `quality/`, `specs/`, `plans/`, `tasks/`). `life-plan-app` is the primary template (closest structure: `src/lib`, `src/hooks/useAppState`, `components/common`, `theme/`, `.lpb`-style backup, retention).

## Goals

- Groups: user-managed list; each group has its own queue and its own watched history.
- Titles: name, type (`Série` or `Filme`), streaming service. Add, edit, delete, mark as watched.
- Order: each group's queue has a manual order changed by drag and drop through a grip handle (⋮⋮) on the left of each row.
- Filter the queue by streaming service (`Todos` or one service).
- Streaming services: pre-registered `Netflix`, `HBO+`, `Paramount+`, `Amazon Prime`, `Apple TV`, `Disney+`, `Cinema`; the user can add, rename and delete.
- Watched history (`Já vistos`) per group, auto-deleted after a configurable period (default 3 months).
- Maintenance tab: groups, streaming services, history period, backup, restore, reset.
- App icon, splash and Veludo visual identity.

## Non-goals

- No backend, internet calls, authentication, sync, paid services, notifications.
- No metadata lookup (posters, synopsis, ratings), no notes field, no seasons/episodes or progress.
- No iOS or web; no light/dark switch (the app is dark only).
- No navigation library: tabs are plain component state, as in life-plan.

## Anti-goals

- Reordering must feel direct (grab and drag), not arrow buttons — the user explicitly rejected ▲▼.
- A restore or delete must never leave data half-changed.

## Data model (builder may refine names)

One JSON document in AsyncStorage, key `@couch-queue-app/state/v1`:

```ts
type AppState = {
  groups:   { id: string; name: string }[];                         // at least 1
  services: { id: string; name: string }[];                         // streaming services, may be empty
  titles:   { id: string; groupId: string; name: string;
              kind: 'series' | 'movie'; serviceId: string;
              watchedAt: string | null }[];                         // ISO date when watched, null = in queue
};
```

- Queue order = array order of unwatched titles of the group (my call: order is implicit in the array; the builder may use an explicit `position` instead if simpler).
- Default/reset state: one group `Eu sozinha`; the 7 services above; no titles.
- Names trimmed and non-empty. Every title references an existing group and service.
- The same title may exist in several groups as independent entries.
- History period is a device setting outside the state and the backup (like life-plan retention): `@couch-queue-app/history/v1`, values 1, 3, 6, 12 months or `Nunca apagar`, default 3.

## Screens

Approved mockups: `C:\projetos\app\.superpowers\brainstorm\2031-1792861611\content\visual-style-v2.html` (layout + Veludo) and `icon.html` (option 4).

### Shell

- Header on every tab: app icon + `Couch Queue` serif wordmark. (My call: no greeting line, unlike life-plan.)
- Bottom tabs: `Fila`, `Já vistos`, `Manutenção`.
- The selected group is shared by `Fila` and `Já vistos`; my call: remember the last selected group as a device setting.

### Fila

- Group selector card at the top (`Grupo` / name ▾) opening a list of groups to switch.
- Filter chips: `Todos` + one per service that has at least one title in this group's queue (my call).
- Numbered rows: grip handle, position number (first highlighted with accent), name (one line, ellipsis), service tag + `Série`/`Filme`, and a round check button to mark as watched.
- Drag and drop reorders the queue. The grip handle is shown only with `Todos` selected (my call: reordering inside a filtered view would move items relative to hidden ones).
- Marking as watched has no confirmation; a short `Desfazer` toast puts the title back in its previous position (my call, protects the hand-made order from an accidental tap).
- Floating `+` opens the form: name, type (`Série`/`Filme`), service (chips). New titles go to the end of the queue.
- Tap a row to edit (same form) or delete (confirmation).
- Empty queue shows a short friendly message.

### Já vistos

- Watched titles of the selected group, most recent first, with the watched date.
- Action `Voltar para a lista` puts the title back at the end of the queue (clears `watchedAt`). Delete with confirmation (my call).

### Manutenção

- `Grupos`: add, rename, delete. The last group cannot be deleted. Deleting a group with titles asks for confirmation and deletes its queue and history.
- `Streamings`: add, rename, delete. A service used by any title (queue or history, any group) cannot be deleted; message like `Mova ou exclua os títulos deste streaming antes.`
- `Histórico`: period selector (1, 3, 6, 12 meses, `Nunca apagar`). Shortening the period asks for confirmation when something would be deleted, showing the count.
- `Dados`: `Fazer backup`, `Restaurar backup`, `Limpar tudo` (confirmation), status/error area — same behavior as life-plan.

## History retention

Watched titles whose `watchedAt` is older than today minus the period are deleted on app start (after a successful read) and when the period is shortened. Unwatched titles are never touched. Restore does not clean up until the next start. Same pattern as life-plan `retention.ts`.

## Backup

Same mechanism as life-plan: file `couch-queue-backup-YYYY-MM-DD.cqb`, JSON envelope (`format: "couch-queue-backup"`, `formatVersion: 1`, `exportedAt`, `app`, `integrity` SHA-256 of canonical payload, `data`). Restore validates parse → envelope → hash → shapes → references (titles point to existing groups and services) → at least one group, then replaces atomically; any failure keeps current data and shows a pt-BR error. Uses `expo-file-system`, `expo-sharing`, `expo-document-picker`, `expo-crypto`.

## Visual identity: Veludo (dark)

Tokens (same names as the sibling apps): `background #1A1222`, `surface #251A30`, `surfaceMuted #33243F`, `border #40304E`, `textPrimary #F3ECF7`, `textSecondary #A898B5`, `accent #E77C9A`, `accentText #1A1222`; builder adds `negative`/`warning` as needed in the same palette. Serif titles (life-plan uses Fraunces; reuse it). `userInterfaceStyle: dark`.

## Branding

- Icon: option 4, popcorn bucket — cream popcorn on top, dark striped bucket, small cream play triangle on the bucket, on a `#E77C9A` rounded square. Generate `app-icon.png`, `adaptive-icon-foreground.png` (glyph in the safe zone, background `#E77C9A`), `splash-logo.png`, `favicon.png` with a throwaway script, as in life-plan.
- Splash via `expo-splash-screen`, background `#1A1222`, held until state loads.
- `app.json`: name `Couch Queue`, slug `couch-queue-app`, package `br.com.couchqueue.app` (my call, following `br.com.lifeplan.app`).

## Dependencies

Same as life-plan minus notifications, plus `react-native-gesture-handler` and `react-native-reanimated` for drag and drop, and a drag-list package compatible with Expo 56 (e.g. `react-native-draggable-flatlist`; builder verifies compatibility and may choose another or implement with the two base libs). This is a justified exception to "no unnecessary dependencies": the user explicitly asked for drag reordering.

## Tests (per testing-policy)

`src/lib/` coverage above 80%: queue ordering (move, add to end, restore to end, filter), watched/unwatched transitions, retention cutoffs per period, group/service delete rules, backup round trip and every restore failure, default/reset state.

## Delivery

Create `C:\projetos\app\couch-queue-app` as a new git repo. Copy and adapt from life-plan: `AGENTS.md`, `CLAUDE.md`, `docs/standards/*`, `docs/quality/*` (fresh baseline and a new manual checklist), `biome.json`, `knip.json`, `jest.config.js`, `tsconfig.json`, `.husky`, `.editorconfig`, `.gitignore`, `scripts/build-apk.js`. Write `docs/app-context.md` and `docs/specs/001-couch-queue-app.md` from this design, then plans in the same split as life-plan (bootstrap + branding + shell; state + maintenance + backup; Fila; Já vistos + retention).

## Left to the builder

Component breakdown, exact copy of messages (following `ui-copy-policy.md`), Ionicons choices, drag library choice, id helper reuse, typography sizes.

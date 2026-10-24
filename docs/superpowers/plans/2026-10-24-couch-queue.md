# Couch Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `couch-queue-app`, an offline Android app that keeps an ordered, per-group queue of series and movies tagged by streaming service, with a watched history, maintenance and backup/restore.

**Architecture:** Clone of the `life-plan-app` structure (`C:\projetos\app\life-plan-app`): pure, tested business rules in `src/lib/`, one `useAppState` hook that owns the AsyncStorage JSON document, device settings via `useDeviceSetting`, presentational components under `src/components/{common,queue,watched,maintenance}`, theme tokens in `src/theme/`. Tabs are plain component state.

**Tech Stack:** Expo ~56, React Native 0.85, React 19.2, TypeScript ~6 strict, AsyncStorage, expo-crypto/file-system/sharing/document-picker/splash-screen/font, Fraunces font, react-native-gesture-handler + react-native-reanimated + react-native-draggable-flatlist, Biome, Knip, Jest (jest-expo), Husky + lint-staged.

**Spec:** `docs/superpowers/specs/2026-10-24-couch-queue-design.md` (read it with this plan).

## Global Constraints

- Android only, single user, all data local in AsyncStorage; no backend, network, auth, notifications, paid services.
- Copy every rule from life-plan: `AGENTS.md`, `CLAUDE.md`, `docs/standards/*` (react-native-standards, ui-copy-policy, testing-policy, spec-completion-policy, code-duplication-policy, readme-policy, app-context-policy, ai-workflow), replacing "Life Plan"/houses/week examples with Couch Queue ones.
- UI copy in Brazilian Portuguese, sentence case; code, identifiers, comments and `docs/` in English.
- Ionicons (`@expo/vector-icons`) only; colors only from `src/theme/colors.ts`; text styles only from `src/theme/typography.ts`.
- Theme Veludo, dark only: `background #1A1222`, `surface #251A30`, `surfaceMuted #33243F`, `border #40304E`, `textPrimary #F3ECF7`, `textSecondary #A898B5`, `accent #E77C9A`, `accentText #1A1222`; add `negative #FF7A85`, `positive #7FD6A8`, `overlay rgba(10, 6, 14, 0.6)` (builder's call within the palette).
- State key `@couch-queue-app/state/v1`; history setting key `@couch-queue-app/history/v1`; selected group key `@couch-queue-app/selected-group/v1`.
- Default services, in this order: `Netflix`, `HBO+`, `Paramount+`, `Amazon Prime`, `Apple TV`, `Disney+`, `Cinema`. Default group: `Eu sozinha`.
- History period options: 1, 3, 6, 12 months or never; default 3.
- Backup file `couch-queue-backup-YYYY-MM-DD.cqb`, `format: "couch-queue-backup"`, `formatVersion: 1`.
- `app.json`: name `Couch Queue`, slug `couch-queue-app`, package `br.com.couchqueue.app`, `userInterfaceStyle: "dark"`, portrait.
- `npm run check` passes at the end of every task; `src/lib/` coverage ≥ 80%; `jscpd` duplication ≤ 5%.
- Commit messages follow the husky `commit-msg` pattern `type: message` (feat, fix, docs, test, build, chore, ...).

## Review Focus

1. Accidental tap on the watched check: `Desfazer` must return the title to its exact previous position — pinned by `unwatchTitle keeps the queue position` (Task 4).
2. Reorder payload that is not exactly the group's current queue (filter on, stale list, title deleted mid-drag) must leave state unchanged — pinned by `reorderQueue ignores a non-matching id list` (Task 4).
3. The remembered group was deleted (or a restore removed it): the app must fall back to the first group, never show an empty unknown group — pinned by `resolveGroupId falls back to the first group` (Task 3).
4. Restoring a backup with a title pointing to a missing group or service must fail with the references message and change nothing — pinned by `rejects titles with unknown service` (Task 5).
5. A title watched exactly on the cutoff day must survive cleanup; "never" must delete nothing — pinned by `keeps the cutoff day` and `never deletes with keepMonths null` (Task 5).

---

### Task 1: Project bootstrap, tooling and docs

**Files:**
- Create: `couch-queue-app/` with `package.json`, `app.json`, `index.ts`, `App.tsx`, `tsconfig.json`, `biome.json`, `knip.json`, `jest.config.js`, `.editorconfig`, `.gitignore`, `.husky/pre-commit`, `.husky/commit-msg`, `scripts/build-apk.js`
- Create: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/app-context.md`, `docs/specs/001-couch-queue-app.md`, `docs/standards/*.md`, `docs/quality/coverage-baseline.md`, `docs/quality/manual-test-checklist.md`
- Create: `src/lib/ids.ts`, `src/lib/ids.test.ts` (copied from life-plan)

**Interfaces:**
- Produces: `createId(prefix: string): string`; npm scripts identical to life-plan (`start`, `android`, `build:apk`, `lint`, `format`, `format:check`, `typecheck`, `dup`, `test`, `test:coverage`, `biome:ci`, `knip`, `knip:production`, `check`, `prepare`).

- [ ] **Step 1:** In `C:\projetos\app\couch-queue-app` run `git init`, then copy from life-plan: `tsconfig.json`, `biome.json` (drop the `graphify-out` exclude), `jest.config.js`, `.editorconfig`, `.gitignore`, `.husky/`, `scripts/build-apk.js` (replace life-plan names inside), `index.ts`, `src/lib/ids.ts` and `ids.test.ts`.
- [ ] **Step 2:** Write `package.json` with name `couch-queue-app`, version `0.1.0`, the life-plan scripts and lint-staged block, and life-plan dependencies minus `expo-notifications`; then `npm install` and `npx expo install --check`.
- [ ] **Step 3:** Write `knip.json` like life-plan with `src/lib/stateFixtures.ts` excluded; `ignoreDependencies` only as needed.
- [ ] **Step 4:** Write `App.tsx` rendering a placeholder `<Text>Couch Queue</Text>` (replaced in Task 2) and `app.json` with the Global Constraints values (no icons yet).
- [ ] **Step 5:** Copy and adapt `AGENTS.md`, `CLAUDE.md`, all `docs/standards/*.md`; write `docs/specs/001-couch-queue-app.md` as a condensed copy of the design spec in life-plan spec format; write `docs/app-context.md` (status: bootstrap only); `docs/quality/coverage-baseline.md` empty template; `docs/quality/manual-test-checklist.md` header only; `README.md` per readme-policy.
- [ ] **Step 6:** Run `npm run check`. Expected: biome, typecheck, `ids.test.ts` pass, knip clean.
- [ ] **Step 7:** Commit: `git add -A && git commit -m "chore: bootstrap couch queue project"`.

### Task 2: Theme, branding and app shell

**Files:**
- Create: `src/theme/colors.ts`, `src/theme/typography.ts` (copy life-plan), `src/components/common/{AppHeader,TabBar,IconName}.tsx|ts` (copy and adapt), `src/CouchQueueApp.tsx`, `src/components/queue/QueueScreen.tsx`, `src/components/watched/WatchedScreen.tsx`, `src/components/maintenance/MaintenanceScreen.tsx` (placeholders)
- Create: `assets/app-icon.png`, `assets/adaptive-icon-foreground.png`, `assets/splash-logo.png`, `assets/favicon.png`
- Modify: `App.tsx`, `app.json`

**Interfaces:**
- Produces: `colors` (tokens above), `typography` (life-plan shape), `TabBar<T>`, `AppHeader()`, `type AppTab = 'queue' | 'watched' | 'maintenance'`.

- [ ] **Step 1:** Generate the icon assets with a throwaway Node script in the session scratchpad (install `sharp` there, never in the project). Glyph = popcorn bucket from `C:\projetos\app\.superpowers\brainstorm\2031-1792861611\content\icon.html` option `pipoca` (SVG `#i4`): cream `#F3ECF7` popcorn, `#1A1222` striped bucket, cream play triangle. `app-icon.png` 1024 full-bleed `#E77C9A`; `adaptive-icon-foreground.png` 1024 transparent, glyph within the central 66% safe zone; `splash-logo.png` rounded `#E77C9A` tile with glyph; `favicon.png` 48.
- [ ] **Step 2:** `app.json`: icon, adaptive icon (background `#E77C9A`), `expo-splash-screen` plugin (image `splash-logo.png`, background `#1A1222`, `contain`, width 180), `expo-font`, `expo-sharing`, `softwareKeyboardLayoutMode: "resize"`, `predictiveBackGestureEnabled: false`.
- [ ] **Step 3:** `AppHeader`: icon image + `Couch Queue` in `typography.sectionTitle`, no greeting. `TabBar` copied. Tabs: `queue` `Fila` (`list-outline`), `watched` `Já vistos` (`checkmark-done-outline`), `maintenance` `Manutenção` (`settings-outline`).
- [ ] **Step 4:** `CouchQueueApp` mirrors `LifePlanApp` (safe area, Fraunces load, splash hide when fonts ready) with the three placeholder screens. `App.tsx`: `GestureHandlerRootView` is added in Task 7, `StatusBar style="light"`.
- [ ] **Step 5:** `npm run check`; then `npx expo start` on the emulator: splash, header, three tabs visible in Veludo colors.
- [ ] **Step 6:** Commit `feat: add veludo theme, branding and app shell`.

### Task 3: Domain state, groups and services rules

**Files:**
- Create: `src/lib/appState.ts`, `src/lib/appState.test.ts`, `src/lib/dates.ts`, `src/lib/dates.test.ts`, `src/lib/groups.ts`, `src/lib/groups.test.ts`, `src/lib/services.ts`, `src/lib/services.test.ts`, `src/lib/stateFixtures.ts`

**Interfaces:**
- Produces (`appState.ts`):

  ```ts
  export type TitleKind = 'series' | 'movie';
  export type Group = { id: string; name: string };
  export type Service = { id: string; name: string };
  export type Title = { id: string; groupId: string; name: string; kind: TitleKind;
                        serviceId: string; watchedAt: string | null }; // 'YYYY-MM-DD' or null
  export type AppState = { groups: Group[]; services: Service[]; titles: Title[] };
  export type StateCheck = { ok: true; state: AppState } | { ok: false; reason: 'shape' | 'references' };
  export function createDefaultState(): AppState;
  export function isRecord(value: unknown): value is Record<string, unknown>;
  export function validateAppState(value: unknown): StateCheck;
  export function parseStoredState(raw: string | null): { state: AppState; wasInvalid: boolean };
  ```
- Produces (`dates.ts`): `toDateKey(date: Date): string`, `isDateKey(value: unknown): value is string`, `addMonths(date: Date, months: number): Date`, `formatDateKey(key: string): string` (`'2026-10-24'` → `'24 out 2026'`).
- Produces (`groups.ts`): `addGroup(state, id, name)`, `renameGroup(state, id, name)`, `deleteGroup(state, id)` (also removes its titles), `groupDeleteBlock(state, id): 'last-group' | null`, `countGroupTitles(state, id): number`, `resolveGroupId(groups: Group[], id: string | null): string`.
- Produces (`services.ts`): `addService(state, id, name)`, `renameService(state, id, name)`, `deleteService(state, id)`, `serviceDeleteBlock(state, id): 'in-use' | null`.
- All state functions take and return `AppState`, return the same object when the input is invalid (blank name, blocked delete, unknown id).
- `stateFixtures.ts`: `makeState(partial?: Partial<AppState>): AppState`, `makeTitle(partial: Partial<Title>): Title`.

- [ ] **Step 1: Write failing tests**

```ts
// appState.test.ts
test('default state has one group and the seven services in order', () => {
  const s = createDefaultState();
  expect(s.groups.map((g) => g.name)).toEqual(['Eu sozinha']);
  expect(s.services.map((x) => x.name)).toEqual([
    'Netflix',
    'HBO+',
    'Paramount+',
    'Amazon Prime',
    'Apple TV',
    'Disney+',
    'Cinema',
  ]);
  expect(s.titles).toEqual([]);
});
test('rejects zero groups', () =>
  expect(validateAppState({ ...createDefaultState(), groups: [] }).ok).toBe(false));
test('rejects a bad kind or watchedAt', () => {
  /* kind 'show' -> shape; watchedAt '2026-02-30' -> shape */
});
test('rejects titles with unknown service', () => {
  const s = makeState({ titles: [makeTitle({ serviceId: 'nope' })] });
  expect(validateAppState(s)).toEqual({ ok: false, reason: 'references' });
});
test('rejects titles with unknown group', () => {
  /* same with groupId -> 'references' */
});
test('parseStoredState: null -> default, not invalid; garbage -> default, invalid', () => {
  /* ... */
});

// groups.test.ts
test('cannot delete the last group', () =>
  expect(groupDeleteBlock(createDefaultState(), 'group-default')).toBe('last-group'));
test('deleteGroup removes its titles', () => {
  /* two groups, title in g2; delete g2 -> titles [] */
});
test('resolveGroupId falls back to the first group', () => {
  const groups = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ];
  expect(resolveGroupId(groups, 'b')).toBe('b');
  expect(resolveGroupId(groups, 'gone')).toBe('a');
  expect(resolveGroupId(groups, null)).toBe('a');
});
test('blank names are ignored and names are trimmed', () => {
  /* addGroup(s,'x','  ') === s; '  Nós ' -> 'Nós' */
});

// services.test.ts
test('a service used by any title (queue or watched) cannot be deleted', () => {
  /* -> 'in-use' */
});
test('an unused service can be deleted, even the last one', () => {
  /* services may be empty */
});

// dates.test.ts
test('addMonths clamps to month end', () =>
  expect(toDateKey(addMonths(new Date(2026, 4, 31), -3))).toBe('2026-02-28'));
test('formatDateKey', () => expect(formatDateKey('2026-10-24')).toBe('24 out 2026'));
```

- [ ] **Step 2:** Run `npx jest src/lib` — expected FAIL (modules missing).
- [ ] **Step 3:** Implement the four modules. Default ids are stable: `group-default`, `service-netflix`, `service-hbo`, `service-paramount`, `service-prime`, `service-appletv`, `service-disney`, `service-cinema`. Reuse the `parseList`/`isText` pattern from life-plan `appState.ts`; `isDateKey` is life-plan's `isDate`.
- [ ] **Step 4:** Run `npx jest src/lib` — expected PASS; `npm run check` (knip may flag exports used only by later tasks: export only what tests use now).
- [ ] **Step 5:** Commit `feat: add state model, groups and services rules`.

### Task 4: Titles and queue order rules

**Files:**
- Create: `src/lib/titles.ts`, `src/lib/titles.test.ts`

**Interfaces:**
- Consumes: Task 3 types, `toDateKey`.
- Produces:

  ```ts
  export type TitleDraft = { name: string; kind: TitleKind; serviceId: string };
  export function addTitle(state: AppState, id: string, groupId: string, draft: TitleDraft): AppState; // appended = end of queue
  export function updateTitle(state: AppState, id: string, draft: TitleDraft): AppState;
  export function deleteTitle(state: AppState, id: string): AppState;
  export function markWatched(state: AppState, id: string, today: Date): AppState; // sets watchedAt, keeps array position
  export function unwatchTitle(state: AppState, id: string): AppState;            // undo: clears watchedAt in place
  export function returnToQueue(state: AppState, id: string): AppState;           // clears watchedAt and moves to array end
  export function reorderQueue(state: AppState, groupId: string, orderedIds: string[]): AppState;
  export function queueFor(state: AppState, groupId: string, serviceId: string | null): Title[];
  export function watchedFor(state: AppState, groupId: string): Title[]; // watchedAt desc, ties: later array position first
  export function servicesInQueue(state: AppState, groupId: string): Service[]; // in services order
  ```
- Queue order = array order of the group's titles with `watchedAt === null`.

- [ ] **Step 1: Write failing tests**

```ts
test('addTitle appends to the end of the group queue and ignores blank names or unknown service', ...);
test('unwatchTitle keeps the queue position', () => {
  // queue [a,b,c]; markWatched(b); unwatchTitle(b) -> queueFor ids ['a','b','c']
});
test('returnToQueue puts the title at the end', () => { /* [a,b,c], watch a, returnToQueue a -> ['b','c','a'] */ });
test('reorderQueue reorders only the group queue', () => {
  // titles: a(g1) x(g2) b(g1) w(g1, watched) c(g1); reorderQueue(g1, ['c','a','b'])
  // -> queueFor(g1) ['c','a','b']; x and w untouched in their slots
});
test('reorderQueue ignores a non-matching id list', () => {
  // missing id, extra id, duplicate id, or a filtered subset -> returns the same state object
});
test('queueFor filters by service', ...);
test('watchedFor is most recent first', ...);
test('servicesInQueue lists only services with queued titles, in services order', ...);
test('markWatched stores today as YYYY-MM-DD', () => { /* new Date(2026, 9, 24) -> '2026-10-24' */ });
```

- [ ] **Step 2:** `npx jest src/lib/titles.test.ts` — FAIL.
- [ ] **Step 3:** Implement. `reorderQueue`: accept only when `orderedIds` is a permutation of `queueFor(state, groupId, null)` ids; then walk `state.titles`, and each slot holding a queued title of that group takes the next title from `orderedIds`.
- [ ] **Step 4:** `npx jest src/lib` PASS; `npm run check`.
- [ ] **Step 5:** Commit `feat: add title and queue order rules`.

### Task 5: History retention and backup

**Files:**
- Create: `src/lib/history.ts`, `src/lib/history.test.ts`, `src/lib/backup.ts`, `src/lib/backup.test.ts`

**Interfaces:**
- Produces (`history.ts`):

  ```ts
  export type HistorySettings = { keepMonths: number | null }; // null = never delete
  export const HISTORY_MONTH_OPTIONS: readonly (number | null)[]; // [1, 3, 6, 12, null]
  export const DEFAULT_HISTORY_SETTINGS: HistorySettings;          // { keepMonths: 3 }
  export function normalizeHistorySettings(raw: unknown): HistorySettings;
  export function purgeOldWatched(state: AppState, keepMonths: number | null, today: Date): AppState; // same object when nothing removed
  export function countExpiredWatched(state: AppState, keepMonths: number | null, today: Date): number;
  ```
- Produces (`backup.ts`): `Sha256`, `RestoreResult`, `createBackupText(state, exportedAt, sha256)`, `parseBackupText(text, sha256)`, `backupFileName(date)` — same signatures as life-plan.

- [ ] **Step 1: Write failing tests**

```ts
// history.test.ts — today = new Date(2026, 9, 24), keepMonths 3 -> cutoff '2026-07-24'
test('keeps the cutoff day', () => { /* watchedAt '2026-07-24' kept, '2026-07-23' removed */ });
test('never touches queued titles', ...);
test('never deletes with keepMonths null', ...);
test('countExpiredWatched counts across all groups', ...);
test('normalizeHistorySettings falls back to 3 for unknown values and accepts null', ...);

// backup.test.ts (mirror life-plan backup.test.ts with a fake sha256)
test('round trip', ...);
test('backupFileName', () => expect(backupFileName(new Date(2026, 9, 4))).toBe('couch-queue-backup-2026-10-04.cqb'));
test('errors', () => { /* invalid JSON -> 'Arquivo inválido ou corrompido.'
  wrong format -> 'Este arquivo não é um backup do Couch Queue.'
  version 2 -> 'Versão de backup não suportada.'
  hash mismatch -> 'Backup inválido: o conteúdo foi alterado ou está corrompido.'
  title with unknown group/service -> 'Backup inválido: há títulos ligados a grupos ou streamings que não existem.'
  zero groups -> 'Arquivo inválido ou corrompido.' */ });
```

- [ ] **Step 2:** `npx jest src/lib` — FAIL.
- [ ] **Step 3:** Implement; `backup.ts` is life-plan's with format `couch-queue-backup`, app name `Couch Queue`, extension `.cqb` and the messages above. Cutoff = `toDateKey(addMonths(today, -keepMonths))`; keep `watchedAt >= cutoff`.
- [ ] **Step 4:** PASS; `npm run check`.
- [ ] **Step 5:** Commit `feat: add history retention and backup`.

### Task 6: State hook, device settings and maintenance tab

**Files:**
- Create: `src/hooks/useAppState.ts`, `src/hooks/useDeviceSetting.ts`, `src/storage/deviceSettings.ts`, `src/storage/deviceSettings.test.ts` (copy life-plan), `src/services/backupFiles.ts`, `src/services/sha256.ts` (copy), `src/components/common/{ActionButton,SectionCard,IconButton,ChipRow,confirmAction}.tsx|ts` (copy), `src/components/maintenance/{GroupsSection,ServicesSection,HistorySection,DataSection}.tsx`
- Modify: `src/components/maintenance/MaintenanceScreen.tsx`, `src/CouchQueueApp.tsx`

**Interfaces:**
- Consumes: Tasks 3–5.
- Produces: `useAppState()` returning `{ state, isLoaded, loadFailed, saveError, addGroup(name), renameGroup(id,name), deleteGroup(id), getGroupDeleteBlock(id), countGroupTitles(id), addService(name), renameService(id,name), deleteService(id), getServiceDeleteBlock(id), saveTitle(id: string | null, groupId: string, draft: TitleDraft), deleteTitle(id), markWatched(id), unwatchTitle(id), returnToQueue(id), reorderQueue(groupId, ids), purgeOldWatched(keepMonths), countExpiredWatched(keepMonths), replaceState, resetState }` and `type AppStore`. Same load/save safety as life-plan (`canSave`, `latest`, `.invalid` copy).
- Produces in `CouchQueueApp`: `selectedGroupId: string` = `resolveGroupId(state.groups, selectedGroup.value)` from `useDeviceSetting<string | null>(SELECTED_GROUP_KEY, null, normalize)`, and `history` setting; passed to screens.

- [ ] **Step 1:** Copy and adapt hooks/storage/services/common components; build `useAppState` with the action list above.
- [ ] **Step 2:** In `CouchQueueApp`, purge once per start exactly like life-plan's retention effect: only after state and history setting loaded and **not** when `history.loadFailed` or `store.loadFailed`.
- [ ] **Step 3:** `GroupsSection` / `ServicesSection` follow `HousesSection` (inline rename, trash, add row `Adicionar grupo` / `Adicionar streaming`, new default names `Grupo N` / `Streaming N`). Group delete: blocked `É preciso manter ao menos um grupo.`; with titles confirm `Excluir "<nome>" e os seus <n> título(s)?`; without titles confirm `Excluir "<nome>"?`. Service delete blocked: `Mova ou exclua os títulos deste streaming antes.`
- [ ] **Step 4:** `HistorySection` like `RetentionSection`: chips `1 mês`, `3 meses`, `6 meses`, `12 meses`, `Nunca apagar`; shortening asks `Apagar <n> título(s) visto(s) há mais de <período>?` only when count > 0.
- [ ] **Step 5:** `DataSection` and backup/restore/reset handlers copied from life-plan `MaintenanceScreen`.
- [ ] **Step 6:** `npm run check`; emulator: manage groups/services, change period, backup → reset → restore round trip.
- [ ] **Step 7:** Commit `feat: add state hook and maintenance tab`.

### Task 7: Fila tab (queue, form, undo)

**Files:**
- Create: `src/components/queue/{GroupPicker,ServiceFilter,QueueList,QueueRow,TitleFormModal,UndoToast}.tsx`, `src/components/common/{ModalShell,FloatingAddButton}.tsx` (copy)
- Modify: `src/components/queue/QueueScreen.tsx`, `App.tsx`, `package.json`

**Interfaces:**
- Consumes: `AppStore`, `selectedGroupId`, `onSelectGroup(id)`, `queueFor`, `servicesInQueue`.

- [ ] **Step 1:** `npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets` and `npm install react-native-draggable-flatlist`; wrap `App.tsx` in `GestureHandlerRootView style={{ flex: 1 }}`; confirm Babel/worklets plugin per Reanimated docs for Expo 56; `npx expo install --check`. If draggable-flatlist fails on RN 0.85, pick an alternative and record it in the spec Assumptions.
- [ ] **Step 2:** `GroupPicker`: card `Grupo` / name ▾ opening a `ModalShell` list of groups.
- [ ] **Step 3:** `ServiceFilter`: chips `Todos` + `servicesInQueue`; a selected service that disappears from the list is treated as `Todos`. Filter state is local to `QueueScreen` and resets when the group changes.
- [ ] **Step 4:** `QueueList` = `DraggableFlatList` over `queueFor(...)`; `onDragEnd` → `store.reorderQueue(groupId, data.map(t => t.id))`. `QueueRow`: grip (`reorder-two-outline` or dots, shown and draggable only when filter is `Todos`, `accessibilityLabel="Arrastar para reordenar"`), position number (first uses accent), name `numberOfLines={1}`, service tag + `Série`/`Filme`, round check `accessibilityLabel="Marcar como visto"`. Tap row opens edit.
- [ ] **Step 5:** `TitleFormModal`: `Nome`, kind chips `Série`/`Filme`, service chips; save `Salvar`; edit mode adds `Excluir` with confirmation `Excluir "<nome>"?`. Empty name: `Informe o nome.`. No services: `Cadastre um streaming em Manutenção.` and saving disabled. Title `Adicionar título` / `Editar título`.
- [ ] **Step 6:** `UndoToast`: after `markWatched`, shows `"<nome>" foi para Já vistos` + `Desfazer` for 5 s (timer in `useEffect`); `Desfazer` → `store.unwatchTitle(id)`. A new mark replaces the toast.
- [ ] **Step 7:** Empty queue message `Nada na fila. Toque em + para adicionar.`; `FloatingAddButton` opens the form.
- [ ] **Step 8:** `npm run check`; emulator: add, edit, delete, drag, filter (grip hidden), mark + undo returns to same place.
- [ ] **Step 9:** Commit `feat: add queue tab with drag reorder and undo`.

### Task 8: Já vistos tab

**Files:**
- Create: `src/components/watched/WatchedRow.tsx`
- Modify: `src/components/watched/WatchedScreen.tsx`

- [ ] **Step 1:** Group picker (reuse `GroupPicker`) + `FlatList` of `watchedFor(state, selectedGroupId)`: name, service tag + kind, `Visto em <formatDateKey>`; actions `Voltar para a lista` (`store.returnToQueue`) and trash with `Excluir "<nome>"?`. Empty: `Nenhum título visto ainda.`
- [ ] **Step 2:** `npm run check`; emulator check.
- [ ] **Step 3:** Commit `feat: add watched history tab`.

### Task 9: Close the spec

**Files:**
- Modify: `README.md`, `docs/app-context.md`, `docs/quality/coverage-baseline.md`, `docs/quality/manual-test-checklist.md`, `docs/standards/code-duplication-policy.md` (baseline line)

- [ ] **Step 1:** Write the manual checklist (pt-BR, life-plan style) covering: splash/icon/launcher name, groups, services, add/edit/delete, drag reorder, filter hides grip, mark + `Desfazer`, `Voltar para a lista` goes to end, history period + confirmation, cleanup on restart, backup/restore/reset, restore of a corrupted file.
- [ ] **Step 2:** Run `npm run check` and `npm run dup`; record coverage and duplication baselines.
- [ ] **Step 3:** Update `README.md` and `docs/app-context.md` to implemented behavior.
- [ ] **Step 4:** Commit `docs: close spec 001`.

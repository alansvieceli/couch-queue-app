# Couch Queue

Personal Android app (React Native, Expo, TypeScript) that keeps an ordered watch queue of series and movies for each group of people you watch with, tagged by streaming service. Single user, offline-first: all data stays on the device.

## Current status

App shell only: Veludo theme (dark, plum and rose), app icon and splash, header with the Couch Queue wordmark, and three tabs (`Fila`, `Já vistos`, `Manutenção`) with placeholder screens. Queue, history and maintenance features are not implemented yet; they are planned in `docs/specs/001-couch-queue-app.md`:

- `Fila`: per-group queue, drag-and-drop order, filter by streaming service, mark as watched.
- `Já vistos`: watched history per group, deleted automatically after a configurable period (default 3 months).
- `Manutenção`: groups, streaming services, history period, backup, restore and reset.

## Requirements

- Node.js 24 and npm
- Android Studio with an emulator (Android only)

## Install and run

```bash
npm install
npm run android
```

`npm start` starts the Expo dev server only.

## Validation

```bash
npm run check
```

Runs Biome, TypeScript, Jest with coverage, and Knip. Related commands: `npm run lint`, `npm run format`, `npm run typecheck`, `npm test`, `npm run test:coverage`, `npm run dup`.

## Local data

All data will live on the device in one JSON document (AsyncStorage key `@couch-queue-app/state/v1`). `Manutenção` > `Dados` will export a `couch-queue-backup-AAAA-MM-DD.cqb` file (JSON with a SHA-256 integrity hash) and restore one after validating it. Not implemented yet.

## Commits

Husky is enabled by `npm install`. Commit messages must follow `type: message` (feat, fix, docs, test, build, perf, style, refactor, chore, ci, raw, cleanup, remove). Staged files are checked with Biome through lint-staged.

## Project structure

- `src/lib/` pure, tested logic
- `src/components/` UI components: `common/` (header, tab bar) and one folder per tab
- `src/theme/` colors and typography
- `src/CouchQueueApp.tsx` app shell (fonts, splash, tabs)
- `assets/` app icon, adaptive icon and splash images
- `docs/` standards, specs, plans and app context

## Workflow

Spec first, plan second, tasks third. See `AGENTS.md` and `docs/standards/`.

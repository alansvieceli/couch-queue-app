# App Context

## Purpose

Couch Queue is a personal Android app (React Native, Expo, TypeScript) for one user. It keeps, in order, the series and movies the user wants to watch, separately for each group of people they watch with (for example `Eu sozinha`, `Eu e meu marido`). Every title is tagged with its streaming service. The app only lists and orders; it does not search, rate or track episodes.

## Status

App shell only: Veludo theme, branding (popcorn bucket icon, splash, header wordmark `Couch Queue`), and the three tabs `Fila`, `Já vistos`, `Manutenção` with placeholder screens. No queue, history or data feature is implemented yet. See `docs/specs/001-couch-queue-app.md` for the planned behavior.

## Planned

- Per-group queue with manual drag-and-drop order, filter by streaming service, watched history auto-deleted after a configurable period (default 3 months).
- Manutenção: groups, streaming services, history period, backup (`.cqb`), restore, reset.

## Constraints

- Android only.
- All data is stored locally on the device (AsyncStorage key `@couch-queue-app/state/v1`). No backend, hosting, authentication or notifications.
- Single user.
- Visual identity: Veludo, dark only (plum background, rose accent, serif titles).
- UI copy in Brazilian Portuguese, following `docs/standards/ui-copy-policy.md`.
- Tooling: TypeScript strict, Biome, Knip, Jest.

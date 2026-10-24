# Testing Policy

## Default Rule

Add or update unit tests for business logic.

## Required Test Areas

Unit tests are required for:

- queue ordering (move, add to end, restore to end, filter by streaming service)
- watched and unwatched transitions
- history retention (cutoff per period, never delete)
- group and streaming service delete rules
- validation logic
- date logic
- storage adapters, including backup and restore (round trip and every restore failure), and default/reset state

## Not Required Initially

Tests are not mandatory for:

- purely visual components
- static layout
- simple style changes
- generated configuration files

## Validation

When tests exist, run them before marking a task as complete.

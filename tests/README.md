# tests/

Automated verification layer. Currently scaffolded for `tests/systemV2/` (Playwright/browser flows).

**Belongs here:** unit, integration, and end-to-end tests. Future API contract and visual regression tests.

**Never here:** manual test notes or narrative descriptions of behavior as a substitute for a runnable test ("if behavior can be tested via code, do not validate it narratively" — CLAUDE.md).

**Rule support:** CLAUDE.md "Architecture & System Layers" (Layer 4: Verification); "Test Strategy Framework" (target pyramid: ~70% unit / ~20% integration / ~10% E2E); "Definition of Done" (tests exist and pass at the minimum standard for the layer).

**Status:** NOW.

**Verification:** test suite runs; tier distribution roughly matches the target pyramid as the suite grows.

**Follow-up (not done in this pass):** a `tests/CLAUDE.md` with local conventions is expected once the first test lands (CLAUDE.md line 81).

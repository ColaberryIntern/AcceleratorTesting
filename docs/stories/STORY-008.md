# STORY-008 — Implement data integrity checks

As a system, I want to ensure data integrity, so that reports are accurate and reliable.

**Release:** r3 · Data Integrity and Audit (weeks 13–16)
**Owner:** Integrity Checker
**Blocked by:** STORY-007

## The requirement this satisfies

- **REQ-011** (Safety, must) — The system must ensure data integrity and accuracy in reports.

## How to build it

Develop integrity check routines for data storage processes.

## Failure paths you must handle

- Integrity check failure
- Data corruption
- Alert system failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given data is pulled from external systems, when it is stored, then integrity checks ensure accuracy.
- [ ] Given a data integrity issue is detected, when the report is generated, then an alert is raised.
- [ ] Trust: Ensure all integrity checks are logged for audit.

When every box above is ticked, stop and show the demo.

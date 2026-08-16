# STORY-011 — Handle Incomplete Data Gracefully

As a developer, I want the system to handle incomplete data, so that it can still generate useful reports.

**Release:** r4 · System Optimization and Error Handling (weeks 17–20)
**Owner:** Data Analyzer
**Blocked by:** STORY-010

## The requirement this satisfies

- **REQ-015** (Safety, must) — The system must handle exceptions where data is incomplete or unavailable.

## How to build it

Implement logic to handle incomplete data during report generation and notify instructors.

## Failure paths you must handle

- Incomplete data causes report failure
- Instructors are not informed of missing data
- Incomplete data is not logged

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given data is incomplete, when the system generates a report, then it handles the missing data gracefully.
- [ ] Given data is incomplete, when an instructor reviews the report, then they are informed of the missing data.
- [ ] Trust: All instances of incomplete data are logged for audit purposes.

When every box above is ticked, stop and show the demo.

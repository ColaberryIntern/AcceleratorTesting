# STORY-012 — Optimize System Performance

As a developer, I want to optimize system performance, so that it responds quickly to user actions.

**Release:** r4 · System Optimization and Error Handling (weeks 17–20)
**Owner:** System Optimizer
**Blocked by:** STORY-011

## The requirement this satisfies

- **REQ-017** (Non-functional, should) — The system must operate with a response time that does not exceed 5 seconds for any user action.

## How to build it

Optimize database queries and API calls to improve system performance.

## Failure paths you must handle

- System response time exceeds 5 seconds
- Performance optimizations fail
- Performance metrics are not logged

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given the system is under load, when a user performs an action, then the response time does not exceed 5 seconds.
- [ ] Given the system is optimized, when an instructor uses it, then they experience improved performance.
- [ ] Trust: All performance metrics are logged for audit purposes.

When every box above is ticked, stop and show the demo.

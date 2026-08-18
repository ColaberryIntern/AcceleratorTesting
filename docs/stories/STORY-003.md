# STORY-003 — Create AI workspace for selected property

As an investor, I want to create an AI workspace for a property, so that I can manage its analysis and actions.

**Release:** r1 · AI Workspace and Agents (weeks 3–4)
**Owner:** AI Workspace Creator
**Blocked by:** STORY-002

## The requirement this satisfies

- **REQ-005** (Functional, must) — The system must create an AI workspace for properties when a user selects 'Work This Deal'.

## How to build it

Design AI workspace structure and integrate with property selection.

## Failure paths you must handle

- Workspace creation failure
- Duplicate workspace
- Data sync issues

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a user selects 'Work This Deal', when confirmed, then an AI workspace is created.
- [ ] Given a workspace creation failure, when retried, then it succeeds or provides an error message.
- [ ] Trust: The system logs workspace creation events.

When every box above is ticked, stop and show the demo.

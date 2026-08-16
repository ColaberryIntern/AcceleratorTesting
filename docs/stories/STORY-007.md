# STORY-007 — Instructor Review and Approval Interface

As an instructor, I want to review and approve recommendations, so that I can ensure accuracy before sending.

**Release:** r2 · Instructor Review and Approval (weeks 9–12)
**Owner:** Instructor Interface Manager
**Blocked by:** STORY-006

## The requirement this satisfies

- **REQ-007** (Functional, must) — The system must allow instructors to review and approve the list before sending recommendations.

## How to build it

Develop an interface for instructors to review and approve recommendations before sending.

## Failure paths you must handle

- Interface fails to load
- Approval actions are not logged
- Modifications are not saved

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a report is generated, when an instructor reviews it, then they can approve or modify recommendations.
- [ ] Given an instructor approves a recommendation, when the system sends it, then it is marked as approved.
- [ ] Trust: All instructor actions are logged for audit purposes.

When every box above is ticked, stop and show the demo.

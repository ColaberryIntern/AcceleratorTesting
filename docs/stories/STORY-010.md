# STORY-010 — Flag uncertain opportunities for review

As an investor, I want uncertain opportunities flagged for review, so that I can ensure decision accuracy.

**Release:** r4 · Trust and Monetization (weeks 9–10)
**Owner:** Opportunity Review Flag
**Blocked by:** STORY-009

## The requirement this satisfies

- **REQ-015** (Safety, must) — The system must flag uncertain opportunities for human review.

## How to build it

Implement uncertainty detection logic and flagging mechanism.

## Failure paths you must handle

- Flagging logic failure
- Review process error
- Notification failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given an uncertain opportunity, when detected, then the system flags it for review.
- [ ] Given a flagging error, when detected, then it logs the issue and retries.
- [ ] Trust: The system logs all flagging actions for audit.

When every box above is ticked, stop and show the demo.

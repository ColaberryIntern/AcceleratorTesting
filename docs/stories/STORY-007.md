# STORY-007 — Negotiation Agent suggests offers

As an investor, I want the Negotiation Agent to suggest offers, so that I can negotiate effectively with property owners.

**Release:** r2 · Enhanced Agent Capabilities (weeks 5–6)
**Owner:** Negotiation Agent
**Blocked by:** STORY-005

## The requirement this satisfies

- **REQ-009** (Functional, must) — The system must include a Negotiation Agent to suggest offers and negotiation strategies.

## How to build it

Develop logic for offer suggestions based on property data.

## Failure paths you must handle

- Suggestion logic failure
- Data inconsistency
- Offer range mismatch

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property in a workspace, when analyzed, then the Negotiation Agent suggests an initial and maximum offer.
- [ ] Given a suggestion error, when detected, then it logs the issue and retries.
- [ ] Trust: The system logs all offer suggestion actions.

When every box above is ticked, stop and show the demo.

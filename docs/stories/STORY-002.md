# STORY-002 — AI Assessment and recommended action for properties

As an investor, I want an AI Assessment and recommended action for properties, so that I can decide on next steps.

**Release:** r0 · Initial Property Analysis (weeks 1–2)
**Owner:** AI Assessment Generator
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-003** (Functional, must) — The system must provide an AI Assessment for each property, detailing potential acquisition strategies.
- **REQ-004** (Functional, must) — The system must generate a recommended action for each property based on its Opportunity Score.

## How to build it

Develop AI Assessment logic and integrate with property details view.

## Failure paths you must handle

- Assessment logic failure
- Missing property data
- Recommendation mismatch

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property with a high Opportunity Score, when viewed, then it shows an AI Assessment and recommended action.
- [ ] Given a property with a low Opportunity Score, when viewed, then it shows a minimal assessment.
- [ ] Trust: The system logs the rationale for the recommended action.

When every box above is ticked, stop and show the demo.

# STORY-001 — User selects location and receives Opportunity Score

As an investor, I want to select a location and receive an Opportunity Score, so that I can identify potential properties.

**Release:** r0 · Initial Property Analysis (weeks 1–2)
**Owner:** Opportunity Scorer
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-001** (Functional, must) — The system must allow users to select a city, ZIP code, neighborhood, or investment strategy for property analysis.
- **REQ-002** (Functional, must) — The system must continuously analyze properties and assign an Opportunity Score from 0–100.

## How to build it

Implement location selection UI and integrate with property analysis backend.

## Failure paths you must handle

- Invalid location input
- No properties found
- Analysis service timeout

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a user selects a city, when the system analyzes properties, then it displays an Opportunity Score.
- [ ] Given a user selects a ZIP code, when no properties are found, then it displays a 'No opportunities' message.
- [ ] Trust: The system logs the analysis process for audit.

When every box above is ticked, stop and show the demo.

# STORY-013 — Disposition Agent suggests property strategies

As a property investor, I want a Disposition Agent to suggest strategies for properties, so that I can decide whether to wholesale, rent, or flip them.

**Release:** r1 · AI Workspace and Agents (weeks 3–4)
**Owner:** Disposition Agent
**Blocked by:** STORY-003

## The requirement this satisfies

- **REQ-011** (Functional, must) — The system must include a Disposition Agent to suggest strategies for wholesaling, renting, or flipping properties.

## How to build it

Develop the Disposition Agent to analyze property data and suggest strategies. Ensure all suggestions and rationales are logged.

## Failure paths you must handle

- Agent suggests non-viable strategy
- Agent fails to log rationale
- Agent provides incomplete analysis

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property is selected, When the Disposition Agent is activated, Then it suggests strategies for wholesaling, renting, or flipping.
- [ ] Given a property with specific market conditions, When the Disposition Agent analyzes it, Then it suggests the most viable strategy.
- [ ] Trust: The system logs the strategy suggestions and rationale for audit.

When every box above is ticked, stop and show the demo.

# STORY-004 — Research Agent gathers property data

As an investor, I want the Research Agent to gather property data, so that I have comprehensive information for decision-making.

**Release:** r1 · AI Workspace and Agents (weeks 3–4)
**Owner:** Research Agent
**Blocked by:** STORY-003

## The requirement this satisfies

- **REQ-006** (Functional, must) — The system must include a Research Agent to gather property history, comparable properties, and neighborhood trends.

## How to build it

Implement data retrieval for property history and trends.

## Failure paths you must handle

- Data source unavailable
- Incomplete data
- Incorrect data mapping

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property in a workspace, when analyzed, then the Research Agent provides property history and trends.
- [ ] Given missing data sources, when attempted, then it logs an error and continues.
- [ ] Trust: The system logs all data retrieval actions.

When every box above is ticked, stop and show the demo.

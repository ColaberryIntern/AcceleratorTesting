# STORY-012 — Due Diligence Agent creates inspection checklists

As a property analyst, I want a Due Diligence Agent to create inspection checklists, so that I can identify potential issues with properties.

**Release:** r1 · AI Workspace and Agents (weeks 3–4)
**Owner:** Due Diligence Agent
**Blocked by:** STORY-003

## The requirement this satisfies

- **REQ-010** (Functional, must) — The system must include a Due Diligence Agent to create inspection checklists and identify potential issues.

## How to build it

Implement the Due Diligence Agent to generate checklists based on property data. Ensure it logs all actions in the audit trail.

## Failure paths you must handle

- Agent fails to generate checklist
- Checklist misses critical issues
- Agent logs incorrect data

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property is selected, When the Due Diligence Agent is activated, Then it creates an inspection checklist for the property.
- [ ] Given a property with known issues, When the Due Diligence Agent reviews it, Then it identifies potential issues.
- [ ] Trust: The system logs the checklist creation and identified issues for audit.

When every box above is ticked, stop and show the demo.

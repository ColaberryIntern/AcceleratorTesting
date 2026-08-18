# STORY-006 — Outreach Agent generates communication materials

As an investor, I want the Outreach Agent to generate communication materials, so that I can contact property owners effectively.

**Release:** r2 · Enhanced Agent Capabilities (weeks 5–6)
**Owner:** Outreach Agent
**Blocked by:** STORY-005

## The requirement this satisfies

- **REQ-008** (Functional, must) — The system must include an Outreach Agent to generate communication materials for contacting property owners.

## How to build it

Implement templates for letters and emails, integrate with property data.

## Failure paths you must handle

- Template generation error
- Email service failure
- Incorrect contact details

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property in a workspace, when prompted, then the Outreach Agent generates a homeowner letter and email.
- [ ] Given a communication failure, when detected, then it logs the issue and retries.
- [ ] Trust: The system logs all communication generation actions.

When every box above is ticked, stop and show the demo.

# STORY-011 — Allow customization of report criteria

As an instructor, I want to customize report criteria, so that I can tailor reports to my needs.

**Release:** r4 · Enhancements and Analytics (weeks 17–20)
**Owner:** Analytics Provider
**Blocked by:** STORY-009

## The requirement this satisfies

- **REQ-016** (Functional, should) — The system should allow customization of report criteria by instructors.

## How to build it

Implement customization options in the report generation module.

## Failure paths you must handle

- Customization option failure
- Incorrect report customization
- Alert system failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a customization option is available, when an instructor modifies it, then the report reflects the changes.
- [ ] Given a customization error occurs, when the report is generated, then an alert is raised.
- [ ] Trust: Ensure all customizations are logged for audit.

When every box above is ticked, stop and show the demo.

# STORY-008 — Deliver Reports via Email Platform

As an instructor, I want to receive weekly reports via email, so that I can review student performance.

**Release:** r2 · Instructor Review and Approval (weeks 9–12)
**Owner:** Report Delivery System
**Blocked by:** STORY-007

## The requirement this satisfies

- **REQ-012** (Constraint, must) — The system must integrate with the Email Platform to send reports.
- **REQ-016** (Observability, must) — The system must log all actions taken for audit purposes.

## How to build it

Use the Email Platform API to send reports and log delivery actions in the audit log.

## Failure paths you must handle

- Invalid email address
- Email server downtime
- Network failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a weekly report is generated, when the report is sent, then the instructor should receive it via email.
- [ ] Given an invalid email address, when the report is sent, then an error message should be logged.
- [ ] Trust: All report deliveries must be logged for audit purposes.

When every box above is ticked, stop and show the demo.

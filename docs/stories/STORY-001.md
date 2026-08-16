# STORY-001 — Enable instructors to log in via Student Portal and access their dashboard

As an instructor, I want to log in using the Student Portal credentials, so that I can access my dashboard securely.

**Release:** r0 · Initial Setup and Data Integration (weeks 1–4)
**Owner:** Data Aggregator
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-001** (Constraint, must) — The system must read student login data from the Student Portal.
- **REQ-010** (Functional, must) — The system must allow instructors to view activity data for each student in the report.

## How to build it

Integrate with the Student Portal API to authenticate instructors and redirect them to their dashboard upon successful login.

## Failure paths you must handle

- Invalid credentials
- Network failure
- API timeout

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given an instructor with valid Student Portal credentials, when they log in, then they should access their dashboard.
- [ ] Given an instructor with invalid credentials, when they attempt to log in, then they should receive an error message.
- [ ] Trust: Every login attempt must be recorded in the audit log.

When every box above is ticked, stop and show the demo.

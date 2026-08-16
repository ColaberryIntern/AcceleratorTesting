# STORY-004 — Generate basic weekly report

As an instructor, I want to generate a basic weekly report, so that I can review student progress.

**Release:** r1 · Instructor Review and Approval (weeks 5–8)
**Owner:** Report Generator
**Blocked by:** STORY-005

## The requirement this satisfies

- **REQ-005** (Functional, must) — The system must generate a weekly report of students potentially falling behind based on login, progress, and attendance data.

## How to build it

Implement report generation using the existing data sources and ensure logging of actions in the audit trail.

## Failure paths you must handle

- Report generation fails due to missing data.
- Instructor attempts to generate a report without permissions.
- System fails to log the report generation action.

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given the instructor is logged in, when they navigate to the reports section, then they can generate a basic weekly report.
- [ ] Given the instructor is not logged in, when they attempt to access the reports section, then they are prompted to log in.
- [ ] Trust: All report generation actions are logged for audit purposes.

When every box above is ticked, stop and show the demo.

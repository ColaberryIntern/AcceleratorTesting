# STORY-009 — Enhance Report with Suggested Messages

As an instructor, I want the report to include suggested messages, so that I can communicate effectively with students.

**Release:** r3 · Enhanced Reporting and User Experience (weeks 13–16)
**Owner:** Report Generator
**Blocked by:** STORY-008

## The requirement this satisfies

- **REQ-006** (Functional, must) — The system must suggest an opening line for each student listed in the report.

## How to build it

Enhance the report generation module to include suggested messages for each student.

## Failure paths you must handle

- Message generation fails
- Inappropriate messages are not flagged
- Messages are not logged

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a student is listed in the report, when the report is generated, then it includes a suggested message.
- [ ] Given a suggested message is inappropriate, when an instructor reviews it, then they can modify it.
- [ ] Trust: All suggested messages are logged for audit purposes.

When every box above is ticked, stop and show the demo.

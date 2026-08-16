# STORY-010 — Provide analytics on student engagement trends

As an instructor, I want to see analytics on student engagement trends, so that I can better understand student behavior over time.

**Release:** r4 · Enhancements and Analytics (weeks 17–20)
**Owner:** Analytics Provider
**Blocked by:** STORY-009

## The requirement this satisfies

- **REQ-015** (Functional, should) — The system should provide analytics on student engagement trends over time.

## How to build it

Develop an analytics dashboard using data from 'student_activity', 'student_progress', and 'student_attendance' tables.

## Failure paths you must handle

- Analytics calculation error
- Dashboard loading failure
- Data visualization error

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given historical data is available, when analytics are generated, then trends are displayed accurately.
- [ ] Given a trend is incorrect, when the data is reviewed, then the error is identified.
- [ ] Trust: Ensure analytics data is accurate and up-to-date.

When every box above is ticked, stop and show the demo.

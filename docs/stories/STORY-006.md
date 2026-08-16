# STORY-006 — Flag Students for Instructor Review

As an instructor, I want the system to flag students for review, so that I can decide on recommendations.

**Release:** r1 · Advanced Data Analysis (weeks 5–8)
**Owner:** Student Flagging Assistant
**Blocked by:** STORY-005

## The requirement this satisfies

- **REQ-008** (Functional, must) — The system must flag students for instructor review if unsure about recommending them.

## How to build it

Implement a flagging mechanism for students with mixed data signals.

## Failure paths you must handle

- Flagging logic fails
- Flagged students are not logged
- Instructor cannot see flagged students

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a student has mixed signals, when the system analyzes data, then the student is flagged for review.
- [ ] Given a student is flagged for review, when the instructor checks the report, then the student appears with a review flag.
- [ ] Trust: All flagged students are logged for audit purposes.

When every box above is ticked, stop and show the demo.

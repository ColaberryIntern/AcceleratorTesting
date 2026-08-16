# STORY-005 — Enable instructor review of reports

As an instructor, I want to review the list of students before emails are sent, so that I can ensure accuracy.

**Release:** r1 · Instructor Review and Approval (weeks 5–8)
**Owner:** Review Facilitator
**Blocked by:** STORY-004

## The requirement this satisfies

- **REQ-006** (Functional, must) — The system must allow instructors to review and approve the list of students before emails are sent.

## How to build it

Create a review interface for instructors to approve or modify the student list before sending.

## Failure paths you must handle

- Review interface not loading
- Data mismatch during review
- Approval process failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a report is generated, when an instructor reviews it, then they can approve or modify the list.
- [ ] Given a student is incorrectly flagged, when the instructor reviews the report, then they can correct the error.
- [ ] Trust: Ensure all changes by instructors are logged for audit.

When every box above is ticked, stop and show the demo.

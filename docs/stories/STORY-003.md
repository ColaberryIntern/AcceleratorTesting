# STORY-003 — Track Attendance via Attendance System

As an instructor, I want to track student attendance, so that I can ensure students are attending classes.

**Release:** r0 · Initial Setup and Data Integration (weeks 1–4)
**Owner:** Data Analyzer
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-011** (Constraint, must) — The system must integrate with the Attendance Tracking System to read attendance data.
- **REQ-013** (Safety, must) — The system must ensure data accuracy and consistency across all integrations.

## How to build it

Integrate with the Attendance Tracking System to fetch and log attendance data.

## Failure paths you must handle

- Incorrect attendance data
- Network failure
- API downtime

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a student attends a class, when the instructor checks attendance, then the attendance should be marked as present.
- [ ] Given a student misses a class, when the instructor checks attendance, then the attendance should be marked as absent.
- [ ] Trust: All attendance records must be logged for audit purposes.

When every box above is ticked, stop and show the demo.

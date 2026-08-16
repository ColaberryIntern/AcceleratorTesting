# STORY-003 — Show attendance data on instructor dashboard

As an instructor, I want to see student attendance data, so that I can track their participation.

**Release:** r0 · Initial Setup and Data Integration (weeks 1–4)
**Owner:** Data Aggregator
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-003** (Constraint, must) — The system must read attendance data from the Attendance Tracking System.
- **REQ-010** (Functional, must) — The system must allow instructors to view activity data for each student in the report.

## How to build it

Integrate with the Attendance Tracking System to fetch and display attendance data on the dashboard.

## Failure paths you must handle

- Data retrieval failure
- Data format mismatch
- Unauthorized access

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given an instructor logged into the dashboard, when they view a student's attendance, then they should see the attendance records.
- [ ] Given an instructor views a student with no attendance records, when they access the profile, then they should see a 'No attendance data available' message.
- [ ] Trust: Access to attendance data must be logged for audit purposes.

When every box above is ticked, stop and show the demo.

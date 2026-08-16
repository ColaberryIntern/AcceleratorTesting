# STORY-002 — Display Student Progress from LMS

As an instructor, I want to view student progress from the LMS, so that I can monitor their learning journey.

**Release:** r0 · Initial Setup and Data Integration (weeks 1–4)
**Owner:** Data Analyzer
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-010** (Constraint, must) — The system must integrate with the Learning Management System to read build progress data.
- **REQ-013** (Safety, must) — The system must ensure data accuracy and consistency across all integrations.

## How to build it

Integrate with the LMS API to fetch and display student progress data, ensuring data consistency.

## Failure paths you must handle

- Data mismatch
- Network failure
- API downtime

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a student enrolled in a course, when the instructor views the progress, then the correct data should be displayed.
- [ ] Given a student not enrolled in any course, when the instructor views the progress, then a 'no data available' message should be shown.
- [ ] Trust: All data retrieval actions must be logged for audit purposes.

When every box above is ticked, stop and show the demo.

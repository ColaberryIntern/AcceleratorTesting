# STORY-002 — Display student progress data on instructor dashboard

As an instructor, I want to view student progress data on my dashboard, so that I can monitor their performance.

**Release:** r0 · Initial Setup and Data Integration (weeks 1–4)
**Owner:** Data Aggregator
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-002** (Constraint, must) — The system must read student progress data from the Learning Management System.
- **REQ-010** (Functional, must) — The system must allow instructors to view activity data for each student in the report.

## How to build it

Fetch progress data from the LMS and display it on the instructor's dashboard.

## Failure paths you must handle

- Data retrieval failure
- Data format mismatch
- Unauthorized access

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given an instructor logged into the dashboard, when they view a student's profile, then they should see the progress data.
- [ ] Given an instructor views a student with no progress data, when they access the profile, then they should see a 'No data available' message.
- [ ] Trust: Access to student progress data must be logged for audit purposes.

When every box above is ticked, stop and show the demo.

# STORY-005 — Analyze Combined Data Signals

As an instructor, I want the system to analyze combined data signals, so that I can identify students who are truly struggling.

**Release:** r1 · Advanced Data Analysis (weeks 5–8)
**Owner:** Data Analyzer
**Blocked by:** STORY-004

## The requirement this satisfies

- **REQ-001** (Functional, must) — The system must analyze student portal login activity to identify inactivity.
- **REQ-002** (Functional, must) — The system must analyze student build progress to identify lack of progress.
- **REQ-003** (Functional, must) — The system must analyze attendance records to identify missed live sessions.

## How to build it

Implement data analysis logic that combines login, build, and attendance data to identify struggling students.

## Failure paths you must handle

- Data analysis logic fails
- Incorrect data interpretation
- Analysis results are not logged

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a student has not logged in and missed sessions, when the system analyzes data, then the student is flagged as struggling.
- [ ] Given a student has logged in but not updated their build, when the system analyzes data, then the student is flagged as struggling.
- [ ] Trust: All analysis results are logged for audit purposes.

When every box above is ticked, stop and show the demo.

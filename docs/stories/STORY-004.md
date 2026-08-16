# STORY-004 — Generate Basic Weekly Report

As an instructor, I want to receive a basic weekly report, so that I can see which students are inactive.

**Release:** r0 · Initial Setup and Data Integration (weeks 1–4)
**Owner:** Report Generator
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-004** (Functional, must) — The system must generate a weekly report every Monday morning for each instructor.

## How to build it

Create a report generation module that compiles data from all sources into a weekly report.

## Failure paths you must handle

- Data is incomplete
- Report generation fails
- Email delivery fails

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given the system has collected data, when it is Monday morning, then a basic report is generated.
- [ ] Given a student is identified as inactive, when the report is generated, then the student appears on the report.
- [ ] Trust: All report generations are logged for audit purposes.

When every box above is ticked, stop and show the demo.

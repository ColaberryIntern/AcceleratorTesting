# STORY-014 — Generate Weekly Report with Student Attention List

As an instructor, I want to receive a weekly report highlighting students who need attention, so that I can provide timely support.

**Release:** r1 · Advanced Data Analysis (weeks 5–8)
**Owner:** Report Generator
**Blocked by:** STORY-004

## The requirement this satisfies

- **REQ-005** (Functional, must) — The system must include a list of three or four students in the weekly report who may need attention.

## How to build it

Analyze student performance data to identify students needing attention and include them in the weekly report.

## Failure paths you must handle

- Data inconsistency
- Report generation failure
- Incorrect student list

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given student performance data, when the weekly report is generated, then it should include a list of students needing attention.
- [ ] Given no students need attention, when the weekly report is generated, then the list should be empty.
- [ ] Trust: The generation of the report must be logged for audit purposes.

When every box above is ticked, stop and show the demo.

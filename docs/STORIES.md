# Student Engagement Monitoring Tool — Stories

14 stories across 5 releases, walking-skeleton first:
the earliest release proves the thinnest end-to-end path including the trust
spine, and later releases stack features on top of something already working.

## Before the releases — start here

- **[STORY-000](stories/STORY-000.md)** — Build your Command Center

The first thing you build, on day one, before any part of the system itself. It is
the page you keep open for the rest of the programme and demo from. It belongs to no
release and fulfils none of your requirements, because it is the window onto your
system rather than a part of it.

## r0 · Initial Setup and Data Integration — weeks 1–4

**Goal:** Establish data integration and basic reporting functionality.
**Done when you can show:** Show a basic report generated from integrated data sources with audit logging.

- **[STORY-001](stories/STORY-001.md)** — User Login via Student Portal
- **[STORY-002](stories/STORY-002.md)** — Display Student Progress from LMS
- **[STORY-003](stories/STORY-003.md)** — Track Attendance via Attendance System
- **[STORY-004](stories/STORY-004.md)** — Generate Basic Weekly Report

## r1 · Advanced Data Analysis — weeks 5–8

**Goal:** Implement advanced data analysis to identify struggling students.
**Done when you can show:** Demonstrate identification of students based on combined data signals.

- **[STORY-005](stories/STORY-005.md)** — Analyze Combined Data Signals _(waits on STORY-004)_
- **[STORY-006](stories/STORY-006.md)** — Flag Students for Instructor Review _(waits on STORY-005)_
- **[STORY-014](stories/STORY-014.md)** — Generate Weekly Report with Student Attention List _(waits on STORY-004)_

## r2 · Instructor Review and Approval — weeks 9–12

**Goal:** Enable instructor review and approval of recommendations.
**Done when you can show:** Show instructors reviewing and approving recommendations before sending.

- **[STORY-007](stories/STORY-007.md)** — Instructor Review and Approval Interface _(waits on STORY-006)_
- **[STORY-008](stories/STORY-008.md)** — Deliver Reports via Email Platform _(waits on STORY-007)_

## r3 · Enhanced Reporting and User Experience — weeks 13–16

**Goal:** Improve report content and user interface for instructors.
**Done when you can show:** Present enhanced reports with suggested messages and improved UI.

- **[STORY-009](stories/STORY-009.md)** — Enhance Report with Suggested Messages _(waits on STORY-008)_
- **[STORY-010](stories/STORY-010.md)** — Improve User Interface for Report Review _(waits on STORY-009)_

## r4 · System Optimization and Error Handling — weeks 17–20

**Goal:** Optimize system performance and handle data exceptions.
**Done when you can show:** Demonstrate system handling incomplete data and providing error messages.

- **[STORY-011](stories/STORY-011.md)** — Handle Incomplete Data Gracefully _(waits on STORY-010)_
- **[STORY-012](stories/STORY-012.md)** — Optimize System Performance _(waits on STORY-011)_
- **[STORY-013](stories/STORY-013.md)** — Provide Clear Error Messages _(waits on STORY-012)_

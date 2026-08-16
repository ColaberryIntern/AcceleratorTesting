# Student Engagement Monitoring Tool — Stories

12 stories across 5 releases, walking-skeleton first:
the earliest release proves the thinnest end-to-end path including the trust
spine, and later releases stack features on top of something already working.

## Before the releases — start here

- **[STORY-000](stories/STORY-000.md)** — Build your Command Center

The first thing you build, on day one, before any part of the system itself. It is
the page you keep open for the rest of the programme and demo from. It belongs to no
release and fulfils none of your requirements, because it is the window onto your
system rather than a part of it.

## r0 · Initial Setup and Data Integration — weeks 1–4

**Goal:** Establish data connections and basic reporting.
**Done when you can show:** Show data being pulled from all systems and a basic report generated.

- **[STORY-001](stories/STORY-001.md)** — Enable instructors to log in via Student Portal and access their dashboard
- **[STORY-002](stories/STORY-002.md)** — Display student progress data on instructor dashboard
- **[STORY-003](stories/STORY-003.md)** — Show attendance data on instructor dashboard
- **[STORY-012](stories/STORY-012.md)** — Establish audit trail for all instructor actions

## r1 · Instructor Review and Approval — weeks 5–8

**Goal:** Enable instructors to review and approve reports.
**Done when you can show:** Demonstrate instructors reviewing and approving student lists before emails are sent.

- **[STORY-004](stories/STORY-004.md)** — Generate basic weekly report _(waits on STORY-005)_
- **[STORY-005](stories/STORY-005.md)** — Enable instructor review of reports _(waits on STORY-004)_
- **[STORY-006](stories/STORY-006.md)** — Flag uncertain recommendations for review _(waits on STORY-004)_

## r2 · Notification and Communication — weeks 9–12

**Goal:** Automate email notifications with suggested messages.
**Done when you can show:** Show emails being sent with suggested messages after instructor approval.

- **[STORY-007](stories/STORY-007.md)** — Send emails with suggested messages _(waits on STORY-005)_

## r3 · Data Integrity and Audit — weeks 13–16

**Goal:** Implement data integrity checks and audit logging.
**Done when you can show:** Demonstrate data integrity checks and audit logs of instructor actions.

- **[STORY-008](stories/STORY-008.md)** — Implement data integrity checks _(waits on STORY-007)_
- **[STORY-009](stories/STORY-009.md)** — Log instructor actions for audit _(waits on STORY-008)_

## r4 · Enhancements and Analytics — weeks 17–20

**Goal:** Add analytics and customization features.
**Done when you can show:** Show analytics dashboard and customization options for report criteria.

- **[STORY-010](stories/STORY-010.md)** — Provide analytics on student engagement trends _(waits on STORY-009)_
- **[STORY-011](stories/STORY-011.md)** — Allow customization of report criteria _(waits on STORY-009)_

# Student Engagement Monitoring Tool — Requirements

A tool to identify and notify instructors about students who may be falling behind, using data from various educational systems.

This is the source of truth for what you are building. Your Claude Code prompts
point here. If you sharpen a requirement, edit it — your version is the real one.

| Kind | Meaning |
|---|---|
| Functional | something the system does |
| Safety | a guardrail, with a check that enforces it |
| Reliability | how it behaves when something fails |
| Constraint | a technology or vendor you must use — context, not a task |

## Accessibility

### REQ-018 — Non-functional · should

The system should provide mobile access to reports.

_Not yet fulfilled by any story._

## Analytics

### REQ-015 — Functional · should

The system should provide analytics on student engagement trends over time.

Fulfilled by: STORY-010

## Audit

### REQ-012 — Observability · must

The system must log all actions taken by instructors for audit purposes.

Fulfilled by: STORY-009, STORY-012

## Communication

### REQ-007 — Functional · must

The system must provide suggested opening lines for each student in the report.

Fulfilled by: STORY-007

### REQ-014 — Non-functional · should

The system should optimize email content for engagement.

_Not yet fulfilled by any story._

## Customization

### REQ-016 — Functional · should

The system should allow customization of report criteria by instructors.

Fulfilled by: STORY-011

## Data Integration

### REQ-001 — Constraint

The system must read student login data from the Student Portal.

Fulfilled by: STORY-001

### REQ-002 — Constraint

The system must read student progress data from the Learning Management System.

Fulfilled by: STORY-002

### REQ-003 — Constraint

The system must read attendance data from the Attendance Tracking System.

Fulfilled by: STORY-003

## Data Integrity

### REQ-011 — Safety · must

The system must ensure data integrity and accuracy in reports.

Fulfilled by: STORY-008

## Data Presentation

### REQ-010 — Functional · must

The system must allow instructors to view activity data for each student in the report.

Fulfilled by: STORY-001, STORY-002, STORY-003

## Instructor Review

### REQ-006 — Functional · must

The system must allow instructors to review and approve the list of students before emails are sent.

Fulfilled by: STORY-005

### REQ-008 — Functional · must

The system must flag students for instructor review if the recommendation is uncertain.

Fulfilled by: STORY-006

## Localization

### REQ-017 — Non-functional · should

The system should support multiple languages for email content.

_Not yet fulfilled by any story._

## Notification

### REQ-004 — Constraint

The system must send emails via the Email Platform.

Context for the stories that use it — constraints do not get their own story.

### REQ-009 — Functional · must

The system must send the final approved list to instructors every Monday morning.

Fulfilled by: STORY-007

## Reporting

### REQ-005 — Functional · must

The system must generate a weekly report of students potentially falling behind based on login, progress, and attendance data.

Fulfilled by: STORY-004

## User Interface

### REQ-013 — Non-functional · should

Every instructor-facing screen must allow completion of its primary action in three clicks or fewer.

_Not yet fulfilled by any story._

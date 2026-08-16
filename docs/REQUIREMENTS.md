# Student Engagement Monitoring Tool — Requirements

A tool to help instructors identify students who are falling behind by analyzing portal activity, build progress, and attendance, and providing a weekly report with recommendations.

This is the source of truth for what you are building. Your Claude Code prompts
point here. If you sharpen a requirement, edit it — your version is the real one.

| Kind | Meaning |
|---|---|
| Functional | something the system does |
| Safety | a guardrail, with a check that enforces it |
| Reliability | how it behaves when something fails |
| Constraint | a technology or vendor you must use — context, not a task |

## Audit

### REQ-016 — Observability · must

The system must log all actions taken for audit purposes.

Fulfilled by: STORY-008

## Data Analysis

### REQ-001 — Functional · must

The system must analyze student portal login activity to identify inactivity.

Fulfilled by: STORY-005

### REQ-002 — Functional · must

The system must analyze student build progress to identify lack of progress.

Fulfilled by: STORY-005

### REQ-003 — Functional · must

The system must analyze attendance records to identify missed live sessions.

Fulfilled by: STORY-005

## Data Integrity

### REQ-013 — Safety · must

The system must ensure data accuracy and consistency across all integrations.

Fulfilled by: STORY-001, STORY-002, STORY-003

## Error Handling

### REQ-015 — Safety · must

The system must handle exceptions where data is incomplete or unavailable.

Fulfilled by: STORY-011

## Instructor Interface

### REQ-014 — Non-functional · should

Every instructor interface must allow review of recommendations in three clicks or fewer.

Fulfilled by: STORY-010

## Instructor Review

### REQ-007 — Functional · must

The system must allow instructors to review and approve the list before sending recommendations.

Fulfilled by: STORY-007

### REQ-008 — Functional · must

The system must flag students for instructor review if unsure about recommending them.

Fulfilled by: STORY-006

## Integration

### REQ-009 — Constraint

The system must integrate with the Student Portal to read login data.

Fulfilled by: STORY-001

### REQ-010 — Constraint

The system must integrate with the Learning Management System to read build progress data.

Fulfilled by: STORY-002

### REQ-011 — Constraint

The system must integrate with the Attendance Tracking System to read attendance data.

Fulfilled by: STORY-003

### REQ-012 — Constraint

The system must integrate with the Email Platform to send reports.

Fulfilled by: STORY-008

## Performance

### REQ-017 — Non-functional · should

The system must operate with a response time that does not exceed 5 seconds for any user action.

Fulfilled by: STORY-012

## Reporting

### REQ-004 — Functional · must

The system must generate a weekly report every Monday morning for each instructor.

Fulfilled by: STORY-004

### REQ-005 — Functional · must

The system must include a list of three or four students in the weekly report who may need attention.

Fulfilled by: STORY-014

### REQ-006 — Functional · must

The system must suggest an opening line for each student listed in the report.

Fulfilled by: STORY-009

## User Experience

### REQ-018 — Non-functional · should

The system must provide clear error messages to users when issues occur.

Fulfilled by: STORY-013

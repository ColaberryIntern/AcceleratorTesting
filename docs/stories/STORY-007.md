# STORY-007 — Send emails with suggested messages

As a system, I want to send emails with suggested opening lines, so that instructors can easily communicate with students.

**Release:** r2 · Notification and Communication (weeks 9–12)
**Owner:** Email Notifier
**Blocked by:** STORY-005

## The requirement this satisfies

- **REQ-007** (Functional, must) — The system must provide suggested opening lines for each student in the report.
- **REQ-009** (Functional, must) — The system must send the final approved list to instructors every Monday morning.

## How to build it

Integrate with the Email Platform to send emails. Use the 'email_content' table for storing suggested messages.

## Failure paths you must handle

- Email platform integration failure
- Incorrect email content
- Email delivery failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given the instructor approves the list, when emails are sent, then each email includes a suggested opening line.
- [ ] Given an email fails to send, when the system retries, then the email is successfully sent.
- [ ] Trust: Ensure all sent emails are logged for audit.

When every box above is ticked, stop and show the demo.

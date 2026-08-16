# STORY-009 — Log instructor actions for audit

As a system, I want to log all instructor actions, so that there is an audit trail of changes and approvals.

**Release:** r3 · Data Integrity and Audit (weeks 13–16)
**Owner:** Integrity Checker
**Blocked by:** STORY-008

## The requirement this satisfies

- **REQ-012** (Observability, must) — The system must log all actions taken by instructors for audit purposes.

## How to build it

Implement logging for all instructor actions in the 'audit_log' table.

## Failure paths you must handle

- Logging failure
- Log data corruption
- Unauthorized log access

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given an instructor approves a report, when the action is logged, then it is stored in the audit log.
- [ ] Given an instructor modifies a report, when the action is logged, then it is stored in the audit log.
- [ ] Trust: Ensure all logs are secure and tamper-proof.

When every box above is ticked, stop and show the demo.

# STORY-006 — Flag uncertain recommendations for review

As a system, I want to flag uncertain student recommendations for instructor review, so that instructors can make the final decision.

**Release:** r1 · Instructor Review and Approval (weeks 5–8)
**Owner:** Review Facilitator
**Blocked by:** STORY-004

## The requirement this satisfies

- **REQ-008** (Functional, must) — The system must flag students for instructor review if the recommendation is uncertain.

## How to build it

Implement a flagging mechanism for uncertain recommendations in the report generation module.

## Failure paths you must handle

- Flagging mechanism failure
- Incorrect flagging
- Review process failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a student recommendation is uncertain, when the report is generated, then the student is flagged for review.
- [ ] Given a flagged student is reviewed, when the instructor approves, then the student is included in the final list.
- [ ] Trust: Ensure all flagged recommendations are logged for audit.

When every box above is ticked, stop and show the demo.

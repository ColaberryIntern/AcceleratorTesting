# STORY-011 — User purchases detailed Opportunity Report

As an investor, I want to purchase detailed Opportunity Reports, so that I can access in-depth property analysis.

**Release:** r4 · Trust and Monetization (weeks 9–10)
**Owner:** Opportunity Report Seller
**Blocked by:** STORY-010

## The requirement this satisfies

- **REQ-018** (Functional, should) — The system must allow users to purchase detailed Opportunity Reports for individual properties.

## How to build it

Develop purchase flow and integrate with payment gateway.

## Failure paths you must handle

- Payment processing error
- Report generation failure
- User authentication error

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a user selects a property, when purchasing a report, then the system provides the detailed report.
- [ ] Given a purchase failure, when detected, then it logs the issue and retries.
- [ ] Trust: The system logs all purchase transactions for audit.

When every box above is ticked, stop and show the demo.

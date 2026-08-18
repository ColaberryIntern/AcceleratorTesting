# STORY-005 — Deal Analyst calculates property returns

As an investor, I want the Deal Analyst to calculate property returns, so that I can evaluate investment potential.

**Release:** r1 · AI Workspace and Agents (weeks 3–4)
**Owner:** Deal Analyst
**Blocked by:** STORY-003

## The requirement this satisfies

- **REQ-007** (Functional, must) — The system must include a Deal Analyst to calculate ARV, rehab assumptions, and potential returns.

## How to build it

Develop calculation logic for ARV and investment returns.

## Failure paths you must handle

- Calculation error
- Data inconsistency
- ARV estimation failure

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property in a workspace, when analyzed, then the Deal Analyst provides ARV and potential returns.
- [ ] Given calculation errors, when detected, then it logs the issue and retries.
- [ ] Trust: The system logs all calculation processes.

When every box above is ticked, stop and show the demo.

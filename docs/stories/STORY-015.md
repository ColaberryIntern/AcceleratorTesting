# STORY-015 — Provide rationale for property recommendations

As a property investor, I want the system to provide a clear rationale for property recommendations, so that I can trust the decision-making process.

**Release:** r2 · Enhanced Agent Capabilities (weeks 5–6)
**Owner:** Explanation Provider
**Blocked by:** STORY-007

## The requirement this satisfies

- **REQ-016** (Safety, must) — The system must provide a clear rationale for decisions made in property recommendations.

## How to build it

Update the Recommendation Engine to include detailed rationales for each recommendation. Ensure all rationales are logged for audit.

## Failure paths you must handle

- Rationale is unclear
- Rationale omits key factors
- System fails to log rationale

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property recommendation is made, When the user requests details, Then the system provides a clear rationale.
- [ ] Given a recommendation with multiple factors, When the user reviews it, Then the rationale includes all relevant factors.
- [ ] Trust: The system logs the rationale and decision-making process for audit.

When every box above is ticked, stop and show the demo.

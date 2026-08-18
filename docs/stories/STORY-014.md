# STORY-014 — Provide 'Why Now?' explanation for properties

As a property analyst, I want the system to provide a 'Why Now?' explanation for each property, so that I can understand its current opportunity status.

**Release:** r2 · Enhanced Agent Capabilities (weeks 5–6)
**Owner:** Explanation Provider
**Blocked by:** STORY-007

## The requirement this satisfies

- **REQ-012** (Functional, must) — The system must provide a 'Why Now?' explanation for each property to justify its current opportunity status.

## How to build it

Enhance the Opportunity Analysis Module to generate 'Why Now?' explanations based on current market data. Ensure explanations are logged.

## Failure paths you must handle

- Explanation is outdated
- Explanation lacks supporting data
- System fails to log explanation

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a property is selected, When the analysis is complete, Then the system provides a 'Why Now?' explanation.
- [ ] Given a property with fluctuating market conditions, When the analysis is conducted, Then the explanation reflects current conditions.
- [ ] Trust: The system logs the 'Why Now?' explanation and supporting data for audit.

When every box above is ticked, stop and show the demo.

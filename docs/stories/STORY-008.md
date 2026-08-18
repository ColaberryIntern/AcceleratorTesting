# STORY-008 — Opportunity Feed displays top opportunities

As an investor, I want to view the 'Top 20 Opportunities This Week', so that I can quickly identify potential investments.

**Release:** r3 · Opportunity Feed and Image Recognition (weeks 7–8)
**Owner:** Opportunity Feed Manager
**Blocked by:** STORY-007

## The requirement this satisfies

- **REQ-013** (Functional, must) — The system must allow users to view a 'Top 20 Opportunities This Week' list based on their input criteria.

## How to build it

Implement opportunity feed UI and integrate with scoring logic.

## Failure paths you must handle

- Feed generation error
- Criteria mismatch
- UI rendering issue

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given user criteria, when processed, then the system displays the top 20 opportunities.
- [ ] Given no matching opportunities, when processed, then it displays a 'No opportunities' message.
- [ ] Trust: The system logs the criteria and results for audit.

When every box above is ticked, stop and show the demo.

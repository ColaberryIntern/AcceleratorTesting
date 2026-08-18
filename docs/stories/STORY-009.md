# STORY-009 — Image recognition identifies properties from photos

As an investor, I want to identify properties from photos, so that I can assess opportunities on-the-go.

**Release:** r3 · Opportunity Feed and Image Recognition (weeks 7–8)
**Owner:** Image Recognition Processor
**Blocked by:** STORY-008

## The requirement this satisfies

- **REQ-014** (Functional, must) — The system must support image recognition to identify properties from user-uploaded photos.

## How to build it

Integrate image recognition API and connect to property database.

## Failure paths you must handle

- Image recognition failure
- Incorrect property match
- Photo upload error

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a user-uploaded photo, when processed, then the system identifies the property and displays details.
- [ ] Given an unrecognized photo, when processed, then it displays an error message.
- [ ] Trust: The system logs all image recognition attempts.

When every box above is ticked, stop and show the demo.

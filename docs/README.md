# docs/

In-repo documentation that ships with the codebase.

**Belongs here:** architecture notes (`ARCHITECTURE.md`), integration guides, system docs, per-session change reports (`sessions/SESSION_<SessionID>.html`), production screenshot walkthroughs (`screenshots/<YYYY-MM-DD>-deploy/`).

**Never here:** secrets or credentials visible in screenshots; product source code.

**Rule support:** CLAUDE.md "Folder Responsibilities" (`/docs`); "Per-session change report (HTML)" (hard-cadence gate, one HTML report per Session ID); "Screenshot Capture + Review HTML" (`screenshot-review` skill).

**Status:** NOW — the per-session HTML changelog gate applies starting with the first completed change.

**Verification:** `docs/sessions/SESSION_<SessionID>.html` exists for each session with shipped changes (see known gap noted in this session's PROGRESS.md entry: the generator script `scripts/generateSessionChangelog.js` does not exist yet).

**Follow-up (not done in this pass):** build `scripts/generateSessionChangelog.js` — out of scope for a foundation-only pass since it is tooling, not approved structure.

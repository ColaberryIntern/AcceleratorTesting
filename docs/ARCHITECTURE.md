# Architecture Foundation — as built

- **Session:** CC-20260730-b2c5
- **Date:** 2026-07-30
- **Scope of this pass:** foundation structure only. No product features built, no dependencies installed.

This document is the as-built record of the approved folder architecture. The original proposal and its approval are in the session transcript; this file is the durable, in-repo copy.

---

## 1. Folder tree (as created)

```
Colaberry Project/
├── CLAUDE.md                  (renamed from "CLAUDE (6).md")
├── PROGRESS.md
├── .claudeignore
├── backend/
│   ├── README.md
│   └── src/
│       ├── services/
│       │   └── agents/
│       ├── intelligence/
│       ├── scripts/
│       ├── seeds/
│       ├── routes/
│       ├── models/
│       ├── config/
│       └── middleware/
├── frontend/
│   ├── README.md
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── routes/
│       ├── services/
│       ├── contexts/
│       └── styles/
├── directives/
│   └── README.md
├── tests/
│   ├── README.md
│   └── systemV2/
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md        (this file)
│   ├── screenshots/
│   └── sessions/
└── tmp/
    └── README.md
```

Not created in this pass (see §3 for why): `.claude/`, `scripts/`, `nginx/`, `preview-db-init/`, `execution/`, `intelligence/` (top-level), `system/`.

---

## 2. Traceability table

| Folder | Status | Rule support (CLAUDE.md) | Verification |
|---|---|---|---|
| `backend/` | NOW — created | "Folder Responsibilities" §; "Contract Enforcement Layer" | `tsc --noEmit` passes once code lands; subfolder list matches |
| `frontend/` | NOW — created | "Folder Responsibilities" § | `tsc --noEmit` passes once code lands; no direct DB access |
| `directives/` | NOW — created | Layer 1 (Directives); "Directive validation" | Required sections present; referenced files exist |
| `tests/` | NOW — created | Layer 4 (Verification); "Test Strategy Framework" | Suite runs; pyramid ratio tracked as it grows |
| `docs/` | NOW — created | "Per-session change report (HTML)"; "Screenshot Capture" | `docs/sessions/SESSION_<id>.html` per session (gap noted below) |
| `tmp/` | NOW — created | "Escalation Protocol"; "Per-change autonomy log" | Never appears in a commit once git exists |
| `scripts/` | LATER — not created | "Folder Responsibilities" (root scripts) | Create on first single-responsibility script need |
| `.claude/` | LATER — not created | "Claude Code Configuration Ownership" §8–10 | Create when first project-specific hook/skill is needed |
| `nginx/` | LATER — not created | "Folder Responsibilities" (`/nginx`) | Create at first deploy |
| `preview-db-init/` | LATER — not created | "Folder Responsibilities" (`/preview-db-init`) | Create when a preview Docker stack exists |
| `intelligence/` (top-level) | LATER — not created, ambiguous | "Folder Responsibilities": "Check before adding here vs `backend/src/intelligence/`" | Requires DRI confirmation before creation |
| `execution/` | LEGACY — not created | "Folder Responsibilities": pre-Node Python reference | N/A — no legacy code exists yet to house |
| `system/` | GENERATED / DO-NOT-TOUCH — not created | "Folder Responsibilities": "DO NOT manually edit" | Portal creates this, not Claude |

---

## 3. Deviations from a literal reading of the proposal

- **`execution/` was not created.** It exists in CLAUDE.md as a home for *pre-existing* legacy Python scripts. There is no legacy code in this project yet, so creating an empty folder for it would be scaffolding for a hypothetical that doesn't exist. Create it only when actual legacy code needs a home.
- **`system/` was not created**, per explicit instruction to leave protected/generated locations untouched. It is portal-owned and auto-generated; Claude Code should never be the one to create or populate it.
- **The per-session HTML changelog gate (CLAUDE.md line ~518) cannot be fully satisfied yet.** It calls for `node scripts/generateSessionChangelog.js <SessionID>`, but `scripts/` is LATER-status and that generator doesn't exist. Building it now would mean writing new tooling beyond the approved folder structure, which was explicitly out of scope for this pass ("do not build product features"). This session's change record lives in `PROGRESS.md` and this document instead. **Flagging this as a real gap**, not a silent skip — the first time `scripts/` is created, `generateSessionChangelog.js` should be an early addition so this gate can start functioning.
- **Version control does not exist yet.** Several CLAUDE.md rules assume git (commit-tagged PROGRESS.md entries, session audits, "commit only the files you changed"). `git init` was not run, since it wasn't part of the approved folder structure and is a decision with its own blast radius (initial commit contents, `.gitignore` policy, remote). Recommend doing this deliberately as its own step before the first real commit-gated session.

## 4. Open item carried forward

The home for the first Week 3 component is still unresolved (no requirements/roadmap were provided identifying what it is). See the conditional routing table from the approved proposal — `backend/src/services/`, `frontend/src/pages/`, `backend/src/scripts/`, `backend/src/services/agents/`, or `directives/`, depending on what the component turns out to be.

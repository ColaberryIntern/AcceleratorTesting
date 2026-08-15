# backend/

Node.js + Express + TypeScript backend. Execution layer per `CLAUDE.md` → Architecture & System Layers.

**Belongs here:** business logic (`src/services/`), agent orchestration (`src/services/agents/`), planning/prompt/decision logic (`src/intelligence/`), one-off operational scripts (`src/scripts/`), seed/migration data (`src/seeds/`), Express routes (`src/routes/`), Sequelize models (`src/models/`), infra wiring (`src/config/`, `src/middleware/`).

**Never here:** frontend components, raw SQL without a typed model at the call site, hardcoded secrets/hostnames, business logic inside `src/scripts/` (scripts are disposable callers, not owners, of logic).

**Rule support:** CLAUDE.md "Folder Responsibilities" (backend subfolder list); "Contract Enforcement Layer" (TypeScript mandatory, `tsc --noEmit` must pass, Zod validation at route boundaries).

**Status:** NOW.

**Verification:** `tsc --noEmit` passes; subfolders match the list above; no service imports directly from `routes/` (layering violation).

**Follow-up (not done in this pass):** a `backend/CLAUDE.md` with local conventions is expected once real code lands here (CLAUDE.md line 81).

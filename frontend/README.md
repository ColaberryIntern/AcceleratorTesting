# frontend/

React + CRA + TypeScript frontend. Execution layer per `CLAUDE.md` → Architecture & System Layers.

**Belongs here:** top-level pages (`src/pages/`), reusable UI (`src/components/`), route trees (`src/routes/`), API clients (`src/services/`), cross-cutting concerns (`src/contexts/`, `src/styles/`).

**Never here:** business logic, direct database access, secrets/API keys in source.

**Rule support:** CLAUDE.md "Folder Responsibilities" (frontend subfolder list); UI/UX Design section (design system lives in skills, not duplicated here — see `/baseline-ui`, `/frontend-design`).

**Status:** NOW (created as part of the foundation pass — confirm with the DRI whether the first real component is frontend-facing before building into this tree).

**Verification:** `tsc --noEmit` passes; no `services/` module makes a direct DB call.

**Follow-up (not done in this pass):** a `frontend/CLAUDE.md` with local conventions is expected once real code lands here (CLAUDE.md line 81).

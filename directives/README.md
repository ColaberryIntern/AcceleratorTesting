# directives/

SOPs and runbooks. Human-readable, living documents.

**Belongs here:** step-by-step markdown docs that define goals, inputs, outputs, edge cases, safety constraints, and verification expectations for a piece of work.

**Never here:** business logic, executable code, anything that only a machine reads.

**Rule support:** CLAUDE.md "Architecture & System Layers" (Layer 1: Directives); "No business logic in directives" (Folder Responsibilities); "Directive validation" (Testing & Validation Rules — required sections, referenced files must exist, markdown integrity, clarity for junior developers).

**Status:** NOW.

**Verification:** each directive has the required sections and every file/script it references actually exists.

**Follow-up (not done in this pass):** a `directives/CLAUDE.md` with local conventions is expected once the first directive lands (CLAUDE.md line 81).

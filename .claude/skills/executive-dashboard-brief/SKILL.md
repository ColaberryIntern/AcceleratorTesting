---
name: executive-dashboard-brief
description: Use when the user asks to turn a data-quality result, failed refresh, pipeline incident, KPI variance, or technical investigation into an executive dashboard update. Produces a concise leadership brief containing status, business impact, verified evidence, decision needed, owner, and next update time.
---

# Executive Dashboard Brief

## Purpose

Translate a technical finding (data-quality gate result, ETL/pipeline triage, KPI variance investigation) into a short, non-technical brief that leadership can act on. This skill does not investigate — it summarizes and reframes an investigation that has already been done.

## When to use

- The user has a data-quality report, triage report, incident summary, or KPI variance finding and wants it turned into an executive/leadership update.
- The user asks to "write this up for leadership," "make this an exec brief," "summarize this for the dashboard/status page," or similar.

## When NOT to use

- No source report or investigation has been supplied yet — this skill summarizes existing findings, it does not perform the investigation. Route to `data-quality-gate` or `etl-failure-triage` first, then come back here with their output.
- The user wants the underlying issue fixed or the pipeline rerun — that is implementation work, out of scope here.

## Steps

1. **Require a source report.** Ask for the data-quality report, triage report, or investigation output if none has been supplied. Do not draft a brief from memory or assumption.

2. **Read the supplied report(s) in full** (e.g. `data-quality-report.md`, `etl-triage-report.md`) before drafting anything.

3. **Separate verified facts from unresolved questions.** A verified fact is something the source report stated as confirmed (evidence-backed). An unresolved question is anything the source report flagged as unknown, unconfirmed, or "possible but unconfirmed." Keep these in their own sections — never blend them.

4. **Never invent financial impact, cause, owner, or timing.** If the source report does not state a dollar figure, root cause with certainty, responsible owner, or a next-update time, do not supply one. Write "not yet confirmed" / "needs assignment" instead of guessing.

5. **Strip technical detail.** No raw log lines, stack traces, line numbers, SQL, or internal stage/step names. Translate technical findings into plain business language (e.g. "the pipeline halted before loading new data" rather than "TRANSFORM_MAP failed after 2 retries").

6. **State the blocked/live status explicitly.** Say plainly whether the dashboard or affected data should remain blocked from publishing, and tie that call directly to the source report's verdict/recommendation (e.g. a `BLOCK` or `FAIL` result means the brief should say the dashboard stays blocked).

7. **Fill out `template.md` exactly.** Use the template in this skill's directory as the literal structure for the final brief — same section order, same headers. Do not add, remove, or reorder sections.

8. **Return the brief** using the template's seven sections: **Status, Business Impact, What We Know, What We Do Not Know, Decision or Action Needed, Owner, Next Update.**

## Constraints

- Source-bound only: every statement in the brief must trace back to the supplied report(s). No new investigation, no speculation presented as fact.
- No raw logs, stack traces, or unnecessary technical jargon in the output.
- No invented financial impact, root cause, owner, or timing — use explicit placeholders ("not yet confirmed") when the source report doesn't supply them.
- Always state the blocked/live status of the dashboard explicitly.
- Keep the brief concise — this is a leadership-facing summary, not a technical report.

---
name: etl-failure-triage
description: Use when the user asks why an ETL or ELT pipeline, scheduled load, SQL job, data refresh, or ingestion process failed or produced suspicious output. Reviews logs and run metadata, ranks likely causes, cites evidence, and recommends the next safe diagnostic steps.
---

# ETL Failure Triage

## Purpose

Diagnose why a pipeline run failed or produced suspicious output, using only the log and run metadata provided. Rank likely causes by evidence, not guesswork, and hand back safe next diagnostic steps. This skill is read-only and diagnostic-only — it never changes pipeline code and never reruns a job.

## When to use

- The user asks why an ETL/ELT pipeline, scheduled load, SQL job, data refresh, or ingestion process failed.
- The user pastes or points to a failure log, error output, or a run that produced suspicious/unexpected results.
- The user asks for a root-cause ranking, an incident summary, or "what should I check next" on a failed run.

## When NOT to use

- The user wants the pipeline code fixed or rerun — triage first, then hand off; this skill does not implement fixes or execute jobs.
- The user wants a data-quality validation of a dataset that loaded successfully (no failure involved) — use `data-quality-gate` instead.
- The user wants a new pipeline built or a SQL job written from scratch — no failure to triage.

## Steps

1. **Require evidence.** Ask for a log, run output, or failure description if none has been provided. Do not speculate about a failure with nothing to read.

2. **Read run metadata when supplied** (e.g. a `pipeline-run-metadata.md`/`.json` alongside the log) — it gives run IDs, timestamps, source/target schemas, and prior run history that the log alone won't show.

3. **Before ranking causes, read `references/common-failures.md`.** It catalogs the common ETL failure signatures (schema mismatch, type conversion, retry-without-fix, connection/auth, volume anomaly, etc.), what log evidence each one leaves, and what the safe next diagnostic step is for each.

4. **Separate facts from hypotheses.** A fact is something directly quoted or line-referenced from the log/metadata. A hypothesis is an inference about why it happened. Never present a hypothesis as a fact.

5. **Cite evidence for every likely cause.** Every ranked cause must reference the specific log line(s), timestamp(s), or metadata field(s) that support it. A cause with no citation does not get ranked — it goes in a "possible but unconfirmed" note at most.

6. **Rank the most likely causes**, highest confidence first, each with its supporting evidence.

7. **Provide the next diagnostic step for each cause** — a safe, read-only action (e.g. "check the source schema for the `region` column," "inspect the mapping config for the affected field," "compare row counts between the last two successful runs"). Never recommend rerunning the job or editing pipeline code as a "next step."

8. **Return the report in this exact structure:**
   - **Incident Summary** — one or two sentences: what failed, when, what was observed.
   - **Evidence** — the raw facts pulled from the log/metadata, with line/field citations.
   - **Ranked Causes** — ordered list, each with its supporting evidence.
   - **Next Tests** — one safe diagnostic step per ranked cause.
   - **Escalation Recommendation** — whether this needs human/on-call escalation now, and why (or why not).

## Constraints

- Do not change pipeline code.
- Do not rerun jobs.
- Do not claim a root cause without citable evidence — if evidence is insufficient to rank a cause with confidence, say so explicitly rather than guessing.
- Keep output procedural and concise: the five required sections, no extended narrative.

---
name: data-quality-gate
description: Use when the user asks to validate, quality-check, or confirm the publish-readiness of a dataset, CSV, query result, ETL output, or dashboard/report data source — e.g. "validate this data", "run the quality gate", "is this safe to publish", "check this before it hits the dashboard". Checks the data against a quality contract and returns PASS, WARN, or FAIL with evidence and a PUBLISH or BLOCK recommendation. Do NOT use for ordinary requests to write or tune SQL, design a dashboard's layout or visuals, or calculate/define a metric — those only trigger this skill if the user also explicitly asks for a pre-publish validation or quality/gate check on the resulting data.
---

# Data Quality Gate

## Purpose

Validate a dataset against a quality contract before it is published, and return a clear PASS/WARN/FAIL verdict with a PUBLISH/BLOCK recommendation. Never modify the source data — this skill is read-only.

## When to use

- The user asks to validate, quality-check, or "gate" a dataset, CSV, query result, or ETL output.
- The user asks whether data is safe/ready to publish to a dashboard or report.
- The user references a quality contract, data contract, or asks for a PASS/WARN/FAIL or PUBLISH/BLOCK call.

## When NOT to use

Writing SQL, designing a dashboard, or calculating a metric is not by itself a reason to invoke this skill — only do so if the user is also explicitly asking to validate the data or confirm it's safe to publish.

- Writing, fixing, or optimizing a SQL query — no validation requested.
- Designing or building a dashboard's layout, charts, or visuals — route to `/dataviz` or `/frontend-design` instead.
- Calculating, defining, or explaining a metric/KPI — that's metric design, not data validation.

## Steps

1. **Require a dataset path.** If the user has not provided a path to the dataset (CSV, query result, ETL output, dashboard source), ask for it before proceeding. Do not guess a path.

2. **Locate the quality contract.** Look for a supplied quality contract (e.g. a `quality-contract.md` alongside the dataset, or one referenced by the user).

3. **Read the dataset and the contract.** Do not open the dataset for writing. This skill only reads.

4. **Before running checks, read `references/quality-checks.md`.** It defines the full check list, what each check inspects, the default checks to fall back on when the contract is silent on a category, and the evidence standard each check must meet. Apply it in full — do not run a partial check list from memory.

5. **Produce a results table** with these exact columns: `Check`, `Evidence`, `Status`, `Recommended Action`. One row per check. Evidence must cite specific rows, values, or counts from the dataset — not a generic restatement of the check.

6. **Roll up to a single overall verdict**: `PASS`, `WARN`, or `FAIL`.
   - `FAIL` if any check that violates a hard contract rule (uniqueness, required fields, numeric validity, or expected volume) fails.
   - `WARN` if only freshness or soft/advisory checks fail.
   - `PASS` if all checks pass.

7. **End with a recommendation**: `PUBLISH` or `BLOCK`.
   - `BLOCK` on any `FAIL`.
   - `BLOCK` or `PUBLISH` on `WARN`, at your judgment, with the reasoning stated in one line.
   - `PUBLISH` on `PASS`.

## Constraints

- Never modify, overwrite, or reformat the source dataset. This is a validation-only skill.
- Keep output procedural and concise: the results table, the overall verdict, and the recommendation. No extended narrative.
- If the quality contract is missing required rules for a check category, state that the default check was used instead of skipping it silently.

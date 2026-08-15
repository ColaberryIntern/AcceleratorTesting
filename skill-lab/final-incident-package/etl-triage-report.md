# ETL Failure Triage — orders_pipeline

**Run ID:** `run-20260803-0742` | **Log:** `skill-lab/orders-pipeline-failure.log` | **Metadata:** `skill-lab/pipeline-run-metadata.md`

## Incident Summary

`orders_pipeline` (source `orders_raw.csv` → target `orders_fact`, the table feeding the executive revenue dashboard) failed both attempts of its 2026-08-03T13:02Z scheduled run at the `TRANSFORM_MAP` / `map_region_code` step and halted before `LOAD`, writing **0 rows** to `orders_fact`. This is the **second consecutive** full failure — the prior day's run (2026-08-02) failed with the same error signature; the last successful load was 2026-08-01.

## Evidence

- `SCHEMA_VALIDATE` stage logged a WARN before the failure: column `region` "expected type=enum(region_code) values=[W,E,S,N] but observed free-text values in sample (e.g. 'West', 'East')" (log line 3).
- `TRANSFORM_MAP` step `map_region_code` threw `MappingLookupError: no mapping found for value 'West'` for row 1 / `ORD-1001`, and the same error class for row 2 / `ORD-1002` (value `'East'`) and row 6 / `ORD-1006` (value `''`, blank) (log lines 5–7).
- Attempt 1 failed with `rows_failed=11 rows_ok=1` (log line 8); the pipeline retried once (`RETRY_POLICY`, attempt 2 of 2, log line 9); attempt 2 failed at 13:02:44Z with **the identical error** (`no mapping found for value 'West'`, log line 12) and metadata confirms: "retry attempt 2 failed with identical error signature as attempt 1" (log line 13).
- Final status: `PIPELINE status=FAILED ... max retries exhausted (2/2) ... 0 rows written to orders_fact` (log line 14).
- Metadata's `region_code_map` config: version v3, 4 fixed entries (`W,E,S,N`), unchanged since 2026-05-12 — predates this incident.
- Metadata's source schema history table: `region` was in coded format (`W/E/S/N`) through 2026-08-01, changed to free-text names (`West`, `East`, ...) starting 2026-08-02, "some rows blank" — matching this run's blank value at row 6 / `ORD-1006`.
- Prior run history: `run-20260802-0701` (2026-08-02) also `FAILED`, 0 rows loaded, "Same `map_region_code` failure signature first appeared." `run-20260801-0703` (2026-08-01) was the last `SUCCESS`, with `region` "still region-code format."
- Open item on record: "Upstream export owner has not yet confirmed whether the `region` column format change ... was intentional."

## Ranked Causes

1. **Schema mismatch — upstream `region` column changed from coded to free-text format.** The source schema history table shows the format changed from `W/E/S/N` to `West/East/South/North` (plus blanks) starting 2026-08-02, exactly when failures began. The `SCHEMA_VALIDATE` WARN at log line 3 flags this directly. *(High confidence.)*
2. **Fixed mapping table has no entries for the new format.** `region_code_map` v3 contains only 4 coded entries and has not changed since 2026-05-12 (metadata line 26), so every free-text or blank `region` value fails lookup — consistent with the specific `MappingLookupError` values cited in log lines 5–7. *(High confidence — direct consequence of cause #1.)*
3. **Retry policy could not resolve this class of failure.** Both attempts hit the identical error signature 30 seconds apart (log lines 5–7 vs. 12), confirming the failure is a persistent data/config mismatch, not a transient fault the built-in retry (2 attempts, fixed 30s backoff) is designed to recover from. *(High confidence, but this is a symptom of causes #1–2, not an independent root cause.)*

**Possible but unconfirmed:** the blank `region` value on row 6 / `ORD-1006` may be a separate upstream data-entry gap rather than part of the same format-change event — the schema history table only says "some rows blank" starting the same day as the format change, without isolating a distinct cause. Confirming this needs a sample of the raw upstream export prior to 2026-08-02 to see if blanks existed before the format change.

## Next Tests

1. *(Schema mismatch)* Pull a raw sample of `orders_raw.csv` as delivered by the upstream export for 2026-08-01 vs. 2026-08-02 onward and diff the `region` column values — confirms the format-change timing without altering any config.
2. *(Mapping table gap)* Read (do not edit) the full `region_code_map` v3 definition to verify it truly has no free-text-to-code entries, and check whether a change-request or ticket exists on the upstream side for the export format change referenced in "Known open items."
3. *(Retry exhaustion)* Cross-check `run-20260802-0701` and `run-20260803-0742` metadata side by side (already available) to verify both terminated at the same step with the same error class — no further log pull needed; this confirms the issue is recurring, not a one-off blip, and rules out a "just retry again" response.

## Escalation Recommendation

**Escalate now.** Two consecutive scheduled runs (2026-08-02 and 2026-08-03) have fully failed with 0 rows written to `orders_fact`, and `orders_fact` feeds the executive revenue dashboard. Root cause resolution requires a decision outside triage scope — either the upstream export owner confirms/reverts the `region` format change, or `region_code_map` and the `map_region_code` step are updated to accept free-text values — both are config/code changes this skill does not make. Per the "Known open items" note, the upstream owner has not yet responded.

**Compounding note for downstream review:** the raw extract (`skill-lab/orders.csv`, 12 rows) also fails independent data-quality checks unrelated to this pipeline failure — a duplicated `order_id` (`ORD-1010`) and a negative `revenue` value (`ORD-1007`, row 7) — see `data-quality-report.md`. These were never reached by the pipeline because it halted at `TRANSFORM_MAP`, but they will need to be resolved separately before any future load of this source would pass the quality gate.

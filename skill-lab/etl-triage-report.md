# ETL Triage Report — orders_pipeline

- **Run ID:** `run-20260803-0742`
- **Window:** 2026-08-03T13:02:10Z – 13:02:44Z (34s)
- **Source log:** `skill-lab/orders-pipeline-failure.log`
- **Source metadata:** `skill-lab/pipeline-run-metadata.md`
- **Mode:** read-only triage — no pipeline code changed, no job rerun.

## Incident Summary

`orders_pipeline` run `run-20260803-0742` failed at the `TRANSFORM_MAP` / `map_region_code` step on both attempt 1 (13:02:13Z) and attempt 2 (13:02:44Z) with an identical `MappingLookupError` on the `region` field, exhausted its 2 retries, and halted before `LOAD` — 0 rows written to `orders_fact` (log lines 8, 13, 14; metadata "Rows written to target: 0").

## Evidence

- **Schema drift flagged pre-failure:** `SCHEMA_VALIDATE` warned that `region` was expected as `enum(region_code)` (`W,E,S,N`) but observed free-text values like `'West'`, `'East'` in the sample, severity `WARN`, `action=continue` (log line 3).
- **Mapping table unchanged:** `region_code_map v3` loaded with its fixed 4 entries (`W,E,S,N`) (log lines 4, 11); metadata confirms "No config or code change has been made to `region_code_map` or the `map_region_code` step since 2026-05-12."
- **Row-level failures cite the mismatch directly:** `ORD-1001` value `"West"`, `ORD-1002` value `"East"`, `ORD-1006` value `""` (blank) — all `"no mapping found ... expected one of: W,E,S,N"` (log lines 5, 6, 7).
- **Failure scope:** 11 of 12 rows failed mapping, 1 ok (log line 8).
- **Retry outcome:** attempt 2 reproduced the exact same error signature for the same offending value (`ORD-1001`, `"West"`) (log line 12); pipeline explicitly logs "retry attempt 2 failed with identical error signature as attempt 1" (log line 13).
- **Historical corroboration:** source schema history table shows `region` was region-code format through 2026-08-01, changed to free-text on 2026-08-02, and stayed free-text (plus one new blank) on 2026-08-03 (metadata table, rows 32–34). Prior-run history shows `run-20260802-0701` failed with "Same `map_region_code` failure signature" the day before (metadata row 41); `run-20260801-0703` was the last known-good run with region still in code format (metadata row 42).
- **Open item:** "Upstream export owner has not yet confirmed whether the `region` column format change ... on 2026-08-02 was intentional" (metadata, Known open items).

## Ranked Causes

1. **Upstream source schema drift on `region` (region code → free-text name), unhandled by the fixed mapping table.** This is a schema-mismatch pattern: the source began emitting `'West'`/`'East'`/etc. instead of `W`/`E`/`S`/`N` starting 2026-08-02, while `region_code_map` v3 still only recognizes the 4 short codes and hasn't changed since 2026-05-12.
   - Evidence: log lines 3, 5, 6, 8; metadata schema-history rows 32–34; metadata "Known open items."

2. **A blank/null `region` value newly present in the source, a second symptom of the same upstream drift.** Row 6 (`ORD-1006`) failed mapping on an empty string, distinct from the free-text values — the export change appears to have also introduced unpopulated `region` values that the mapping table (which has no null/blank handling) rejects.
   - Evidence: log line 7 (`value="" error="MappingLookupError ... expected one of: W,E,S,N"`); metadata row 34 ("plus one blank value (row 6, `ORD-1006`)").

3. **Retry policy masked, rather than resolved, a persistent (non-transient) failure.** The pipeline classified the `TRANSFORM_MAP` failure as potentially transient and burned both retry attempts (30s backoff) even though the identical error recurred, adding ~30s of delay before failure notification with no chance of success — the failure is deterministic on this input, not transient.
   - Evidence: log line 9 (retry triggered, reason=`TRANSFORM_MAP_FAILED`); log lines 12–13 (identical error signature on retry); metadata "Retry trigger condition: any non-EXTRACT stage failure classified as potentially transient."

**Possible but unconfirmed:** Whether the 2026-08-02 upstream export format change was an intentional, unannounced schema change by the source system owner, or an unintended regression. No evidence in the provided log/metadata confirms intent either way — metadata explicitly flags this as an open, unanswered question with the upstream export owner.

## Next Tests

1. **For cause 1 (schema drift):** Pull a fresh sample of raw `region` values directly from `orders_raw.csv` (or the upstream export) for the current and prior 2 days, and diff the observed value set against `region_code_map` v3's 4 entries. Confirms the full scope of unmapped values without touching the mapping config.
2. **For cause 2 (blank values):** Isolate and count rows with blank/null `region` in the same raw sample to determine whether row 6 was a one-off or part of a growing pattern. Cross-check against `orders.csv` referenced in metadata as the corresponding local file.
3. **For cause 3 (retry policy):** Review the `RETRY_POLICY` classification rules to confirm whether `TRANSFORM_MAP_FAILED` should be excluded from the transient-retry category (a config/ownership question, not a fix to implement here) — surface this as a follow-up for the pipeline owner rather than modifying retry config as part of this triage.

## Escalation Recommendation

**Escalate now, to the upstream export owner.** This is a two-run pattern (2026-08-02 and 2026-08-03, per metadata prior-run history) blocking 100% of loads to `orders_fact`, which feeds the executive revenue dashboard — not a one-off blip. The root cause sits outside this pipeline's code (upstream schema change), so no local fix is available at the triage layer; metadata already notes the export owner has not confirmed intent. Per the Colaberry escalation protocol, an unconfirmed upstream contract change breaking a production data feed to an executive-facing dashboard warrants prompt owner notification rather than waiting for another failed run.

# Run Metadata — orders_pipeline

## Run identity

- **Pipeline:** `orders_pipeline`
- **Run ID:** `run-20260803-0742`
- **Schedule:** daily, `0 13 * * *` (cron)
- **Source:** `orders_raw.csv` (upstream export, corresponds to `skill-lab/orders.csv`)
- **Target:** `orders_fact` (warehouse table feeding the executive revenue dashboard)
- **Start:** 2026-08-03T13:02:10Z
- **End:** 2026-08-03T13:02:44Z
- **Final status:** FAILED (max retries exhausted, halted before LOAD stage)
- **Rows written to target:** 0

## Retry configuration

- **Max retries:** 2
- **Backoff:** fixed 30s
- **Retry trigger condition:** any non-EXTRACT stage failure classified as potentially transient
- **Observed:** both attempt 1 (13:02:13Z) and attempt 2 (13:02:44Z) failed at the `TRANSFORM_MAP` / `map_region_code` step with the same error signature (`MappingLookupError`, value `'West'` not found in `region_code_map`).

## Transform config: `region_code_map`

- **Current version in use by this run:** v3
- **Entries (v3):** `W`, `E`, `S`, `N` (4 fixed codes)
- **Last changed:** 2026-05-12 (per config changelog, unrelated to this incident)

## Source schema history for `region` column

| Date | Observed format | Note |
|---|---|---|
| 2026-07-01 – 2026-08-01 | Region code (`W`, `E`, `S`, `N`) | Matches `region_code_map` v3 |
| 2026-08-02 | Free-text region name (`West`, `East`, `South`, `North`) — some rows blank | Upstream export format changed; first appeared in the prior day's run |
| 2026-08-03 (this run) | Free-text region name, same as 2026-08-02, plus one blank value (row 6, `ORD-1006`) | Matches this run's `SCHEMA_VALIDATE` warning and `TRANSFORM_MAP` errors |

## Prior run history (last 5 scheduled runs)

| Run ID | Date | Status | Rows extracted | Rows loaded | Notes |
|---|---|---|---|---|---|
| run-20260803-0742 | 2026-08-03 | FAILED | 12 | 0 | This run — region mapping failure, both attempts |
| run-20260802-0701 | 2026-08-02 | FAILED | 11 | 0 | Same `map_region_code` failure signature first appeared |
| run-20260801-0703 | 2026-08-01 | SUCCESS | 10 | 10 | Last known-good run; `region` still region-code format |
| run-20260731-0702 | 2026-07-31 | SUCCESS | 9 | 9 | — |
| run-20260730-0700 | 2026-07-30 | SUCCESS | 11 | 11 | — |

## Known open items (as of this run)

- No config or code change has been made to `region_code_map` or the `map_region_code` step since 2026-05-12.
- Upstream export owner has not yet confirmed whether the `region` column format change (region code → free-text name) on 2026-08-02 was intentional.

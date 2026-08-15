# Data Quality Report — orders.csv

**Dataset:** `skill-lab/orders.csv`
**Contract:** `skill-lab/quality-contract.md`
**Validation time:** 2026-08-04T01:36:04Z
**Rows evaluated:** 12 (data rows, excluding header)

| Check | Evidence | Status | Recommended Action |
|---|---|---|---|
| Schema | Header row contains `order_id,customer_name,region,revenue,load_timestamp` — all contract-referenced fields (`order_id`, `region`, `revenue`, `load_timestamp`) present; `revenue` and `load_timestamp` values parse as numeric/ISO-8601 respectively across sampled rows. | PASS | None. |
| Key uniqueness (`order_id`) | `ORD-1010` appears twice — data rows 10 and 11 (CSV lines 11 and 12), both `Juniper Trade,West,890.40,2026-08-03T05:55:00Z`. | FAIL | Deduplicate on `order_id` before publish; trace source of the duplicate write (see ETL triage). |
| Duplicates (full row, default check) | Data rows 10 and 11 (CSV lines 11–12) are fully identical in every column: `ORD-1010,Juniper Trade,West,890.40,2026-08-03T05:55:00Z`. | FAIL | Remove one of the two identical rows; confirm no other duplicate inserts exist upstream. |
| Required fields (`region`) | Data row 6 (CSV line 7, `order_id=ORD-1006`, `customer_name=Foxglove Media`) has an empty `region` field. | FAIL | Backfill `region` for `ORD-1006` or exclude the row until the value is confirmed. |
| Numeric rules (`revenue` > 0) | Data row 7 (CSV line 8, `order_id=ORD-1007`, `customer_name=Granite Logistics`) has `revenue = -150.00`. | FAIL | Investigate whether this is a refund/credit misclassified as an order; correct or exclude before publish. |
| Freshness (`load_timestamp` < 24h, default 24h window applied — contract states 24h explicitly) | Validation time 2026-08-04T01:36:04Z UTC (24h cutoff: 2026-08-03T01:36:04Z). 3 of 12 rows exceed the window: `ORD-1003` (2026-08-02T22:40:00Z, ~27h old, row 3/line 4), `ORD-1006` (2026-08-02T19:05:00Z, ~30.5h old, row 6/line 7), `ORD-1008` (2026-07-31T14:20:00Z, ~83h old, row 8/line 9). | WARN | Confirm with pipeline owner whether stale rows reflect a partial/incomplete load (see ETL triage) before treating as historical carryover. |
| Expected volume (min 10 rows) | 12 data rows found in `orders.csv`, meeting the contract minimum of 10. | PASS | None. |

## Overall Verdict: **FAIL**

Four checks violate hard contract rules: key uniqueness, full-row duplicates, required fields, and numeric validity.

## Recommendation: **BLOCK**

Data is not safe to publish. Multiple hard-rule violations (duplicate `order_id`, null `region`, negative `revenue`) plus a freshness anomaly affecting 25% of rows indicate an unhealthy upstream load, not isolated bad records. Proceeding to ETL failure triage to investigate root cause.

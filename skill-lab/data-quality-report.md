# Data Quality Report — skill-lab/orders.csv

**Validated against:** skill-lab/quality-contract.md
**Validation date:** 2026-08-03
**Dataset:** skill-lab/orders.csv (12 data rows, header + rows 2–13)

## Results

| Check | Evidence | Status | Recommended Action |
|---|---|---|---|
| Schema | Columns present: `order_id, customer_name, region, revenue, load_timestamp` — matches all fields referenced by the contract. | PASS | None |
| Key uniqueness (`order_id`) | `ORD-1010` appears twice (row 11 and row 12: `ORD-1010,Juniper Trade,West,890.40,2026-08-03T05:55:00Z`). 11 unique keys across 12 rows. | FAIL | Deduplicate on `order_id` before publishing; investigate upstream source for double-insert. |
| Duplicates (full-row) | Row 11 and row 12 are byte-identical (`ORD-1010,Juniper Trade,West,890.40,2026-08-03T05:55:00Z`). | FAIL | Drop the redundant row; same root cause as key-uniqueness failure. |
| Required fields (`region`) | Row 7, `ORD-1006` (Foxglove Media): `region` is empty. | FAIL | Reject or backfill the row; do not publish with a blank required field. |
| Numeric rules (`revenue` > 0) | Row 8, `ORD-1007` (Granite Logistics): `revenue = -150.00`. | FAIL | Investigate — likely a refund/credit miscoded as an order; exclude or correct before publishing. |
| Freshness (`load_timestamp` < 24h old) | Row 9, `ORD-1008` (Harbor Goods): `load_timestamp = 2026-07-31T14:20:00Z`, ~3 days before validation date 2026-08-03 — exceeds the 24h window. Other rows range from 2026-08-02T19:05:00Z to 2026-08-03T12:10:00Z; several fall outside a strict 24h window depending on exact validation time-of-day. | WARN | Confirm expected load cadence with the data owner; re-run extraction for `ORD-1008` at minimum. |
| Expected volume (≥ 10 rows) | 12 data rows present (11 unique order_ids). | PASS | None |

## Overall Verdict: **FAIL**

Three hard contract rules are violated: key uniqueness, required fields (`region`), and numeric validity (`revenue`).

## Recommendation: **BLOCK**

Do not publish to the executive revenue dashboard. The revenue total would currently be both inflated (duplicate `ORD-1010` row) and understated (negative `ORD-1007` revenue), and one order has no `region` to attribute to. Fix the four flagged rows (7, 8, 11 or 12) and re-validate before publishing.

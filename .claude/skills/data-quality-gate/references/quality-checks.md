# Quality Checks Reference

Read this file in full before running checks (see SKILL.md step 4). It defines every check the gate runs, what evidence each one requires, and the default fallback rules to use when the contract is silent on a category.

## Default checks (used when the contract omits a category)

If the quality contract does not specify rules for a check category below, fall back to these defaults rather than skipping the category. State explicitly in the results table that a default was used in place of a contract rule.

- Schema present
- No duplicate keys
- No nulls in required fields
- No negative values in numeric fields expected to be positive
- Freshness under 24 hours
- Row count reasonable for the source (no hard minimum — flag only if volume looks implausible relative to the source's normal pattern)

## Check definitions

- **Schema** — Expected columns are present and column types are plausible given sample values (e.g. a `revenue` column should parse as numeric, not text).

- **Freshness** — The most recent load/timestamp field is within the contract's required window (or the 24-hour default). Evidence must cite the actual timestamp value(s) found and the validation time used for comparison, not just "some rows are stale."

- **Expected volume** — Row count meets the contract's stated minimum, or, if no minimum is given, is not wildly outside the historical/expected norm for that source. Evidence must cite the actual row count.

- **Key uniqueness** — The contract-designated key column(s) have no duplicate values. Evidence must cite the specific duplicated key value(s) and the row numbers/positions where they occur.

- **Duplicates** — No fully duplicate rows (every column value identical between two or more rows). Evidence must cite the row numbers/positions involved, not just "duplicates found."

- **Required fields** — Contract-designated required fields are non-empty on every row. Evidence must cite the specific row(s) and field(s) that are blank.

- **Nulls** — Null/blank rate in required fields, reported as a count or percentage with the offending rows identified, not a vague "some nulls present."

- **Numeric rules** — Contract-designated numeric fields satisfy their stated constraints (e.g. greater than zero, within a valid range). Evidence must cite the specific row(s) and the offending value(s).

## Evidence standard

Every row in the results table must cite something concrete and checkable from the dataset itself: a row number, a specific value, a count, or a percentage. A row that only restates the check definition (e.g. "checked for duplicates") without citing what was found is not acceptable and must be redone before the report is finalized.

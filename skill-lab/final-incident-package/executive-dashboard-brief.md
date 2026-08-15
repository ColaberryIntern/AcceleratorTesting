# Executive Dashboard Brief — Orders Revenue Dashboard

**Date:** 2026-08-03
**Prepared from:** skill-lab/final-incident-package/data-quality-report.md, skill-lab/final-incident-package/etl-triage-report.md

## Status

**BLOCKED.** The orders dashboard should not be published in its current state. The underlying data failed quality validation, and the daily data refresh has not successfully loaded new data for two days in a row.

## Business Impact

The dashboard's revenue data is stale: no new data has loaded successfully since 2026-08-01, and the most recent two scheduled refreshes both failed completely, with zero new rows added. Separately, even the raw data behind the dashboard has quality problems — a duplicate order record and an order with a negative revenue value — that would need to be fixed before the data could be trusted for reporting. The scale of business impact (e.g., how much revenue reporting is affected, how many days of decisions relied on stale numbers) is not yet confirmed.

## What We Know

- The dashboard's data feed failed quality validation: a duplicated order record, a missing required field (region) on one order, and an order with a negative revenue value were all confirmed in the underlying data.
- A quarter of the records in the underlying data are older than the required freshness window.
- The daily data refresh has failed for two consecutive scheduled runs (2026-08-02 and 2026-08-03), and zero new rows were loaded into the dashboard's data table in either run.
- The refresh failure traces to an upstream change: the source system started sending region names in a different format than the dashboard's data pipeline expects, starting 2026-08-02, and the pipeline could not translate the new format.
- The pipeline automatically retried once and failed again with the same problem, confirming this is not a temporary glitch — it will keep failing until addressed.
- The duplicate order and negative-revenue issues are separate from the refresh failure and were not caused by it; they exist independently in the source data and were never reached because the refresh halted earlier in the process.

## What We Do Not Know

- Whether the upstream system's format change was intentional or itself a mistake — the team that owns that export has not yet confirmed.
- Whether the blank region value on one order is related to the format change or a separate data-entry gap.
- The business/financial scale of the impact from two days of stale dashboard data.

## Decision or Action Needed

Leadership does not need to make a decision right now. The dashboard should remain blocked from publishing until (a) the upstream export format issue is resolved or the pipeline is updated to handle it, and (b) the duplicate-record and negative-revenue issues in the source data are corrected. Confirmation is needed from the team that owns the upstream data export on whether their format change was intentional.

## Owner

Not yet assigned — needs confirmation.

## Next Update

Not yet scheduled — needs confirmation.

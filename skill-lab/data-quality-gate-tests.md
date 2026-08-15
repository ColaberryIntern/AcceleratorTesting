# data-quality-gate — Trigger Tests

Manual test prompts for confirming the skill triggers on data-validation / publish-readiness requests and stays silent on unrelated SQL, dashboard-design, and metric-calculation requests.

## Should trigger

1. "Validate skill-lab/orders.csv against skill-lab/quality-contract.md before it feeds the executive revenue dashboard — should I publish or block it?"
2. "Run the quality gate on this ETL output before we load it into the reporting schema."
3. "Is this query result safe to publish to the customer dashboard, or does it fail any quality checks?"

## Should NOT trigger

1. "Write a SQL query that joins orders and customers and sums revenue by region."
2. "Design a layout for the executive revenue dashboard with a KPI row and a trend chart."
3. "How do I calculate month-over-month revenue growth as a metric?"

## Expected output requirements

**When triggered**, the response must:
- Include a results table with exactly these columns: `Check`, `Evidence`, `Status`, `Recommended Action`.
- Cite concrete evidence per row (specific row numbers, values, or counts) — not generic restatements of the check.
- Roll up to a single overall verdict: `PASS`, `WARN`, or `FAIL`.
- End with an explicit `PUBLISH` or `BLOCK` recommendation.
- Not modify the source dataset (read-only).
- If the quality contract is missing rules for a check category, state that a default was used instead of skipping it silently.

**When not triggered**, the response must:
- Directly address the SQL, dashboard-design, or metric-calculation request without producing a PASS/WARN/FAIL verdict, a PUBLISH/BLOCK recommendation, or a quality-check results table.
- Not ask for a dataset path or quality contract unless the user's request independently requires one for its own purpose (e.g. the SQL needs a schema reference).

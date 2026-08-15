# Quality Contract — orders.csv

## Key uniqueness
`order_id` must be unique across all rows.

## Required fields
`region` is required (non-null, non-empty) on every row.

## Numeric rules
`revenue` must be greater than zero.

## Freshness
`load_timestamp` must be less than 24 hours old at validation time.

## Expected volume
Expected row count is at least 10.

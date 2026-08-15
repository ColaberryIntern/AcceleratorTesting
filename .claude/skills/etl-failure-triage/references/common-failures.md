# Common ETL Failure Signatures

Read this file in full before ranking causes (see SKILL.md step 3). For each failure pattern: what it is, the log/metadata evidence it typically leaves, and the safe next diagnostic step.

## Schema mismatch

Source schema no longer matches what the pipeline's mapping/transform step expects — a column renamed, dropped, added, retyped, or a value newly allowed to be empty/null upstream.

- **Evidence to look for:** errors naming a specific column ("unexpected value," "column not found," "cannot cast"); a schema-validation step logging an expected vs. actual column list; a mapping/transform step failing immediately after a successful extract.
- **Next diagnostic step:** compare the source's current schema (or a recent sample of raw extracted rows) against the mapping config's expected schema for the affected column(s). Do not alter the mapping — just confirm the drift.

## Failed type conversion / mapping step

A transform step tries to cast or map a value into a type or enum it doesn't fit (e.g. a string where a number is expected, a value outside a fixed lookup/mapping table).

- **Evidence to look for:** a conversion/cast error naming the field and the offending value; a mapping-lookup failure ("no mapping found for value X"); the failure occurring at a named transform step rather than at extract or load.
- **Next diagnostic step:** inspect the specific offending value(s) in the raw source data and check them against the mapping/lookup table or expected type definition. Do not edit the mapping table — just confirm which values fall outside it.

## Retry that did not resolve the problem

The pipeline automatically retried the failed step, and the retry failed with the same (or a related) error — meaning the root cause is not transient (not a network blip or a lock timeout) but a data or config problem that will recur on every attempt until fixed.

- **Evidence to look for:** two or more log entries for the same step with the same or related error signature, separated by a retry/backoff log line; identical failing row/value cited across attempts.
- **Next diagnostic step:** treat the failure as persistent, not transient — do not recommend "just retry again." Trace the specific input that failed on every attempt and diagnose it directly (per the matching failure pattern above).

## Connection / authentication failure

The pipeline can't reach or authenticate to a source or target system.

- **Evidence to look for:** timeout, connection-refused, DNS, TLS, or 401/403-style errors, typically at the very start of a run before any row-level processing appears in the log.
- **Next diagnostic step:** check credential/config freshness and network reachability to the named endpoint. Do not rotate credentials or modify connection config as part of triage — surface it as the next step for whoever owns that config.

## Volume / row-count anomaly

The run completed (or partially completed) but processed a row count far outside the historical norm — a silent-failure pattern rather than a hard error.

- **Evidence to look for:** run-metadata row counts compared against prior runs' counts; a load step that "succeeded" with 0 or a suspiciously low/high row count; no error logged despite an implausible result.
- **Next diagnostic step:** compare the run's row count and key distribution against the last N successful runs using only the metadata provided — don't rerun the job to get a fresh count.

## Evidence standard

Every ranked cause must cite a specific log line (quote or paraphrase with a line reference) or a specific metadata field/value. If a plausible cause has no such citation available in the provided log/metadata, list it under "possible but unconfirmed" rather than ranking it, and state what evidence would be needed to confirm or rule it out.

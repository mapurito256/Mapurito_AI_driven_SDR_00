# evals — fixtures for Ctx 01 v2 (human use, off the agent's path)

These fixtures measure whether the stage detects real gaps without inventing
them. **No skill reads this folder**, and the fixtures are not part of any run.
A human, or a separate harness, builds the fixture data and runs the stage
against it; this file only describes what to build and what the correct result
is. Do not place fixture data where a skill could load it.

## Fixture types to build

### (a) No real gaps — the most important case for the bias

A complete input: every objective has a measure, every limit has a source, every
figure has a citation, no two statements conflict. The correct result is **zero
open questions**. Metric: false-gap rate (any question raised here is a false
positive). This is the fixture that calibrates the three anti-bias tests of
`sr-gap-questions`.

### (b) Injected gaps — one defect each

Build one input per defect, each with a single injected gap:

- a limit stated without a source;
- an objective stated without a measure;
- a figure used without a citation;
- a conflict between two statements.

The correct result is that the stage raises exactly the question for that gap and
no other. Metric: detection rate.

### (c) Feedback that crosses a frozen boundary

A feedback form whose answer or theme would change an objective, scope,
stakeholder or the Ctx 00 boundary. The correct result is that
`sr-improvement-plan` classifies it `R0` and **escalates without applying it**.
Metric: the change is not applied and the escalation is recorded.

## Cost

Measure tokens per run from the harness or the usage panel, not from the agent.
An event may carry `tokens: not-measured` when the environment does not expose
them. Compare against v1.

## What not to do

Do not inject more than one gap per fixture in type (b); a single defect keeps the
detection metric unambiguous. Do not let any fixture or its expected result enter
the skills or the references — they must stay example-free.

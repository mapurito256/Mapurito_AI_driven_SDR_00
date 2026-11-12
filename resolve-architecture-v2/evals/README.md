# evals — fixtures for Ctx 02 v2 (human use, off the agent's path)

These fixtures measure whether the stage detects real gaps without inventing
them, avoids inventing hardware, and respects the round limits. **No skill reads
this folder**, and the fixtures are not part of any run. A human, or a separate
harness, builds the fixture data and runs the stage against it; this file only
describes what to build and what the correct result is. Do not place fixture data
where a skill could load it. This file holds no data.

All fixtures use the Ctx 01 v2 output format. A real pass needs first a real run
of Ctx 01 v2 and a Ctx 00 `problem-definition.md`.

## Fixtures

### (a) Complete input, no real gaps — the most important case for the bias

Every limit has a source, every `REQ` is anchored, no two statements conflict.
Correct result: **zero questions**. Metric: false-gap rate. Calibrates the three
tests of `ra-gap-questions`.

### (b) Seeded gaps — one defect per input

Build one input per defect: a hardware datum without a source; an architecture
decision without a criterion; a conflict between two `REQ`. Correct result: the
stage raises exactly the question for that gap and no other. Metric: detection
rate.

### (c) One option dominates

A single reference passes every eliminatory criterion and is no worse on any
ordinal one. Correct result: the V1 document presents one option with a
dominance statement and the discarded alternatives, and invents no other option.

### (d) No purchasable SDR meets a mandatory `LIM`

Correct result: `ESCALATION` `R1`, `status: returned_upstream`, a
`CONTEXT-ctx02.md` with the reason, and no invented hardware.

### (e) Feedback that asks for a Ctx 03 parameter

Correct result: the row is `defer:Ctx03`, it is not applied, and it travels in
`CONTEXT-ctx02.md`.

### (f) Round limits and blocking

With no response, the stage stays `blocked`. Presentation R4 admits only
`APROBAR` or `DETENER`. An open question of the validation's gate makes `APROBAR`
not accepted. A forced closure picks by `mvp-criteria.md` and appears highlighted.

## Cost

Measure tokens per run from the harness or the usage panel, not from the agent.
An event may carry `tokens: not-measured`.

## What not to do

Do not seed more than one defect per fixture in (b). Do not let any fixture or
its expected result enter the skills or the references; they must stay
example-free.

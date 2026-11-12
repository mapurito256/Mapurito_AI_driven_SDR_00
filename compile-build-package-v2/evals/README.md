# evals — fixtures for Ctx 03 v2 (human use, off the agent's path)

These fixtures measure whether the stage specifies completely without inventing
requirements, respects the hardware, never relaxes an acceptance threshold, and
respects the round limits. **No skill reads this folder**, and the fixtures are not
part of any run. A human, or a separate harness, builds the fixture data and runs
the stage against it; this file only describes what to build and what the correct
result is. Do not place fixture data where a skill could load it. This file holds
no data.

All fixtures use the Ctx 02 v2 and Ctx 01 v2 output formats. A real pass needs a
real run of Ctx 00 to Ctx 02 first.

## Fixtures

### (a) Complete input, no real gaps — the bias case

Every limit has a source, every deferral window is closable, no two statements
conflict. Correct result: zero questions of kind `gap`; `decision` questions only
where two options both meet every `AC`. Metric: false-gap rate.

### (b) Seeded gaps — one defect per input

One input per defect: a deferral with no window; a calibration that needs a
reference no component provides; a conflict between two acceptance criteria.
Correct result: the stage raises the question or escalation for that defect and no
other. Metric: detection rate.

### (c) One hardware option dominates

A single reference passes every eliminatory criterion and is no worse on any
ordinal one. Correct result: one option with a dominance statement, no forced
second option. Metric: forced-second-option rate (must be zero).

### (d) Budget does not fit

A requirement rate that the cited board throughput cannot sustain with margin.
Correct result: the remedy ladder in order, no `AC` weakened, an escalation when the
ladder ends. Metric: any relaxed threshold counts as a failure.

### (e) Threshold equality

A set of acceptance criteria, some with a deferred threshold. Correct result: every
test carries the same operator, number and unit as its criterion, or the closed
value inside the deferral window. Metric: rate of altered thresholds (must be zero).

### (f) Module discipline

A register of at least six modules with dependencies. Correct result: modules are
specified strictly in `order`, none skipped or left half-done, the state and status
files match the events after every module. Metric: order violations (must be zero).

### (g) Round limits

Feedback sequences that exceed three adjustments, add questions at R3, or approve
over an open blocking question. Correct result: no new question after R2, `APROBAR`
refused while blocked, a forced closure only on the human directive.

## Calibration notes

Record per fixture the expected register size and order, the expected questions,
the expected gate verdicts and the expected escalation code, as plain text. Update
the notes in the same change that alters a rule, gate wording or closed code.

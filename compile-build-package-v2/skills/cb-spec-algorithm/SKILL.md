---
name: cb-spec-algorithm
description: Specifies a module of kind algorithm — spectral estimator, detector, sweep strategy or the learned-model hand-off — with its equations, parameters with units, ranges and sensitivity, behaviour on lost samples, per-frame operation count and hardware fit; loaded by cb-spec-module for that kind, not invoked directly.
---

# cb-spec-algorithm

## Objective

Write an algorithm so the builder implements it with no design decision: the
model, every symbol with its unit, every parameter with its value and range, the
behaviour at the edges, and proof that the values meet the `AC` and fit the
hardware. The Ctx 02 decision fixes the family; this skill fixes everything inside
it.

## Inputs

The input pack of `cb-spec-module`, `references/parameter-rules.md`,
`references/module-template.md`, the class row of `references/spec-classes.md`.

## Steps

1. **State the task and the thresholds.** Section 1 of the module: copy the `REQ`
   text and the `AC` metric, operator, threshold, unit and condition literally;
   state the Ctx 02 family chosen and its `DEC` id.
2. **Model.** Write the equations in plain text with every symbol, its unit and
   its valid range. Define the data as it enters (type, scaling, level reference,
   byte order from the producer's `SCH`) and as it leaves (the consumer's `SCH`).
3. **Parameters by class** (values by the anchoring ladder, never copied from a
   memory of other systems):
   - `spectral-estimator`: window family and length, overlap, transform length,
     the resolution bandwidth *derived* from them with the formula written, the
     frame period, averaging count, output unit and level reference, how the
     calibration offset is applied, the equivalent noise bandwidth used when levels
     are converted to power density.
   - `detector`: the statistic, the noise-floor estimator and its window, the
     threshold rule, the false-alarm target and the derivation from the target to
     the threshold value, hysteresis, minimum occupancy duration, and the rule that
     retunes the threshold (when and by what).
   - `sweep-strategy`: the channel list and order from the `REQ` span, the step
     (derived from the resolution and the front-end bandwidth), the dwell (from the
     frame period and the averaging count), the retune-settle time from the SDR
     snapshot, the revisit period and the total sweep time.
   - `learned-model-need` (only if Ctx 02 marked it active): load the skills
     `sdr-modelo-especificacion` and `sdr-dataset-especificacion` and take their
     output as the module body; tie input and output to `SCH` ids; write the digest.
     Do not redo their reasoning. If inactive, this module does not exist.
4. **Choose critical values.** Apply `references/parameter-rules.md` section 2:
   at most three candidate values, effect on the `AC` metric, compute and memory
   per candidate, discard those that miss the threshold with margin, pick the
   cheapest that fits. A close call with two valid options is a candidate question
   with a provisional value.
5. **Behaviour at the edges.** Lost or late samples, saturated frames, an invalid
   frame, start-up transient, the first frame after a retune, an empty input.
   Each becomes an `ERR` row owned by this module or points to the `ERR` of the
   interface module that owns the boundary; state which.
6. **Per-frame operation count and fit.** Count operations from the equations
   (written per stage), multiply by the frame rate, and write the demand for the
   resource rows `compute` and `memory` (and `time` for the deadline). Set each
   parameter's `hw_check` to its `RB` row (`cb-resource-budget` rows are created or
   updated here with `mode: final`; the full recheck is done at 03.5).
7. **Worked check.** Section 8: the arithmetic from the parameters to the `AC`
   threshold and the budgets, one line per step with units.
8. **Items.** Write each `PAR` with all fields, each `SCH` the module produces and
   each `ERR` it owns, into `results/ctx03/items.json`; write the file and the
   digest per `references/module-template.md`.

## Output format

`results/ctx03/specs/SPEC-nn.md` and the items above. `cb-spec-module` runs the
self-check and records.

## Do not

- Do not write code, only equations, tables and `text` pseudocode if needed.
- Do not set a value without unit, range and sensitivity.
- Do not weaken the `AC` or change the Ctx 02 family; that is an escalation.
- Do not import values from other systems from memory.
- Do not specify the calibration or verification procedure here; reference it
  through `depends_on`.
- Do not load any fixture or example dataset.

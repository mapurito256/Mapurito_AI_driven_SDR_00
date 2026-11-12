---
name: cb-spec-procedure
description: Specifies a module of kind procedure — calibration, verification, cross-site reproducibility — with ordered steps, durations, acceptance rule, validity and interval, failure exits and what must be identical across sites; loaded by cb-spec-module for that kind, not invoked directly.
---

# cb-spec-procedure

## Objective

Write a procedure that an operator or the software can execute step by step with no
design decision: what is needed, what is done in which order with which parameter,
how long it takes, what makes it pass, what is recorded and what happens on
failure. Related procedures are linked: the register already knows which one
consumes which.

## Inputs

The input pack of `cb-spec-module`, `references/parameter-rules.md`,
`references/module-template.md`, the class row of `references/spec-classes.md`.

## Steps

1. **Purpose and thresholds.** Copy the `REQ`/`AC`/`DFR` text and values. State
   what the procedure guarantees and which measurement or `PAR` depends on its
   result.
2. **Equipment and preconditions.** List only what exists in the architecture or
   among the `HW` references: the SDR, the board, the RF chain elements, any
   reference source that a `CMP` provides. If the procedure needs an instrument
   or source nobody provides, do not assume it: raise a candidate question; if the
   need blocks an `AC` it is `escalate:V1` (add or change hardware in 03.2) or
   `escalate:R2`. A desirable reference no `REQ` requires goes to `beyond_mvp`.
3. **Steps.** One `PRC` per procedure. Each step is a single verifiable act with
   the `PAR` ids it uses and the expected result with unit. State the executor
   (`software` or `operator`) and the duration with the arithmetic from the step
   durations and the averaging counts.
4. **Parameters by class.**
   - `calibration`: what is calibrated (offset, gain, frequency error), the
     reference level and frequency, averaging time and count, the acceptance
     tolerance, the validity period and the justification of that period, where
     the result is stored (`SCH`), how and when the estimator applies it.
   - `verification`: the interval and the evidence that justifies it (a drift
     figure from a datasheet or a derived bound), the reference, the number of
     repeats, the acceptance tolerance, and the action when it fails (re-run the
     calibration, flag the data, stop reporting), each with an `ERR`.
   - `cross-site-reproducibility`: what must be identical across nodes
     (software and schema versions, parameter set, references, calibration state),
     what is measured at each site, the comparison rule and tolerance (derived from
     the `AC` or a datasheet figure), the evidence recorded, and the number of nodes
     compared.
5. **Choose values** by `references/parameter-rules.md`. A tolerance is derived from
   the `AC` threshold budget (written as an error budget in one unit), not set by
   feel. A close call with two valid options is a candidate question.
6. **Failure exits.** One `ERR` per way a step can fail (reference absent, result
   outside tolerance, timeout, storage failure), each with response, retries,
   limits and final state.
7. **Resource fit.** Duration against the allowed downtime or sweep budget; storage
   of results against capacity. Update the `RB` rows (`final`).
8. **Worked check** (section 8) and items: write each `PRC`, `PAR`, `SCH`, `ERR`
   into `results/ctx03/items.json`, then the file and its digest.

## Output format

`results/ctx03/specs/SPEC-nn.md` and the items above. `cb-spec-module` runs the
self-check and records.

## Do not

- Do not invent an instrument, source or step the architecture does not provide.
- Do not leave a step without parameter ids, an expected result or a failure exit.
- Do not set an interval or tolerance without its justification.
- Do not include measurement results, only how they are acquired and judged.
- Do not load any fixture or example dataset.

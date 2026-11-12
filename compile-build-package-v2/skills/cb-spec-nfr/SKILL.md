---
name: cb-spec-nfr
description: Specifies a module of kind nfr — allocation of time-bound, resource and reliability requirements across the blocks, with per-block budgets, buffer and memory partition, thermal and power limits, timeouts and recovery values against the closed hardware limits; loaded by cb-spec-module for that kind, not invoked directly.
---

# cb-spec-nfr

## Objective

A non-functional requirement is met by numbers spread over several modules. This
skill turns each one into allocations the builder can follow and the tests can
check: how much of the threshold each block may use, how memory and storage are
partitioned, where the thermal and power ceilings sit, and what happens on a
violation. It runs after the modules it allocates across (the register orders it).

## Inputs

The input pack of `cb-spec-module`, the digests and `PAR` of the algorithm,
procedure and interface modules it depends on, the `HW` characteristics and the
budget rows, `references/parameter-rules.md`.

## Steps

1. **Take each non-functional `REQ` it closes** with its `AC`: copy the metric,
   operator, threshold, unit and condition. The threshold is never changed.
2. **Performance and real time** (`nfr-performance`). Break the end-to-end time of
   the `AC` into the stages of the Ctx 02 chain; give each stage a time budget in
   one unit; the budgets plus the planning margin of `parameter-rules.md` sum to at
   most the threshold, with the sum written out. Each stage's budget must be at
   least the demand of its module (from its `RB` time or compute row); if a module
   demands more than its share, adjust inside ranges or escalate by the remedy
   ladder.
3. **Resources** (`nfr-resources`). Partition memory and storage among buffers,
   queues and files with the sum and the margin; set the thermal operating limit
   from the board's cited maximum minus the thermal headroom; set the power
   ceiling from the supply characteristics; state what the node does when a limit
   is approached (reduce a non-critical rate within its `range`, flag, stop
   reporting) as `PAR` and `ERR`.
4. **Reliability** (`nfr-reliability`). Availability and recovery as values: watchdog
   timeout, restart limit and interval, maximum recovery time, state preserved
   across a restart. Derive each from the `REQ` threshold; where the threshold needs
   an uptime figure that no source supports, derive the allowed downtime from it
   and say so.
5. **Parameters.** Each allocation is a `PAR` with unit, range, `reqs`, `critical`
   true when it can flip an `AC` verdict, and `hw_check` linked to its `RB` row.
   Each violation response is an `ERR` with detection, response, limit and final
   state, reported through an existing `SCH`.
6. **Close the NFR budget table** (section 5 of the module): stage or resource,
   allocation, demand from the owning module, margin, verdict. Update `RB` rows
   (`final`).
7. **Worked check** (section 8): the sums and margins line by line, then items and
   the file with its digest.

## Output format

`results/ctx03/specs/SPEC-nn.md` with the budget table, `PAR`, `ERR` items.
`cb-spec-module` runs the self-check and records.

## Do not

- Do not change an `AC` threshold or shift a budget onto a module without checking
  its demand.
- Do not allocate a budget that does not sum to the threshold with margin.
- Do not invent an uptime, temperature or power figure; cite or derive it.
- Do not specify the internals of another module; ask for its parameter through
  the dependency.
- Do not load any fixture or example dataset.

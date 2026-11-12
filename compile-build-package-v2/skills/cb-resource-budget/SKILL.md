---
name: cb-resource-budget
description: Builds and checks the resource budget — compute, memory, storage, interface throughput, thermal, power, RF level and time — against cited hardware capacities with planning margins, first provisionally at 03.2 from the requirement rates and the Ctx 02 algorithm families, then finally at 03.5 from the closed parameters; closes the Ctx 02 open points and applies the remedy ladder; loaded by compile-build-package-v2, not invoked directly.
---

# cb-resource-budget

## Objective

Keep parameters, procedures and hardware consistent: show, with the operation
written out, that what the specification asks of the hardware fits what the
hardware can do, with margin. Resolve the circularity between hardware and
parameters in two passes: a provisional envelope before V1, a final check after
the modules. Rules, margins and the row shape: `references/parameter-rules.md`.

## Modes

- `provisional` (03.2). Parameters do not exist yet. Demand is an upper-bound
  estimate from the `REQ`/`LIM` rates and sizes (sample rate, bandwidth, number of
  channels, sweep span, retention, report rate) and from the Ctx 02 algorithm
  families (for the estimator, an operation count per frame from its standard
  form). Every operand cites its source; every assumption is `propuesto` and listed.
- `final` (03.5). Demand uses the closed `PAR` values of the specs.

## Steps

1. List the resources that apply (`compute`, `memory`, `storage`,
   `io-throughput`, `thermal`, `power`, `rf-level`, `time`) from the `REQ` that
   touch them. A resource no `REQ` touches gets no row; write why.
2. For each resource write a row `RB-nn` in `budget` of `results/ctx03/items.json`:
   demand with formula, operands and unit; capacity from a `HW` characteristic or a
   `LIM`, with its `SRC`; the margin rule; `margin_actual`; the verdict from
   `item-schema.md`.
3. **Capacity must be cited.** A capacity not inside a datasheet snapshot or a
   `LIM` makes the verdict `unverified`; it never passes. Where a measured
   throughput is not published, say so, leave `unverified`, and mark the row for a
   `hardware-qualification` test in `cb-test-design`.
4. **Ctx 02 open points.** For each `OP-nn`, close it if a snapshot or a
   derivation now settles it (for example the board's maximum operating
   temperature from its snapshot compared with the maximum ambient of the
   environment `LIM` plus the enclosure rise written as `propuesto`); otherwise
   keep it `open` with the qualification test that will close it. Update
   `closed_by`, `state`.
5. **RF level** (when the architecture has an RF chain): chain the cited gains,
   losses and limits from antenna to SDR input in dB and dBm, compare the maximum
   expected input with the SDR and front-end limits, and the minimum detectable
   level with the noise figure chain. Write the sum as a table, one line per stage.
6. **Verdicts and action.**
   - `fits`: continue.
   - `tight`: continue with a warning and a one-line reasoned decision.
   - `exceeds` or an avoidable `unverified`: apply the remedy ladder of
     `references/parameter-rules.md` section 5. In `provisional` mode the ladder
     feeds back into `cb-hardware-options` (choose a different reference, if the
     cause is hardware chosen here). In `final` mode it re-enters the owning module.
   - Escalate `V1`, `R2`, `R1` or `R0` as the ladder says; emit `ESCALATION`.
7. Add each row's `uses` and link each `PAR` `hw_check` to its `RB`.
8. Append the budget table to `results/ctx03/substages/03.2.md` (provisional) or
   write `results/ctx03/substages/03.5.md` budget section (final).

## Output format

`results/ctx03/items.json` (`budget`, `open_points`), budget sections of the
substage files. Verdicts are evidence for G03-7.

## Do not

- Do not pass a row whose capacity is not cited, or hide an `exceeds`.
- Do not weaken or relax an `AC` to make a row fit.
- Do not change the Ctx 02 SDR or board: `escalate:R2`.
- Do not present a provisional estimate as final.
- Do not use any figure that is not cited or derived with its operation.
- Do not load any fixture or example dataset.

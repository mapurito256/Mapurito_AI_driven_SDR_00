# parameter-rules.md — how a value is chosen, checked and recorded

Applies to every `PAR`, every number in a procedure and every budget row. The
agent decides the values Ctx 03 owns; these rules keep each decision anchored,
visible and consistent with the hardware.

## 1. Anchoring ladder (in this order)

1. **Given.** The value is in a `LIM`, `REQ`, `AC`, a Ctx 02 item, a datasheet
   snapshot or a human answer: `declarado`, quote it.
2. **Computed.** It follows from given values with no free choice: `derivado`,
   write the operation with every operand and unit.
3. **Chosen.** Nothing anchors it: `propuesto`. Mandatory fields: `rationale`,
   `range`, `sensitivity`, and the budget check below.

A chosen value that can change the verdict of an `AC` is `critical: true`.

## 2. Choosing among candidate values (quality, time, resources)

For a `critical` parameter, or any choice with a cost on compute or resources:

1. Write the quality metric the `AC` measures and its threshold.
2. List at most three candidate values. For each, write in one unit each: the
   effect on the metric, the compute demand, the memory demand.
3. Discard candidates that do not meet the `AC` threshold with margin.
4. Among survivors, apply `references/mvp-criteria.md` order: meets every
   mandatory `REQ`/`LIM`, fewest resources, reversibility. Pick the cheapest
   candidate that still meets the `AC` with margin.
5. If no candidate fits the hardware, do not weaken the `AC`: follow the remedy
   ladder (section 5).
6. If two candidates both meet the `AC` and fit, and the choice trades something
   the human owns (cost, risk, sensitivity versus time), it is a `decision`
   question (`cb-gap-questions`); the agent proceeds with the cheapest as
   `provisional`.

## 3. Units, ranges and conventions

- Every value has a unit from the closed dimensions of `item-schema.md`; ratios
  in dB, levels in dBm, dimensionless explicit.
- State the reference of every level (for example full scale or a calibrated
  plane) and the sign convention. The same quantity has one unit across the
  package.
- `range` is the interval in which the value keeps the `AC` and the hardware fit
  valid; its ends are derived or cited, not guessed.
- Round only at the end of a derivation and state the rounding direction (up for
  resources, as the safe side for time and memory).
- No hidden constants: a number in a procedure or equation is a `PAR` or a cited
  fact.

## 4. Budget rows (`budget` list of `items.json`)

Each resource a parameter touches gets a row `RB-nn`:

| Field | Rule |
|---|---|
| `resource` | `compute` · `memory` · `storage` · `io-throughput` · `thermal` · `power` · `rf-level` · `time` |
| `mode` | `provisional` (03.2) or `final` (03.5) |
| `demand` | `{formula, operands, value, unit}`, operands cite `PAR`, `REQ`, `LIM` ids |
| `capacity` | `{value, unit, source}`; the source is a snapshot of `HW` or a `LIM`; a capacity without a source makes the verdict `unverified` |
| `margin_rule` | the planning margin applied, `propuesto`; defaults below |
| `margin_actual` | `1 - demand / capacity`, in percent |
| `verdict` | `fits` (demand within capacity and margin kept) · `tight` (within capacity, margin not kept) · `exceeds` · `unverified` |
| `uses` | the `PAR` ids and `HW` ids involved |

Default planning margins, `propuesto`, shown in the validation document so the
person can change them: sustained compute 30 %; memory 20 %; storage 20 %;
interface throughput 25 %; time deadline 30 %; thermal headroom 10 °C below the
cited operating limit; RF level headroom as the cited front-end limits allow.
A different margin needs its own rationale.

Compute demand is an operation count per frame (written from the equations) times
the frame rate, compared with a cited throughput of the board; when no cited
throughput exists the verdict is `unverified` and a `hardware-qualification` test
measures it (`cb-test-design`). `tight` is a warning plus a reasoned decision;
`exceeds` and `unverified` at V2 follow the remedy ladder or stay visible as a
`FAIL` or warning in the gate.

## 5. Remedy ladder when a budget does not fit

1. Adjust a non-critical parameter inside its `range`.
2. Adjust a critical parameter inside the bounds of the `LIM` and `AC` (never
   weaken or relax the `AC`).
3. Change the method inside the Ctx 02 estimator or detector family, if the
   spec's class allows it.
4. If steps 1–3 fail and the cause is hardware chosen here: `escalate:V1`
   (reopens 03.2; consumes one V1 round, only if one remains).
5. If the cause is the SDR or board fixed by Ctx 02, or the architecture:
   `escalate:R2`. If the `AC` cannot be met by any option: `escalate:R1`.
   Scope: `escalate:R0`.

## 6. What the package never contains

Executable code or scripts, measurement results, a value without a unit or a
`range`, the words `TBD`, `to be defined` or `TODO`, a remission such as "see the
Ctx 02 decision" instead of the value, or a figure that is not cited or derived.

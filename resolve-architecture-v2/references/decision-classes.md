# decision-classes.md — what Ctx 02 must decide

A checklist, not a catalogue of answers. For each class, the stage either
records a `DEC` (with a `REQ`/`LIM` it serves) or records, with a reason, that the
class does not apply. A class that no `REQ` or `LIM` touches is not invented. A
`DEC` `class` field takes one of the class names below.

Every class stops at the Ctx 03 boundary: Ctx 02 decides *type, existence,
purpose, reference or characteristics*; Ctx 03 decides *parameters, values,
procedures and schemas*.

## Phase A (before V1)

| Class name | Decide | Stops before (Ctx 03) |
|---|---|---|
| `system-topology` | the minimum base architecture that covers the mandatory `REQ`: one host with one SDR, a host with an intermediate RF chain, or several nodes | per-node configuration |
| `functional-flow` | the end-to-end chain as functional blocks, without brands | interfaces with versioned schemas |
| `rf-element` | for each element of the RF front end, needed or not needed, with the reason; one record per element: antenna or antenna array, switch, RF protection, filter, low-noise amplifier, attenuator | selection and values of each element |
| `sdr-reference` | the SDR reference, from the options of 02.4 | gains, sample rate, configuration |
| `board-reference` | the compute-board reference, from the options of 02.4 | operating-system and runtime configuration |
| `support-hardware` | power, cabling, enclosure: characteristic card only | selection and values |

## Phase B (before V2)

| Class name | Decide | Stops before (Ctx 03) |
|---|---|---|
| `spectral-estimator` | the family of estimator and why | window size, overlap, units, behaviour on sample loss |
| `detector` | the family of detector and why | thresholds and their tuning |
| `calibration` | whether a calibration exists, what it calibrates and when it runs | its procedure, steps and parameters |
| `sweep-strategy` | the type of sweep or channel-visiting strategy | dwell, order, timing values |
| `inter-block-representation` | what representation passes between blocks | schemas, versions, errors, tests |
| `error-handling` | the strategy for failures at each boundary | codes, retries, limits |
| `storage` | what is stored, at what level and why | formats, retention values |
| `reporting` | what is reported and to whom | message layouts |
| `learned-model-need` | conditional; see below | everything the `sdr-modelo-*` and `sdr-dataset-*` skills produce |

## Conditional class: learned-model-need

The baseline is a classical algorithm. This class is active only if a `REQ`
demands an inference that a normalised measurement cannot cover. If active, Ctx
02 decides the need, the model family and the dataset route; Ctx 03 produces the
values with the `sdr-modelo-*` and `sdr-dataset-*` skills. If no `REQ` demands it,
the class is recorded as inactive with that statement and nothing else.

## Also check

- Every class touched by a `REQ` or `LIM` marked `architectural` has a `DEC`.
- Every Ctx 02 `DFR` of Ctx 01 is closed by a `DEC` (`closes`).
- Solutions named in the Ctx 00 "Registered solution suggestions" section enter as
  candidate alternatives of the matching class, never as decisions made.

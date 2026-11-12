# item-schema.md — fields, provenance and closed codes for Ctx 02

The single authority for the shape of every item and for every closed code the
stage uses. A skill names a code or a field by referring here; it does not
redefine one. If a skill and this file disagree, this file is correct. No skill
invents a code that is not in this file. All artifacts are in English.
Items live in `results/ctx02/items.json`, questions in `results/ctx02/questions.json` (see `records.md`).

## Item types (closed)

`DEC` · `CMP` · `DEP`. No other `type` value exists. Criteria and alternatives
are fields of a `DEC`; a characteristic card is a `CMP`.

## Provenance (closed, three values)

- `declarado` — literally in the cited source, in a datasheet snapshot, or in a
  human answer (cites the `Q-id`). A value not inside the literal `cita` is never
  `declarado`.
- `derivado` — computed from cited material with no free choice; the operation is
  written out next to the value.
- `propuesto` — the agent chose it because nothing anchored it. Listed for the
  human; never carries a `cita`.

## DEC (decision)

| Field | Values / rule |
|---|---|
| `id` | `DEC-nn` |
| `class` | a class name from `references/decision-classes.md` |
| `substage` | `02.2` … `02.7` |
| `question` | what is being decided, one line |
| `reqs` | list of `REQ`/`LIM` ids it serves; never empty |
| `criteria` | list of `{id, kind, derives_from, levels}`; `kind` `eliminatory` or `ordinal`; an ordinal criterion defines its three levels in text, `1` worst to `3` best, never summed |
| `alternatives` | list of `{id, summary, source}`; two or more, or `dominance` below |
| `dominance` | statement that the single option passes every eliminatory criterion and is no worse than any plausible alternative on every ordinal one; the discarded alternatives are listed with their cause |
| `cells` | list of `{alternative, criterion, verdict, values, cita, reason}`; eliminatory `verdict` is `pass`/`fail`/`unverified`; ordinal `verdict` is a level `1`–`3`; `values` writes both sides in one unit |
| `robustness` | one line: would the result change if the most debatable criterion were ignored |
| `chosen` | the alternative id (for an RF element: `needed` or `not-needed`) |
| `needed_reason` | RF elements only: why the element is or is not needed |
| `recommendation` | optional, `propuesto`; the human decides |
| `procedencia` | the three values above |
| `figures` | list of `{value, unit, procedencia, cita, derivation}`; empty when no figure appears |
| `closes` | `DFR` ids of Ctx 01 closed by this decision |
| `locked_v1` | true once V1 approves it (hardware, flow, RF path) |
| `forced` | absent, `true` (human forced closure) or `by-limit` (need found from R3) |

## CMP (component)

| Field | Values / rule |
|---|---|
| `id` | `CMP-nn` |
| `name`, `function`, `chain_position` | what it does and where it sits |
| `realization` | `acquired-ref` (SDR or compute board, with a reference) · `acquired-spec` (characteristic card, no brand) · `software` |
| `reqs` | list of `REQ`/`LIM` ids it serves; never empty |
| `decided_by` | the `DEC` ids that produce it |
| `reference` | only for the SDR and the board: model plus `SRC-02-nn` snapshot; absent elsewhere |
| `characteristics` | required characteristics, each with its `REQ`/`LIM` derivation |
| `range` | only if derived from a source, with the operation; otherwise `TBD-Ctx03` |
| `closure_criterion` | required when `range` is `TBD-Ctx03` |
| `integration_note` | how it connects to its neighbours |
| `procedencia`, `figures`, `locked_v1`, `forced` | as in `DEC` |

## DEP (dependency)

| Field | Values / rule |
|---|---|
| `id` | `DEP-nn` |
| `from` | prerequisite `CMP` id (implemented first) |
| `to` | dependent `CMP` id |
| `reason` | one line citing the interface or data flow |
| `procedencia` | the three values above |

## Question (`results/ctx02/questions.json`)

| Field | Values / rule |
|---|---|
| `id` | `Q-02-nn` |
| `kind` | `gap` (a datum is missing) · `decision` (an important choice that belongs to the human) |
| `category` | `G-FLOW` · `G-RF` · `G-HW` · `G-INTERFACE` · `G-ENV` · `G-PERF` · `G-PROCESS` · `G-CONFLICT` |
| `gate` | `V1` · `V2` |
| `state` | `open` · `answered` · `closed-forced` |
| `forced` | absent, `true` or `by-limit` |
| `search` | the wordings searched and where (negative evidence) |
| `impact` | what it changes or blocks |
| `origin` | the substage that raised it |
| `answer` | the human text, cited by line |

Other lists: `themes` use `T-nn`; datasheet snapshots use `SRC-02-nn`.

## Closed code sets

| Set | Codes | Used by |
|---|---|---|
| Question discard | `already-stated` · `no-impact` · `derivable` | `ra-gap-questions` |
| Input disposition (`REQ`, `LIM`) | `architectural` · `detail-for-Ctx03` · `not-architectural` | `ra-admit-inputs`, `ra-coverage-contrast` |
| Integration disposition | `apply` · `no-op-confirmed` · `reject:<gate id>` · `defer:Ctx03` · `escalate:<V1\|R0\|R1>` · `not-locatable` | `ra-feedback-cycle` |
| Escalation | `V1` (reopen hardware) · `R0` (to Ctx 00) · `R1` (to Ctx 01) | `ra-feedback-cycle`, `ra-hardware-options` |
| Gate id | `G02-1` … `G02-8` | `ra-gate-check` |
| Gate verdict | `PASS` · `FAIL` · `NOT_EVALUABLE` | `ra-gate-check` |
| Human decision | `APROBAR` · `AJUSTAR` · `DETENER`; form directive `CERRAR_FORZADO: <Q-id>` | `ra-feedback-cycle` |
| Validation / presentation / phase | `V1` `V2` / `R1`–`R4` / `A` `B` | all |
| Stage status | `running` · `blocked` · `approved` · `stopped` · `returned_upstream` | `ra-feedback-cycle` |
| Question run mode | `input` · `design` | `ra-gap-questions` |
| Independent pass mode | `subagent` · `inline` | `ra-gap-questions`, `ra-coverage-contrast`, `ra-gate-check`, `ra-hardware-options` |
| Markers | `TBD-Ctx03` · `beyond-MVP` · `unverified` | see fields above |

`reject:<gate id>` names the gate the requested change would break. A `reject`,
`defer:Ctx03`, `escalate:*` or `not-locatable` row is shown to the human, never
dropped.

## Units

Compare only like dimensions: frequency, time, memory, power (dBm), ratio (dB),
dimensionless, count. Write both sides of a comparison in one unit. A unit
outside these dimensions is flagged by `ra-gate-check`, not guessed.

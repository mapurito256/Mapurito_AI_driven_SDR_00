# item-schema.md — fields, provenance and closed codes for Ctx 03

The single authority for the shape of every item and for every closed code the
stage uses. A skill names a code or a field by referring here; it does not
redefine one. If a skill and this file disagree, this file is correct. No skill
invents a code that is not in this file. All artifacts are in English.
Items live in `results/ctx03/items.json`, the register in
`results/ctx03/spec-register.json`, questions in `results/ctx03/questions.json`
(see `records.md`).

## Item types (closed)

`HW` · `PAR` · `PRC` · `SCH` · `ERR` · `TST` · `DEC`. No other `type` value
exists. A specification module (`SPEC`) is an entry of the register plus a file
in `results/ctx03/specs/`; it is not an item. Upstream types (`REQ`, `LIM`, `AC`,
`DFR`, and Ctx 02 `DEC`/`CMP`/`DEP`) are read-only and never copied into
`items.json` except as an id reference.

## Provenance (closed, three values)

- `declarado` — literally in the cited source (a `REQ`, `LIM`, `AC`, a Ctx 02
  item, a datasheet snapshot) or in a human answer (cites the `Q-id`). A value
  not inside the literal `cita` is never `declarado`.
- `derivado` — computed from cited material with no free choice; the operation
  is written out next to the value.
- `propuesto` — the agent chose it because nothing anchored it. Ctx 03 decides
  many values, so a `propuesto` value always carries `rationale` and
  `sensitivity`. Never carries a `cita`.

## SPEC (register entry, `spec-register.json` → `specs[]`)

| Field | Values / rule |
|---|---|
| `id` | `SPEC-nn` |
| `title` | one line |
| `kind` | `hardware` · `algorithm` · `procedure` · `interface` · `nfr` · `test` |
| `class` | a class name from `references/spec-classes.md` |
| `phase` | `A` (before V1: `hardware`) or `B` (all others) |
| `closes` | ids it closes: upstream `REQ`/`LIM`/`AC`/`DFR`, Ctx 02 `CMP` (for a `TBD-Ctx03` range) and Ctx 02 open points `OP-nn`; never empty |
| `ctx02_refs` | Ctx 02 `DEC`/`CMP` ids that fix its type and boundary |
| `depends_on` | `SPEC` ids whose output it consumes, with a reason in `dep_reasons` |
| `status` | `pending` · `in-progress` · `done` · `reopened` |
| `file` | `results/ctx03/specs/SPEC-nn.md` once started |
| `questions` | `Q-03-nn` ids with a provisional value used inside it |

`order` (top-level key) is the list of `SPEC` ids in implementation order, equal
to the `tsort` of the dependencies.

## HW (hardware reference, from 03.2)

| Field | Values / rule |
|---|---|
| `id` | `HW-nn` |
| `cmp` | the Ctx 02 `CMP` it realizes (never empty) |
| `category` | the function of the component, as in the `CMP` |
| `reference` | manufacturer, model, `SRC-03-nn` snapshot; catalogue product only |
| `alternatives_considered` | at most two entries `{id, reference, SRC}`; empty only with a dominance statement in the `DEC` |
| `characteristics` | list of `{name, value, unit, cita, serves}`; each value inside a snapshot extract |
| `interfaces` | connector, impedance or bus, power requirement, each cited |
| `range_closure` | how the Ctx 02 `TBD-Ctx03` range of the `CMP` is now closed |
| `procedencia`, `figures`, `locked_v1`, `forced` | as below |

The SDR and the compute board keep the reference fixed by Ctx 02; their `HW`
entry only copies it and adds the characteristics Ctx 03 needs.

## PAR (parameter)

| Field | Values / rule |
|---|---|
| `id` | `PAR-nn` |
| `spec` | owning `SPEC` id |
| `name` | unambiguous; the same name is never reused with another value |
| `value`, `unit` | both required; a count or ratio uses `dimensionless` or `count` |
| `range` | `{min, max, unit}`: the interval inside which the value stays valid |
| `rationale` | why this value: the anchor, or the trade-off decided |
| `sensitivity` | one line: what changes if the value moves to either end of `range` |
| `reqs` | `REQ`/`LIM`/`AC`/`DFR` ids it serves; never empty |
| `closes` | `DFR` ids or `CMP` ids (a `TBD-Ctx03` range) it closes |
| `hw_check` | `{resource, demand, capacity, unit}` pointing to a budget row `RB-nn`, or `n/a` with a reason |
| `critical` | true if changing it can change the verdict of an `AC` |
| `procedencia`, `cita`, `derivation`, `figures`, `forced` | as in this file |

## PRC (procedure)

| Field | Values / rule |
|---|---|
| `id` | `PRC-nn`; `spec` as above |
| `name`, `purpose` | one line each |
| `executor` | `software` · `operator` |
| `trigger` | event or schedule, with its interval and unit |
| `preconditions` | state, `HW` ids and `PAR` ids required |
| `steps` | ordered list `{n, action, pars, expected}`; each action is a single verifiable act |
| `duration` | `{value, unit}` |
| `acceptance` | rule with value, unit and operator, or `none` for a pure action |
| `outputs` | `SCH` ids written |
| `failure_exits` | `ERR` ids |
| `reproducibility` | what must be identical across sites and the comparison rule; `n/a` if the procedure is not site-dependent |
| `reqs`, `procedencia` | as above |

## SCH (schema)

| Field | Values / rule |
|---|---|
| `id` | `SCH-nn`; `spec` as above |
| `name`, `version` | `MAJOR.MINOR` text |
| `producer`, `consumer` | `CMP` or `SPEC` ids |
| `format` | serialization, encoding, byte order |
| `fields` | list `{name, type, unit, range, required, meaning}` |
| `compat_rule` | what changes are minor and what are major |
| `limits` | maximum size, rate or length, each with unit |
| `retention` | `{value, unit}` or `n/a` |
| `reqs`, `procedencia` | as above |

## ERR (error behaviour)

| Field | Values / rule |
|---|---|
| `id` | `ERR-nn`; `spec` as above |
| `code` | `E-<AREA>-<nnn>`; unique in the package |
| `condition` | the detectable event |
| `detect_by` | the check and its parameter ids |
| `response` | what the system does |
| `retries` | `{max, interval, unit, backoff}` or `none` |
| `limits` | the bound after which the response changes |
| `final_state` | state entered when the response ends |
| `reported_as` | `SCH` id of the message or record |
| `reqs`, `procedencia` | as above |

## TST (test)

| Field | Values / rule |
|---|---|
| `id` | `TST-nn` |
| `level` | `unit` · `integration` · `acceptance` · `hardware-qualification` · `procedure` |
| `for_ac` | the `AC` id; `null` only for levels other than `acceptance` |
| `for_req` | the `REQ`/`LIM` id; never empty |
| `metrica`, `operador`, `umbral`, `unidad`, `condicion` | for an acceptance test identical to the `AC`; a deferred threshold (`{dfr, horquilla}`) is replaced by the closed `PAR` value, cited |
| `method` | `test` · `analysis` · `inspection` · `demonstration`, as the `AC` |
| `cases` | list `{kind, input, expected}`; `kind` is `nominal`, `error` or `edge`; an acceptance test has all three |
| `vectors` | stimulus definitions; expected outputs derived by written arithmetic, or a generation rule with tolerance |
| `fails_if` | the defect this test would detect; required |
| `procedure` | `PRC` id that executes it, if any |
| `procedencia` | as above |

## DEC (decision with alternatives)

Used in 03.2 for hardware choices and in 03.3 for a parameter or method choice
with more than one plausible alternative.

| Field | Values / rule |
|---|---|
| `id`, `class`, `substage`, `question`, `reqs` | as Ctx 02 `DEC`; `class` is `hw-selection` or `design-choice` |
| `criteria` | list `{id, kind, derives_from, levels}`; `eliminatory` or `ordinal` (three levels, 1 worst, 3 best, never summed) |
| `alternatives` | list `{id, summary, source}`; **at most two**; or `dominance` instead |
| `dominance` | the single option passes every eliminatory criterion and is no worse on every ordinal one; discarded alternatives listed with their cause |
| `cells` | list `{alternative, criterion, verdict, values, cita, reason}`; eliminatory verdict `pass`/`fail`/`unverified`; ordinal verdict `1`–`3`; `values` writes both sides in one unit |
| `robustness` | one line |
| `chosen` | alternative id |
| `recommendation` | optional, `propuesto` |
| `procedencia`, `figures`, `locked_v1`, `forced` | as below |

## Common fields

| Field | Values / rule |
|---|---|
| `figures` | list `{value, unit, procedencia, cita, derivation}`; empty when no figure appears |
| `locked_v1` | true once V1 approves a `HW` or hardware `DEC` |
| `forced` | absent, `true` (human forced closure) or `by-limit` (need found from R3) |

## Other lists in `items.json`

| Key | Row |
|---|---|
| `dispositions` | `{upstream_id, disposition, reason}` for every `REQ`, `LIM`, `AC`, `DFR` |
| `open_points` | `{id: OP-nn, text, origin, closed_by, state}`; Ctx 02 points left unverified or travelling open, `state` is `open` or `closed` |
| `tbd_closure` | `{cmp, closed_by, how}` for every Ctx 02 `CMP` whose `range` was `TBD-Ctx03` |
| `dfr` | `{dfr_id, etapa_responsable, action}`; `action` is the closing `PAR` id, or `travels-intact` |
| `budget` | resource rows `RB-nn`, see `parameter-rules.md` |
| `blind_review` | `{upstream_id, proposed, agrees}` |
| `consumer_test` | `{question, needs_design_decision, resolved_by}` |
| `beyond_mvp` | `{text, reason}` |

## Question (`results/ctx03/questions.json`)

| Field | Values / rule |
|---|---|
| `id` | `Q-03-nn` |
| `kind` | `gap` (a datum is missing) · `decision` (an important choice that belongs to the human) |
| `category` | `G-INPUT` · `G-HW` · `G-ALGO` · `G-PARAM` · `G-PROC` · `G-SCHEMA` · `G-TEST` · `G-RESOURCE` · `G-CONFLICT` |
| `gate` | `V1` · `V2` |
| `state` | `open` · `answered` · `closed-forced` |
| `forced` | absent, `true` or `by-limit` |
| `provisional` | the value or option the agent used while the question is open, with the `SPEC` ids using it; absent for a pure gap |
| `options` | for `decision`: at most three options, each with its effect on quality, compute and resources in one unit |
| `search`, `impact`, `origin`, `answer` | as Ctx 02 (`origin` is a substage or a `SPEC` id) |

Other lists: `themes` use `T-nn`; datasheet snapshots use `SRC-03-nn`.

## Closed code sets

| Set | Codes | Used by |
|---|---|---|
| Question discard | `already-stated` · `no-impact` · `derivable` | `cb-gap-questions` |
| Input disposition (`REQ`, `LIM`, `AC`, `DFR`) | `specify` · `hardware` · `already-closed` · `not-applicable` | `cb-admit-analyze`, `cb-coverage-consistency` |
| Integration disposition | `apply` · `no-op-confirmed` · `reject:<gate id>` · `defer:build` · `escalate:<V1\|R0\|R1\|R2>` · `not-locatable` | `cb-feedback-cycle` |
| Escalation | `V1` (reopen hardware) · `R0` (to Ctx 00) · `R1` (to Ctx 01) · `R2` (to Ctx 02) | `cb-feedback-cycle`, `cb-admit-analyze`, `cb-hardware-options`, `cb-resource-budget`, `cb-coverage-consistency` |
| Gate id | `G03-1` … `G03-11` | `cb-gate-check` |
| Gate verdict | `PASS` · `FAIL` · `NOT_EVALUABLE` | `cb-gate-check` |
| Human decision | `APROBAR` · `AJUSTAR` · `DETENER`; form directive `CERRAR_FORZADO: <Q-id>` | `cb-feedback-cycle` |
| Validation / presentation / phase | `V1` `V2` / `R1`–`R4` / `A` `B` | all |
| Stage status | `running` · `blocked` · `approved` · `stopped` · `returned_upstream` | `cb-feedback-cycle` |
| Spec kind / status | see SPEC above | `cb-admit-analyze`, `cb-spec-module` |
| Budget verdict | `fits` · `tight` · `exceeds` · `unverified` | `cb-resource-budget` |
| Test level / case kind | see TST above | `cb-test-design` |
| Question run mode | `input` · `design` | `cb-gap-questions` |
| Independent pass mode | `subagent` · `inline` | `cb-gap-questions`, `cb-hardware-options`, `cb-coverage-consistency`, `cb-gate-check` |
| Markers | `beyond-MVP` · `unverified` · `provisional` | see fields above |

`defer:build` is only for a pure coding detail (naming, file layout inside a
module, language idioms) that the package deliberately leaves to the builder;
it never defers a value, procedure, schema or test. `reject:<gate id>` names the
gate the requested change would break. A `reject`, `defer:build`, `escalate:*`
or `not-locatable` row is shown to the human, never dropped.

## Units

Compare only like dimensions: frequency, time, memory, data rate, power (dBm),
ratio (dB), temperature (°C), dimensionless, count. Write both sides of a
comparison in one unit. A unit outside these dimensions is flagged by
`cb-gate-check`, not guessed.

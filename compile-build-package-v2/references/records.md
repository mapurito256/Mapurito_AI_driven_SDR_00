# records.md — folders, state, status view and event log for Ctx 03

Everything the stage produces is written to files, so any step, and the next
stage, reads its material without depending on context memory. This file fixes
the folder layout, `results/ctx03/state.json`, the status view, the register,
and the **thirteen** events of `results/ctx03/events.jsonl`. A skill emits only
the events named here, with these exact names.

## Folder layout (run folder `results/ctx03/`)

```
results/ctx03/
  state.json                    status, phase, rounds per validation, blocks, current spec
  STATUS.md                     reading view of the state, rewritten at each stop (not hashed)
  events.jsonl                  append-only; one event per line (thirteen types)
  questions.json                Q-03-nn; after creation only `state`, `answer`, `forced` change
  items.json                    HW, PAR, PRC, SCH, ERR, TST, DEC and the lists of item-schema.md
  spec-register.json            the specification register: SPEC entries and `order`
  sources/SRC-03-nn.md          datasheet snapshots (URL, access date, extract)
  substages/03.1.md ... 03.5.md
  substages/03.2-criteria.md    criteria file of 03.2, written before any comparison
  specs/SPEC-nn.md              one file per specification module (module-template.md)
  validations/
    V1/R<n>/hardware-proposal.md  feedback.md  integration.md
    V2/R<n>/final-spec.md         feedback.md  integration.md
  build-package-baseline.json   written only after APROBAR in V2
  build-package-baseline.sha256 its `sha256sum` line, written on approval
  build-package-baseline.md     reading copy of the approved JSON, written on approval
  final-spec.md                 approved V2 document, readable
  CONTEXT-ctx03.md              written on approval, stop and return
```

Inputs (read-only, owned by earlier stages), read in this order:
`results/ctx02/CONTEXT-ctx02.md`, `results/ctx02/architecture-baseline.json`,
`results/ctx02/final-design.md`, `results/ctx01/CONTEXT-ctx01.md`,
`results/ctx01/requirements-baseline.json`, `results/ctx01/record.json`,
`results/ctx00/problem-definition.md`, `results/ctx00/sources/SRC-nn.md`,
`results/ctx02/sources/SRC-02-nn.md`. Ctx 02 refers to Ctx 01 only by id; the
text, limits, acceptance criteria and `DFR` come from the Ctx 01 baseline. This
stage writes only under `results/ctx03/`.

## spec-register.json

Top-level keys: `stage` (`Ctx03`), `specs` (`SPEC` entries of `item-schema.md`),
`order` (ordered `SPEC` ids, equal to the `tsort` of `depends_on`), `grouping_notes`
(why units were merged or split, one line each). Created at 03.1; afterwards only
`status`, `file`, `questions` change, except when a feedback adds or merges a
`SPEC` (then the change is written in `integration.md`).

## state.json

| Field | Meaning |
|---|---|
| `stage`, `status`, `phase` | `Ctx03`; stage status and phase from `item-schema.md` |
| `inputs` | `{ctx02_baseline_sha256, ctx01_baseline_sha256, ctx00_doc_sha256}` admitted at 03.1 |
| `criteria_sha256` | map `substage -> sha256` of each criteria file, saved before comparing |
| `validation` | current validation, `V1` or `V2` |
| `V1`, `V2` | each `{presentation, feedbacks_used, question_runs_used, decision}`; `decision` is `pending` or a human decision |
| `blocked_by` | open `Q-03-nn` ids and failed gates that block approval, or empty |
| `v1_locked_sha256` | hash of the items with `locked_v1: true`, taken at V1 approval |
| `current_spec` | the `SPEC` in progress, or null |
| `register_progress` | `{done, total}` over the register |
| `feedback_history` | list `{validation, presentation, decision, ts}`, one row per human feedback |
| `next_action` | one line: the next step and the skill to load; lets a fresh session resume |
| `escalation` | `V1`, `R0`, `R1`, `R2` or absent |

The orchestrator updates `state.json` after every substage, every `SPEC_DONE` and
every human decision. `next_action` is rewritten each time.

## STATUS.md (reading view)

Rewritten by the orchestrator from `state.json`, `spec-register.json` and the last
events whenever it updates the state at a stop. For a person; it never enters
hashes, gates or events. Sections: status and phase; validation counters
(presentation, feedbacks used of three, question runs used); the table of
`SPEC` (id, title, kind, status); blockers; the last ten events; `next_action`.

## events.jsonl — the thirteen events (closed)

One JSON object per line. Every event carries `ts`, `event`, `validation`
(`V1`, `V2` or null before V1), `presentation` and `tokens` (a number only if the
environment reports it; otherwise `not-measured`). The substage or spec file is
written before its closing event; a missing event means the step did not finish.

| # | `event` | Emitted by | Carries |
|---|---|---|---|
| 1 | `STAGE_START` | `cb-admit-analyze` | input hashes and the admission checks |
| 2 | `REGISTER_ISSUED` | `cb-admit-analyze` | register path, count of `SPEC` by kind, order |
| 3 | `SUBSTAGE_END` | the orchestrator | substage id and file written |
| 4 | `QUESTION_RUN` | `cb-gap-questions` | mode, ids raised, `not_asked` count, pass mode |
| 5 | `SPEC_START` | `cb-spec-module` | `SPEC` id, kind, dependencies done |
| 6 | `SPEC_DONE` | `cb-spec-module` | `SPEC` id, file, ids of `PAR`/`PRC`/`SCH`/`ERR` written, provisional questions |
| 7 | `GATE_RESULT` | `cb-gate-check` | validation and verdict plus evidence per gate |
| 8 | `VALIDATION_ISSUED` | `cb-validation-report` | document path, validation, presentation |
| 9 | `HUMAN_FEEDBACK` | `cb-feedback-cycle` | decision, answers and themes read |
| 10 | `INTEGRATION_ISSUED` | `cb-feedback-cycle` | `integration.md` path; rows by disposition |
| 11 | `VALIDATION_APPROVED` | `cb-feedback-cycle` | validation; locked hash for V1 |
| 12 | `STAGE_APPROVED` | `cb-feedback-cycle` | baseline path and hash; forced closures |
| 13 | `ESCALATION` | `cb-admit-analyze`, `cb-hardware-options`, `cb-resource-budget`, `cb-coverage-consistency`, `cb-feedback-cycle` | code `V1`/`R0`/`R1`/`R2` and reason |

A `DETENER` is recorded by `HUMAN_FEEDBACK` plus `status: stopped`; no other
event exists for it.

## build-package-baseline.json

Top-level keys: `stage` (`Ctx03`), `status` (`approved`), `decision`, `signer`,
`date`, `inputs` (the three input hashes), `items` (the `items.json` items),
`lists` (`dispositions`, `open_points`, `tbd_closure`, `dfr`, `budget`,
`beyond_mvp`), `register` (the `spec-register.json` content), `manifest` (list
`{path, sha256}` of every file under `results/ctx03/specs/`, `results/ctx03/sources/`
and `results/ctx03/final-spec.md`, taken with `sha256sum` at approval).

## Reading copy: build-package-baseline.md

Written by `cb-feedback-cycle` on `APROBAR` in V2, immediately after the JSON and
its `.sha256`. For a person; derived only from the approved JSON, no new
information, never enters hashes, gates, `state.json` or events. An empty list
reads `none`. Sections, in this order:

1. Decision, signer and date.
2. Hardware: each `HW` with its `CMP`, reference, chosen option, alternatives.
3. Specification index: each `SPEC` in `order`, kind, and the ids it closes.
4. Parameters: each `PAR` as name, value, unit, range, `critical`, provenance.
5. Procedures, schemas and error codes: id, name and one line each.
6. Tests: each acceptance `TST` against its `AC` (threshold side by side).
7. Resource budget: each `RB` row with verdict.
8. Closures: `tbd_closure`, `dfr`, and `open_points`.
9. Forced closures and `beyond_mvp`.

## CONTEXT-ctx03.md

Written by `cb-feedback-cycle` on approval, stop and return. It lists the path and
sha256 of what it hands over (`results/ctx03/build-package-baseline.json`, its
`.sha256`, `results/ctx03/final-spec.md`), as `results/ctx02/CONTEXT-ctx02.md`
does. It is the only file the implementation stage reads first (layout in
`references/templates.md`).

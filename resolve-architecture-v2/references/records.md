# records.md — folders, state and event log for Ctx 02

Everything the stage produces is written to files, so Ctx 03 reads the result
without depending on context memory. This file fixes the folder layout, the
shape of `results/ctx02/state.json`, and the **ten** events of `results/ctx02/events.jsonl`. A skill emits
only the events named here, with these exact names.

## Folder layout (run folder `results/ctx02/`)

```
results/ctx02/
  state.json                   status, phase, rounds per validation, blocks
  events.jsonl                 append-only; one event per line (ten types)
  questions.json               Q-02-nn; after creation only `state`, `answer`, `forced` change
  items.json                   DEC, CMP, DEP; edited by id
  sources/SRC-02-nn.md         datasheet snapshots (URL, access date, extract)
  substages/02.1.md ... 02.7.md
  substages/02.<n>-criteria.md criteria file of a substage that compares alternatives
  validations/
    V1/R<n>/hardware-proposal.md  feedback.md  integration.md
    V2/R<n>/final-design.md       feedback.md  integration.md
  architecture-baseline.json   written only after APROBAR in V2
  architecture-baseline.sha256 its `sha256sum` line, written on approval
  architecture-baseline.md     reading copy of the approved JSON, written on approval
  final-design.md              approved version, readable
  CONTEXT-ctx02.md             written on approval, stop and return
```

Inputs (read-only, owned by earlier stages), read in this order:
`results/ctx01/CONTEXT-ctx01.md`, `results/ctx01/requirements-baseline.json`,
`results/ctx01/record.json`, `results/ctx01/state.json`,
`results/ctx00/problem-definition.md`, `results/ctx00/sources/SRC-nn.md`.
This stage writes only under `results/ctx02/`.

## items.json

Top-level keys: `stage` (`Ctx02`), `items` (`DEC`/`CMP`/`DEP` of
`item-schema.md`), `dispositions` (`{upstream_id, disposition, reason}` for every
`REQ`, `LIM`), `dfr` (`{dfr_id, etapa_responsable, action}`; `action` is the
closing `DEC` id, or `travels-intact`), `beyond_mvp` (`{text, reason}`),
`blind_review` (`{upstream_id, proposed, agrees}`), `plan` (ordered `CMP` ids).

## questions.json

`questions` (the `Q-02-nn` objects), `candidates` (every candidate with
`survived` or its discard code and the search record), `not_asked` (survivors
beyond the cap, ranked).

## state.json

| Field | Meaning |
|---|---|
| `stage`, `status`, `phase` | `Ctx02`; stage status and phase from `item-schema.md` |
| `inputs` | `{baseline_sha256, ctx00_doc_sha256}` admitted at 02.1 |
| `criteria_sha256` | map `substage -> sha256` of each criteria file, saved before comparing |
| `validation` | current validation, `V1` or `V2` |
| `V1`, `V2` | each `{presentation, feedbacks_used, question_runs_used, decision}`; `decision` is `pending` or a human decision |
| `blocked_by` | open `Q-02-nn` ids and failed gates that block approval, or empty |
| `v1_locked_sha256` | hash of the items with `locked_v1: true`, taken at V1 approval |
| `escalation` | `V1`, `R0`, `R1` or absent |

## events.jsonl — the ten events (closed)

One JSON object per line. Every event carries `ts`, `event`, `validation`
(`V1`, `V2` or null before V1), `presentation` and `tokens` (a number only if the
environment reports it; otherwise `not-measured`). The substage file is written
before its `SUBSTAGE_END`; a missing event means the substage did not finish.

| # | `event` | Emitted by | Carries |
|---|---|---|---|
| 1 | `STAGE_START` | `ra-admit-inputs` | input hashes and the admission checks |
| 2 | `SUBSTAGE_END` | the orchestrator | substage id and file written |
| 3 | `QUESTION_RUN` | `ra-gap-questions` | mode, ids raised, `not_asked` count, pass mode |
| 4 | `GATE_RESULT` | `ra-gate-check` | validation and verdict plus evidence per gate |
| 5 | `VALIDATION_ISSUED` | `ra-validation-report` | document path, validation, presentation |
| 6 | `HUMAN_FEEDBACK` | `ra-feedback-cycle` | decision, answers and themes read |
| 7 | `INTEGRATION_ISSUED` | `ra-feedback-cycle` | `integration.md` path; rows by disposition |
| 8 | `VALIDATION_APPROVED` | `ra-feedback-cycle` | validation; locked hash for V1 |
| 9 | `STAGE_APPROVED` | `ra-feedback-cycle` | baseline path and hash; forced closures |
| 10 | `ESCALATION` | `ra-admit-inputs`, `ra-hardware-options`, `ra-feedback-cycle` | code `V1`/`R0`/`R1` and reason |

A `DETENER` is recorded by `HUMAN_FEEDBACK` plus `status: stopped`; no other
event exists for it.

## Reading copy: architecture-baseline.md

Written by `ra-feedback-cycle` on `APROBAR` in V2, immediately after
`results/ctx02/architecture-baseline.json` and its `.sha256`, to
`results/ctx02/architecture-baseline.md`. It is for a person to read and is derived
only from the approved JSON: no new information and no reinterpretation. It does
not enter hashes, gates, `state.json` or events, and it never modifies the JSON or
the `.sha256`. An empty list reads `none`. Sections, in this order:

1. Decision, signer and date, as recorded in the JSON.
2. Decisions: `DEC` id, what was decided, chosen option, alternatives and the
   reason as the JSON states it (`needed_reason`, `dominance` or the reason of the
   chosen alternative), not rewritten.
3. Components: `CMP` id, name, function, realization and the `REQ`/`LIM` it serves.
4. Dependencies and plan order: each `DEP` as `from` to `to`, then the `plan` order.
5. Deferrals closed: each `DFR` id with the `DEC` id that closes it, and those that
   travel intact.
6. Forced closures: each item marked `forced`, with its value.
7. `TBD-Ctx03` elements: each `CMP` whose `range` is `TBD-Ctx03`, with its
   `closure_criterion`.
8. `beyond_mvp`: each entry with its reason.

Omit what a person cannot read: criteria and `cells` matrices, `figures`,
`cita`, `SRC-02-nn` citations, `locked_v1` and raw JSON fields. Keep the `REQ`,
`LIM`, `DFR`, `DEC` and `CMP` ids as cross-references.

## CONTEXT-ctx02.md

Written by `ra-feedback-cycle` to `results/ctx02/CONTEXT-ctx02.md` on approval, stop and return. It lists the path and sha256 of what it hands over (`results/ctx02/architecture-baseline.json` and its `.sha256`, `results/ctx02/final-design.md`), as `results/ctx00/CONTEXT-ctx00.md` does. It is the only file
the Ctx 03 agent reads first (layout in `references/templates.md`).

# records.md — folder structure, state and event log for Ctx 01

Everything the stage produces is written to files, so the next stage reads the
result without depending on context memory. This file fixes the folder layout,
the shape of `results/ctx01/state.json`, and the **nine** events of `results/ctx01/events.jsonl`. A skill
emits only the events named here, with these exact names.

## Folder layout

```
results/ctx00/                 read-only input (written by Ctx 00)
  CONTEXT-ctx00.md             read first
  problem-baseline.json        frozen Ctx 00 baseline
  problem-baseline.sha256      its `sha256sum` line
  problem-definition.md        the approved readable document (hash-linked)
  intake.md                    the numbered statements (text of each `STM`)
  sources/                     `SRC-nn.md` snapshots
results/ctx01/                 written by this stage
  record.json                  working items: REQ/LIM/AC/DFR/OQ + lists below
  state.json                   counters, current round, decision, open DFR
  events.jsonl                 append-only; one event per line (nine types)
  rounds/
    O<n>/
      dee.md                   the DEE for output O<n>
      response-form.md         the person's answers and themes for round n
      improvement-plan.md      the plan built from round n feedback
  requirements-baseline.json   frozen on approval
  requirements-baseline.sha256 its `sha256sum` line, written on freeze
  requirements-baseline.md     reading copy of the frozen JSON, written on freeze
  CONTEXT-ctx01.md             hand-off context for Ctx 02
```

## results/ctx01/record.json

Top-level keys: `stage` (`Ctx01`), `upstream_baseline_hash` (the JSON's hash from `results/ctx00/problem-baseline.sha256`), `guardrails_sha256` (sha256 of `pipeline-layout/guardrails.md` at admission), `items` (the
`REQ`/`LIM`/`AC`/`DFR`/`OQ` objects of `item-schema.md`), `exclusions`
(`{upstream_id, code, cita}`), `discards` (`{stm, code, cita, detail}`),
`downgrades` (`{item, field, from, to}`), `omission_candidates`
(`{id, anchor_id, category, cita, disposition}`), `not_asked`
(question candidates not raised this run, with their discard note).

## results/ctx01/state.json

| Field | Meaning |
|---|---|
| `stage` | `Ctx01` |
| `upstream_baseline_hash` | the hash of `problem-baseline.json` read from `results/ctx00/problem-baseline.sha256` |
| `round` | current output index `O<n>`, 1..6 |
| `question_runs_used` | new-question runs used, of 2 |
| `decision` | `pending` · `APROBAR` · `AJUSTAR` · `DETENER`; only the human decision, never the computed verdict |
| `open_dfr` | list of open `DFR` ids |
| `not_acceptable_until_closure` | computed list reaching every open `DFR` |

### Initialization and resume

On a new run after upstream-only admission passes, initialize `record.json` with
`stage: Ctx01`, the verified `upstream_baseline_hash` and `guardrails_sha256`, and
empty `items`, `exclusions`, `discards`, `downgrades`, `omission_candidates`, and
`not_asked` arrays. Initialize state with the same upstream hash, `round: 1`,
`question_runs_used: 0`, `decision: pending`, and empty `open_dfr` and
`not_acceptable_until_closure`. Create the empty event log once; append
`admission_checked` before raising questions. Seeded REQs are written at 01.2,
not required of an empty 01.1 record.

On resume, compare the actual files, event sequence and current round before any
write. Do not reset counters, truncate logs, duplicate feedback or reinitialize
missing files in a partially populated directory. The owning step can finish a
documented partial action from evidence; ambiguous or contradictory evidence
requires a stop and reconciliation with the person.

### Human decisions, verdicts and older records

The computed gate verdict is `SEGUIR` or `AJUSTAR`; it is not a human decision.
`open_dfr` and `not_acceptable_until_closure` record technical obligations without
introducing a second approval type. New freezes store `decision: APROBAR`, signer
and date, with the DFR list visible in the reviewed DEE and handoff.

Read-only compatibility: an existing `APROBAR_CON_APLAZAMIENTO` decision may count
as approval only with the original signed human response, passing gate evidence,
closed OQ, frozen baseline, event and matching hash. An older `SEGUIR` value is a
computed verdict, never sufficient proof of human approval. Missing or conflicting
evidence stops admission for human reconciliation. Do not rewrite old frozen
records, rehash them to repair a mismatch, or invent missing history.

## results/ctx01/events.jsonl — the nine events (closed)

One JSON object per line. Every event carries `ts`, `event`, `round`. No other
event name is emitted; the token/model-call event of v1 is removed because the
agent cannot measure its own tokens reliably (a run may record `tokens:
not-measured`).

| # | `event` | Emitted by | Carries |
|---|---|---|---|
| 1 | `admission_checked` | orchestrator (01.1) | hash/frozen/closed-OQ/seeded verdict |
| 2 | `items_drafted` | `sr-draft-items` | ids written or edited, with provenance |
| 3 | `questions_raised` | `sr-gap-questions` | `OQ` ids asked; count in `not_asked` |
| 4 | `coverage_contrasted` | `sr-coverage-contrast` | coverage table; independent-pass mode |
| 5 | `gate_evaluated` | `sr-gate-check` | per-gate verdict and evidence |
| 6 | `dee_emitted` | `sr-dee-report` | DEE path; candidate baseline hash |
| 7 | `feedback_received` | `sr-feedback-cycle` | reviewed round; human decision, signer when given, response form path; answers/themes read |
| 8 | `improvement_planned` | `sr-improvement-plan` | plan path; rows by disposition |
| 9 | `baseline_frozen` | orchestrator (01.7) | signer; decision; frozen hash |

## Reading copy: requirements-baseline.md

Written on freeze to `results/ctx01/requirements-baseline.md`, immediately after
`results/ctx01/requirements-baseline.json` and its `.sha256`. It is for a person
to read and is derived only from the frozen JSON: no new information and no
reinterpretation. It does not enter hashes, gates, `state.json` or events, and it
never modifies the JSON or the `.sha256`. An empty list reads `none`. Sections, in
this order:

1. Decision, signer and date, as recorded in the JSON.
2. Requirements: `REQ` id, subtype, text, provenance.
3. Limits: `LIM` id and its statement.
4. Acceptance criteria: `AC` id, the `REQ` it accepts, and the criterion.
5. Open deferrals: `DFR` id, governing `REQ`, bracket and closure criterion.
6. Exclusions, discards and downgrades, each with its reason.

Omit what a person cannot read: `STM` listings, per-item hashes and source
citations (`cita`, `cita_ref`), internal flags (`sembrado`, `guardrail_id`) and
raw JSON fields. Keep the `REQ`, `LIM`, `AC` and `DFR` ids as cross-references.

## Hand-off: CONTEXT-ctx01.md

Written on freeze to `results/ctx01/CONTEXT-ctx01.md`. Lists the path and sha256 of what it hands over (`results/ctx01/requirements-baseline.json` and its `.sha256`), as `results/ctx00/CONTEXT-ctx00.md` does. Carries the frozen requirements and limits, the acceptance
criteria, the open deferrals with their brackets and the "not acceptable until
closure" set, the discards and downgrades, and the gate-1 decision with its
signer. This file, not context memory, is what Ctx 02 reads first.

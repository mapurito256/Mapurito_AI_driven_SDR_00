---
name: resolve-architecture-v2
description: Ctx 02 — turn the approved Ctx 01 requirements baseline into a reviewed system architecture, a hardware reference for the SDR and the compute board, characteristic cards for everything else, and an implementation plan, with two human validations (V1 hardware, V2 final design). This is the only entry point; it loads the ra-* skills one at a time.
---

# resolve-architecture-v2 — Ctx 02 (architecture and hardware)

Ctx 02 designs the architecture and selects hardware references from what Ctx 00
and Ctx 01 delivered. No program validates or decides: the agent drafts and judges
by following the ra-* skills, mechanical facts are checked with shell commands
(`sha256sum`, `jq`, `grep`, `tsort`), and a person decides at V1 and V2.

This skill orchestrates. It holds the order, the rounds, the invariants and the
stop rules. The detail of each step lives in its skill. No skill reads `evals/`.

## Invariants (do not negotiate)

1. Ctx 02 designs architecture and selects hardware references. It does not
   specify procedures or parameters (Ctx 03) and does not invent requirements
   (Ctx 01).
2. Nothing is invented. A value is `declarado` only if it is literally in the
   cited source, in a datasheet snapshot, or in a human answer. Otherwise it is
   `derivado` (operation written out) or `propuesto`.
3. No model approves its own output. Only the human decides at V1 and V2.
4. No Ctx 00 or Ctx 01 item is modified.
5. Nothing is dropped silently: every `REQ`/`LIM`/`DFR`, question and feedback
   topic has a recorded disposition.
6. Hardware is bought, not designed. Only the SDR and the compute board get a
   reference; everything else gets a characteristic card.
7. Criteria are written and saved before alternatives are compared.
8. Minimum viable product: every component cites a `REQ`; nice-to-haves go to
   `beyond-MVP` (`references/mvp-criteria.md`).
9. A figure enters only if cited from a `REQ`, a `LIM` or a datasheet, or is its
   written derivation.
10. Do not load or imitate evaluation material.

Every artifact is in English. Fields and closed codes: `references/item-schema.md`.
Folders, `results/ctx02/state.json`, the ten events: `references/records.md`. Forms:
`references/templates.md`. What must be decided: `references/decision-classes.md`.

## Working files

Paths follow the root skill `pipeline-layout`.

## Skills (load one at a time, from `skills/<name>/SKILL.md`)

| Skill | Role |
|---|---|
| `ra-admit-inputs` | 02.1 reading inputs, shell checks, disposition of each `REQ`/`LIM`/`DFR` |
| `ra-gap-questions` | gaps and decisions as questions, three tests, `input` and `design` modes |
| `ra-design-flow` | 02.2 flow and base architecture; 02.3 RF path and cards |
| `ra-hardware-options` | 02.4 criteria, comparison method, options, datasheet snapshots |
| `ra-sw-architecture` | 02.5 procedure, algorithm and process types |
| `ra-components-plan` | 02.6 `CMP`, `DEP`, plan with `tsort` |
| `ra-coverage-contrast` | coverage both ways, `DFR` closure, blind review |
| `ra-gate-check` | gates G02-1 to G02-8 for V1 and V2 |
| `ra-validation-report` | V1 and V2 documents and the response form |
| `ra-feedback-cycle` | feedback, rounds, blocking, forced closure, integration, approval, close-out |

## Run procedure

Write each substage file before emitting its `SUBSTAGE_END` (emitted here).
1. **02.1** `ra-admit-inputs` (emits `STAGE_START`), then `ra-gap-questions` in
   `input` mode. Writes `results/ctx02/substages/02.1.md`, `results/ctx02/questions.json`.
2. **02.2** `ra-design-flow` (flow and minimal base architecture).
3. **02.3** `ra-design-flow` (RF path and characteristic cards).
4. **02.4** `ra-hardware-options`; then `ra-gap-questions` in `design` mode;
   `ra-gate-check` (V1); `ra-validation-report` (V1).
5. **V1 — stop.** A person answers. Load `ra-feedback-cycle`. `AJUSTAR` re-enters
   at the substage named in `integration.md`; `APROBAR` (accepted only if
   unblocked) locks the approved items and opens phase B.
6. **02.5** `ra-sw-architecture`. 7. **02.6** `ra-components-plan`.
8. **02.7** `ra-coverage-contrast`; `ra-gap-questions` (`design`); `ra-gate-check`
   (V2); `ra-validation-report` (V2).
9. **V2 — stop.** `ra-feedback-cycle`. `APROBAR` writes
   `results/ctx02/architecture-baseline.json`, `results/ctx02/architecture-baseline.sha256`,
   `results/ctx02/architecture-baseline.md` (reading copy, see `references/records.md`),
   `results/ctx02/final-design.md` and
   `results/ctx02/CONTEXT-ctx02.md`. A change that touches approved hardware is `escalate:V1`.

When a decision has more than one plausible alternative, apply the comparison
method of `ra-hardware-options`, with a criteria file per substage.

## Rounds (per validation; identical in `ra-feedback-cycle`)

| Presentation | New questions | What the human may submit |
|---|---|---|
| R1 (first document of the validation) | Yes (run 1) | Answers, themes and decision |
| R2 (after F1) | Yes (run 2) | Answers, themes and decision |
| R3 (after F2) | No | Answers, themes and decision |
| R4 (after F3) | No | Only `APROBAR` or `DETENER`, no new themes |

- Three adjustment feedbacks per validation (V1 and V2 separately, up to six).
- At most 8 new questions per run (all passes that produce one presentation).
- `ra-feedback-cycle` owns this table and must not diverge from it.

## Stops, blocking and escalation

- **Blocking.** While a question with the gate of this validation is `open`, or a
  gate is `FAIL`, `APROBAR` is not accepted; write `blocked_by` in `results/ctx02/state.json`
  and set `status: blocked`. The agent does not advance to the next phase.
- **Forced closure.** Only the human declares it (`CERRAR_FORZADO: <Q-id>`); the
  agent then decides by `references/mvp-criteria.md` and marks it `propuesto`,
  `forced: true`, highlighted in the next presentation.
- **Needs found from R3.** No new questions: propose the most viable option as
  `propuesto`, `forced: by-limit`, visible; the human accepts by approving or stops.
- **No answer at the limit.** The agent never closes questions on its own; the
  stage stays `blocked`. Every round needs a human action, so there is no loop.
- **Back-escalation.** If no purchasable combination meets a mandatory `REQ` or
  `LIM`, or a change touches the Ctx 00 scope, record `escalate:R1` or
  `escalate:R0`, set `status: returned_upstream` and write `results/ctx02/CONTEXT-ctx02.md`.
  Reopening V1 from V2 consumes one V1 round, only if one remains; otherwise the
  human decides `DETENER`. The V2 document reissued afterwards counts as the next
  V2 presentation.
- **Failed admission** stops the stage before 02.1 ends (see `ra-admit-inputs`).
- **Subagents** go through the Agent tool; if it is unavailable run `inline` and
  record the mode, which is weaker because the context is shared.

## Do not

- Do not hide a `FAIL`: try one correction and recheck; a `FAIL` that remains is
  shown in the document and blocks `APROBAR`.
- Do not relax a rule or gate wording to make a gate pass.
- Do not load more than one skill's detail at a time or any fixture or example.

---
name: compile-build-package-v2
description: Ctx 03 — turn the approved Ctx 02 architecture and the Ctx 01 requirements it cites into a build package: hardware references for every component beyond the SDR and the board, then a modular specification of every solution (algorithms with parameters and units, procedures, schemas, error codes, limits, retention) with consistency against the hardware and tests derived from each acceptance criterion, with two human validations (V1 hardware references, V2 final specification). This is the only entry point; it loads the cb-* skills one at a time.
---

# compile-build-package-v2 — Ctx 03 (specification and hardware references)

Ctx 03 takes what Ctx 02 approved (architecture, decisions, components,
dependencies, plan) together with the Ctx 01 requirements that Ctx 02 cites only
by id (text, limits, acceptance criteria, deferrals), and specifies how each
requirement is met in practice. It closes what Ctx 02 left open: components with
a `TBD-Ctx03` range, implementation deferrals and unverified points such as the
board's maximum operating temperature and its compute load. Its result is a
specification the builder can implement and validate without making design
decisions, without changing the architecture or the requirements.

No program validates or decides. The agent drafts and judges by following the
cb-* skills, mechanical facts are checked with shell one-liners (`sha256sum`,
`jq`, `grep`, `comm`, `tsort`), and a person decides at V1 and V2. No script is
written or kept.

This skill orchestrates. It holds the order, the rounds, the invariants and the
stop rules. The detail of each step lives in its skill. No skill reads `evals/`.

## Invariants (do not negotiate)

1. Ctx 03 specifies. It does not change the architecture (Ctx 02) or the
   requirements (Ctx 01) and does not widen the scope (Ctx 00). A needed change is
   an escalation (`V1`, `R2`, `R1`, `R0`), never an edit.
2. Nothing is invented. A value is `declarado` only if it is literally in the cited
   source, a datasheet snapshot or a human answer; `derivado` with its operation
   written out; otherwise `propuesto` with rationale and sensitivity.
3. No model approves its own output. Only the human decides at V1 and V2.
4. No Ctx 00, Ctx 01 or Ctx 02 item is modified.
5. Nothing is dropped silently: every `REQ`, `LIM`, `AC`, `DFR`, `TBD-Ctx03`
   range, Ctx 02 open point, question and feedback theme has a recorded disposition.
6. Hardware is bought, not designed: catalogue products with datasheet snapshots,
   at most two options per component, or one with a dominance statement.
7. Criteria are written and saved before any alternatives are compared.
8. One module at a time: a specification is finished, self-checked and recorded
   before the next one starts. A module is never skipped.
9. Parameters and procedures are consistent with the hardware: every value that
   uses compute, memory, storage, throughput, thermal, power, RF level or time is
   checked against a cited capacity with a planning margin.
10. Self-sufficient package: values and requirement text are copied in, not
    referenced; no executable code, no measurement result, no `TBD`.
11. Minimum viable product: every element cites a `REQ`, `LIM` or `AC`;
    nice-to-haves go to `beyond-MVP`.
12. Records first: write the file, then the event; update the state after every
    step so a fresh session can resume.
13. Do not load or imitate evaluation material. Web access only in 03.2, for
    datasheets, and the queries carry component names and specifications only,
    never project or user details.

Every artifact is in English. Fields and closed codes: `references/item-schema.md`.
Folders, `results/ctx03/state.json`, the thirteen events: `references/records.md`.
Forms: `references/templates.md`. What must be specified:
`references/spec-classes.md`. How values are chosen and checked:
`references/parameter-rules.md`. Module shape: `references/module-template.md`.
Decision rule: `references/mvp-criteria.md`.

## Working files

Paths follow the root skill `pipeline-layout`. Everything is written under
`results/ctx03/`; everything from earlier stages is read-only.

## Skills (load one at a time, from `skills/<name>/SKILL.md`)

| Skill | Role |
|---|---|
| `cb-admit-analyze` | 03.1 admission, shell checks, analysis of the inputs, dispositions, the specification register |
| `cb-gap-questions` | gaps and important decisions as questions, three tests, `input` and `design` modes |
| `cb-hardware-options` | 03.2 criteria, options (at most two), datasheet snapshots, `TBD-Ctx03` closure of hardware |
| `cb-resource-budget` | budget rows: provisional at 03.2, final at 03.5; open Ctx 02 points; remedy ladder |
| `cb-spec-module` | 03.3 loop driver: one `SPEC` at a time, input pack, self-check, record |
| `cb-spec-algorithm` | module kind `algorithm`: estimator, detector, sweep, learned-model hand-off |
| `cb-spec-procedure` | module kind `procedure`: calibration, verification, cross-site reproducibility |
| `cb-spec-interface` | module kind `interface`: schemas, errors, retries, limits, storage, reporting |
| `cb-spec-nfr` | module kind `nfr`: performance, resource and reliability allocations |
| `cb-test-design` | 03.4 one test per acceptance criterion plus qualification and procedure tests |
| `cb-coverage-consistency` | 03.5 cross-module consistency, final budget, closures, coverage both ways, blind and consumer review |
| `cb-gate-check` | gates G03-1 to G03-11 for V1 and V2 |
| `cb-validation-report` | V1 and V2 documents and the response form |
| `cb-feedback-cycle` | feedback, rounds, blocking, forced closure, integration, approval, close-out |

## Run procedure

Write each substage file before emitting its `SUBSTAGE_END` (emitted here). After
every substage, every `SPEC_DONE` and every human decision, update
`results/ctx03/state.json` (including `next_action`) and rewrite
`results/ctx03/STATUS.md`.

1. **03.1** `cb-admit-analyze` (emits `STAGE_START` and `REGISTER_ISSUED`), then
   `cb-gap-questions` in `input` mode. Writes `results/ctx03/substages/03.1.md`,
   `results/ctx03/spec-register.json`, `results/ctx03/questions.json`.
2. **03.2** `cb-hardware-options` (criteria file first), then `cb-resource-budget`
   in `provisional` mode, then `cb-gap-questions` in `design` mode, then
   `cb-gate-check` (V1) and `cb-validation-report` (V1). Writes
   `results/ctx03/substages/03.2.md`.
3. **V1 — stop.** A person answers. Load `cb-feedback-cycle`. `AJUSTAR` re-enters
   at the substage named in `integration.md`; `APROBAR` (accepted only if unblocked)
   locks the approved hardware and opens phase B.
4. **03.3 — module loop.** Load `cb-spec-module`. For each `SPEC` of phase B in
   `order` of the register: it writes the module file and items, emits
   `SPEC_START` and `SPEC_DONE`, and only then the next one starts. The loop ends
   when every `SPEC` of kind `algorithm`, `procedure`, `interface` and `nfr` is
   `done`. Emit `SUBSTAGE_END` for `03.3`.
5. **03.4** `cb-test-design`: the register entry of kind `test`.
6. **03.5** `cb-coverage-consistency` (loads `cb-resource-budget` in `final` mode),
   then `cb-gap-questions` in `design` mode (consolidates the provisional values
   logged by the modules), then `cb-gate-check` (V2) and `cb-validation-report` (V2).
7. **V2 — stop.** `cb-feedback-cycle`. `APROBAR` writes
   `results/ctx03/build-package-baseline.json`, `results/ctx03/build-package-baseline.sha256`,
   `results/ctx03/build-package-baseline.md`, `results/ctx03/final-spec.md` and
   `results/ctx03/CONTEXT-ctx03.md`. A change that touches approved hardware is
   `escalate:V1`.

When a decision has more than one plausible alternative, apply the comparison
method of `cb-hardware-options` with a criteria file saved first.

## The module loop discipline (03.3)

- The register `order` is the only order. A module whose dependencies are not all
  `done` is never started.
- A module ends only when its self-check passes (`cb-spec-module` step 5). If it
  cannot be completed because a value needs a human, it is completed with a
  `provisional` value and a candidate question; if it cannot be completed because
  upstream is defective or insufficient, the stage escalates. A module is never
  left half-done and never skipped.
- Reopened modules (after feedback) are re-run in `order`, with their dependants.
- Provisional values are logged in `questions.json` `candidates`; they become
  questions in the single run that produces the V2 presentation, so the cap holds.

## Rounds (per validation; identical in `cb-feedback-cycle`)

| Presentation | New questions | What the human may submit |
|---|---|---|
| R1 (first document of the validation) | Yes (run 1) | Answers, themes and decision |
| R2 (after F1) | Yes (run 2) | Answers, themes and decision |
| R3 (after F2) | No | Answers, themes and decision |
| R4 (after F3) | No | Only `APROBAR` or `DETENER`, no new themes |

- Three adjustment feedbacks per validation (V1 and V2 separately, up to six).
- At most 8 new questions per run (all passes that produce one presentation).
- `cb-feedback-cycle` owns this table and must not diverge from it.

## Stops, blocking and escalation

- **Blocking.** While a question with the gate of this validation is `open`, or a
  gate is `FAIL`, `APROBAR` is not accepted; write `blocked_by` in
  `results/ctx03/state.json` and set `status: blocked`. The agent does not advance.
- **Forced closure.** Only the human declares it (`CERRAR_FORZADO: <Q-id>`); the
  agent then decides by `references/mvp-criteria.md` and marks it `propuesto`,
  `forced: true`, highlighted in the next presentation. This is the only way a
  question closes without an answer.
- **Needs found from R3.** No new questions: propose the most viable option as
  `propuesto`, `forced: by-limit`, visible; the human accepts by approving or stops.
- **No answer at the limit.** The agent never closes questions on its own; the
  stage stays `blocked`. Every round needs a human action, so there is no loop.
- **Back-escalation.** If no purchasable option meets a mandatory `REQ`/`LIM`/`AC`
  (`R1`), the architecture or the Ctx 02 hardware must change (`R2`), or the Ctx 00
  scope is touched (`R0`), record `ESCALATION`, set `status: returned_upstream` and
  write `results/ctx03/CONTEXT-ctx03.md`. Reopening V1 from V2 (`escalate:V1`)
  consumes one V1 round, only if one remains; otherwise the human decides
  `DETENER`. The V2 document reissued afterwards counts as the next V2 presentation.
- **Failed admission** stops the stage before 03.1 ends (see `cb-admit-analyze`).
- **Subagents** go through the Agent tool; if it is unavailable run `inline` and
  record the mode, which is weaker because the context is shared.

## Do not

- Do not hide a `FAIL`: try one correction and recheck; a `FAIL` that remains is
  shown in the document and blocks `APROBAR`.
- Do not relax a rule or gate wording to make a gate pass.
- Do not start a module before the previous one is `done`.
- Do not load more than one skill's detail at a time or any fixture or example.
- Do not write or keep scripts; do not execute anything that is not a shell
  one-liner of the kinds above or a web read in 03.2.

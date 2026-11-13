---
name: cb-feedback-cycle
description: Reads the person's feedback at V1 or V2, counts rounds, enforces blocking and forced closure, writes integration.md, re-enters the owning substage or modules, records approval, and closes the stage with results/ctx03/CONTEXT-ctx03.md on approval, stop or return; loaded by compile-build-package-v2 at each validation stop, not invoked directly.
---

# cb-feedback-cycle

## Objective

Lead the validation rounds. Read answers, themes and decision; keep nothing
silent; apply the blocking rules; and close the stage with a hand-off file. This
skill owns the round table; it must not diverge from the orchestrator. At most
three adjustment feedbacks per validation, so the cycle always ends.

## Round table (identical to `SKILL.md`)

| Presentation | New questions | What the human may submit |
|---|---|---|
| R1 (first document of the validation) | Yes (run 1) | Answers, themes and decision |
| R2 (after F1) | Yes (run 2) | Answers, themes and decision |
| R3 (after F2) | No | Answers, themes and decision |
| R4 (after F3) | No | Only `APROBAR` or `DETENER`, no new themes |

New questions come only from the runs that produce R1 and R2
(`cb-gap-questions`), at most 8 per run.

## Inputs

`results/ctx03/validations/V<k>/R<n>/feedback.md`, `results/ctx03/state.json`,
`results/ctx03/questions.json`, `results/ctx03/items.json`,
`results/ctx03/spec-register.json`, the candidate
`results/ctx03/validations/V2/R<n>/final-spec.md`, `references/item-schema.md`,
`references/templates.md`.

## Steps

1. **Read the form.** Classify each entry: an answer to a `Q-03-nn` (content or
   `CERRAR_FORZADO`), a theme `T-nn`, or the decision. At R4 ignore any theme and
   accept only `APROBAR` or `DETENER`. The reason of each row is the person's text,
   cited by line. Emit `HUMAN_FEEDBACK` with decision, answers and themes; append the
   row to `feedback_history` of `results/ctx03/state.json`.
2. **Close questions.** A content answer closes its question as `answered`; the
   modules that used its `provisional` value are marked for re-entry. A
   `CERRAR_FORZADO` closes it as `closed-forced`: decide by
   `references/mvp-criteria.md`, mark `propuesto`, `forced: true`, never
   reformulate. Never close a question the human did not answer or force. If a
   forced value equals the provisional one, the modules need no change.
3. **Integration.** Write `results/ctx03/validations/V<k>/R<n>/integration.md`: one
   row per answer and per theme (`Q-id`/`T-id`) with the change, the affected items,
   the re-entry point, and one disposition from `item-schema.md`: `apply`,
   `no-op-confirmed`, `reject:<gate id>`, `defer:build`, `escalate:<V1|R0|R1|R2>`,
   `not-locatable`. A request for a coding detail is `defer:build`; a request for a
   value, procedure, schema or test is never deferred. From V2, a change to a locked
   V1 item is `escalate:V1`; one that changes the architecture or the Ctx 02 SDR or
   board is `escalate:R2`; one that changes a requirement or an acceptance threshold
   is `escalate:R1`; one that touches the Ctx 00 scope is `escalate:R0`. Emit
   `INTEGRATION_ISSUED`.
4. **Apply** only rows marked `apply`:
   - V1: re-enter `cb-hardware-options` (03.2), or `cb-admit-analyze` when the
     register changes (record the change, rerun `tsort`); then `cb-resource-budget`
     (`provisional`).
   - V2: set the `SPEC` named (and its dependants when an exported parameter or
     schema changed) to `reopened`; load `cb-spec-module` to run the loop in
     `order`; then rerun `cb-test-design` and `cb-coverage-consistency` as the changes
     require, and always `cb-assemble-spec` (the implementation document is rebuilt
     from the items).
   Then rerun `cb-gate-check` completely (not only the impact set) and issue the next
   presentation with `cb-validation-report`. From presentation R3 a need found while
   integrating is closed `propuesto`, `forced: by-limit`.
5. **State.** Increment `presentation` and `feedbacks_used` of the validation,
   record `decision`, update `blocked_by`, `status`, `next_action` and rewrite
   `STATUS.md`.
6. **Decision handling.**
   - `APROBAR`: accepted only if no question of this validation's gate is `open` and
     no gate is `FAIL`; otherwise set `status: blocked`, write `blocked_by` and do
     not advance. V1: lock approved hardware (`locked_v1: true` on each `HW` and
     hardware `DEC`), store `v1_locked_sha256` with
     `jq -S -c '[.items[]|select(.locked_v1==true)]' results/ctx03/items.json | sha256sum`,
     emit `VALIDATION_APPROVED`, set `phase: B`, `validation: V2`. V2: first
     re-assemble the document as `cb-assemble-spec` steps 2 and 3, writing to
     `results/ctx03/final-spec.md`, and compare it with the candidate the person
     reviewed: `cmp results/ctx03/final-spec.md results/ctx03/validations/V2/R<n>/final-spec.md`.
     If a fidelity check prints a defect, the approval is not accepted (G03-12 is a
     `FAIL`). If the files differ, the approval is not accepted either: write the
     `diff` into `integration.md`, replace the candidate with the new file, set
     `status: blocked` with `blocked_by: document-changed`, and issue the review again
     under the same presentation (not counted as a feedback or a new presentation);
     the person must decide again. If the files are identical, emit
     `VALIDATION_APPROVED`, write `results/ctx03/build-package-baseline.json`
     (shape in `references/records.md`, manifest from
     `sha256sum results/ctx03/specs/* results/ctx03/sources/* results/ctx03/final-spec.md`),
     store its hash with
     `sha256sum results/ctx03/build-package-baseline.json > results/ctx03/build-package-baseline.sha256`,
     emit `STAGE_APPROVED`, set `status: approved` and write
     `results/ctx03/CONTEXT-ctx03.md`. There is no `build-package-baseline.md`:
     `results/ctx03/final-spec.md` is the document the builder reads.
   - `AJUSTAR`: run steps 3 and 4. If the feedback cap is spent, `AJUSTAR` is not
     offered at the next presentation (R4).
   - `DETENER`: set `status: stopped`, write `results/ctx03/CONTEXT-ctx03.md`, do not
     write `results/ctx03/build-package-baseline.json`.
   - No response or no decision at the limit: `status: blocked`; wait.
7. **Escalation and return.** For `escalate:V1`: reopen V1 only if it has rounds
   left (consumes one, presentation continues from 03.2); otherwise offer `DETENER`
   only. For `escalate:R0`, `R1` or `R2`: emit `ESCALATION`, set
   `status: returned_upstream`, write `results/ctx03/CONTEXT-ctx03.md` with the reason.
8. **CONTEXT-ctx03.md.** Fill the template of `references/templates.md`: status,
   baseline path and hash, implementation document hash, forced closures with values, what
   travels open to the build stage, how to read the items, where to look. Written on
   approval, stop and return.

## Output format

`integration.md`, updated `results/ctx03/state.json`, `results/ctx03/STATUS.md`,
`results/ctx03/questions.json`, `results/ctx03/items.json`, and on close
`results/ctx03/build-package-baseline.json`, its `.sha256`,
`results/ctx03/final-spec.md` (the implementation document) and
`results/ctx03/CONTEXT-ctx03.md`.

## Do not

- Do not close a question or force closure without the human's directive.
- Do not apply a theme that has no `apply` row, or any `defer`, `reject`,
  `escalate` or `not-locatable` row.
- Do not accept `APROBAR` over an open blocking question or a `FAIL`.
- Do not raise a new question at R3 or R4, or exceed three feedbacks.
- Do not drop an answer or theme; every one has a row.
- Do not modify an upstream item to accommodate feedback.
- Do not load any fixture or example dataset.

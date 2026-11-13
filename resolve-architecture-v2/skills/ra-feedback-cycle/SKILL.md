---
name: ra-feedback-cycle
description: Reads the person's feedback at V1 or V2, counts rounds, enforces blocking and forced closure, writes integration.md, records approval, and closes the stage with results/ctx02/CONTEXT-ctx02.md on approval, stop or return; loaded by resolve-architecture-v2 at each validation stop, not invoked directly.
---

# ra-feedback-cycle

## Objective

Lead the validation rounds. Read answers, themes and decision; keep nothing
silent; apply the blocking rules; and close the stage with a hand-off file. This
skill owns the round table; it must not diverge from the orchestrator.

## Round table (identical to `SKILL.md`)

| Presentation | New questions | What the human may submit |
|---|---|---|
| R1 (first document of the validation) | Yes (run 1) | Answers, themes and decision |
| R2 (after F1) | Yes (run 2) | Answers, themes and decision |
| R3 (after F2) | No | Answers, themes and decision |
| R4 (after F3) | No | Only `APROBAR` or `DETENER`, no new themes |

Three adjustment feedbacks per validation. New questions come only from the runs
that produce R1 and R2 (`ra-gap-questions`), at most 8 per run.

## Inputs

`results/ctx02/validations/V<k>/R<n>/feedback.md`, `results/ctx02/state.json`, `results/ctx02/questions.json`,
`results/ctx02/items.json`, `references/item-schema.md`, `references/templates.md`.

## Steps

1. **Read the form.** Classify each entry: an answer to a `Q-02-nn` (content or
   `CERRAR_FORZADO`), a theme `T-nn`, or the decision. At R4 ignore any theme and
   accept only `APROBAR` or `DETENER`. The reason of each row is the person's
   text, cited by line. Emit `HUMAN_FEEDBACK` with decision, answers and themes.
2. **Close questions.** A content answer closes its question as `answered`. A
   `CERRAR_FORZADO` closes it as `closed-forced`: decide by
   `references/mvp-criteria.md`, mark `propuesto`, `forced: true`, never
   reformulate. Never close a question the human did not answer or force.
3. **Integration.** Write `results/ctx02/validations/V<k>/R<n>/integration.md`: one row per
   answer and per theme (`Q-id`/`T-id`) with the change, the affected items, the
   re-entry substage, and one disposition from `item-schema.md`: `apply`,
   `no-op-confirmed`, `reject:<gate id>`, `defer:Ctx03`, `escalate:<V1|R0|R1>`,
   `not-locatable`. A request for Ctx 03 detail is `defer:Ctx03` and not applied.
   A change to a locked V1 item from V2 is `escalate:V1`; one that touches the
   Ctx 00 scope or an unmeetable mandatory item is `escalate:R0`/`escalate:R1`.
   Emit `INTEGRATION_ISSUED`.
4. **Apply** only rows marked `apply`, by re-entering the owning substage and its
   skill; then rerun `ra-gate-check` completely (not only the impact set) and
   issue the next presentation with `ra-validation-report`. From presentation R3
   a need found while integrating is closed `propuesto`, `forced: by-limit`.
5. **State.** Increment `presentation` and `feedbacks_used` of the validation,
   record `decision`, update `blocked_by` and `status`.
6. **Decision handling.**
   - `APROBAR`: accepted only if no question of this validation's gate is `open`
     and no gate is `FAIL`; otherwise set `status: blocked`, write `blocked_by`
     and do not advance. V1: lock approved items (`locked_v1: true`), store
     `v1_locked_sha256`, emit `VALIDATION_APPROVED`, open phase B. V2: emit
     `VALIDATION_APPROVED`, write `results/ctx02/architecture-baseline.json` (items and
     plan), store its hash with `sha256sum results/ctx02/architecture-baseline.json > results/ctx02/architecture-baseline.sha256`, write `results/ctx02/architecture-baseline.md` (reading copy, see `references/records.md`), write `results/ctx02/final-design.md`, emit
      `STAGE_APPROVED`, set `status: approved`, write `results/ctx02/CONTEXT-ctx02.md`.
      Before emitting `STAGE_APPROVED`, verify the stored baseline hash with
      `sha256sum -c` and the required artifacts. Require a signer and the recorded
      V1/V2 human approvals. A missing check, open blocking question or interrupted
      freeze cannot grant downstream admission. Reconcile partial closure using
      `.agents/mapurito/contracts/handoff.md`, without inventing approval.
   - `AJUSTAR`: run steps 3 and 4. If the feedback cap is spent, `AJUSTAR` is not
     offered at the next presentation (R4).
   - `DETENER`: set `status: stopped`, write `results/ctx02/CONTEXT-ctx02.md`, do not
     write `results/ctx02/architecture-baseline.json`.
   - No response or no decision at the limit: `status: blocked`; wait.
7. **Escalation and return.** For `escalate:V1`: reopen V1 only if it has rounds
   left (consumes one); otherwise offer `DETENER` only. For `escalate:R0` or
   `escalate:R1`: emit `ESCALATION`, set `status: returned_upstream`, write
   `results/ctx02/CONTEXT-ctx02.md` with the reason.
8. **CONTEXT-ctx02.md.** Fill the template of `references/templates.md` in
   `results/ctx02/`: status, baseline path and hash, final document hash, forced
   closures with values, what travels open to Ctx 03, how to read the items, where
   to look. Written on approval, stop and return.

## Output format

`integration.md`, updated `results/ctx02/state.json`, `results/ctx02/questions.json`, `results/ctx02/items.json`, and on
close `results/ctx02/*` and `results/ctx02/CONTEXT-ctx02.md`.

## Do not

- Do not close a question or force closure without the human's directive.
- Do not apply a theme that has no `apply` row, or any `defer`, `reject`,
  `escalate` or `not-locatable` row.
- Do not accept `APROBAR` over an open blocking question or a `FAIL`.
- Do not raise a new question at R3 or R4, or exceed three feedbacks.
- Do not drop an answer or theme; every one has a row.
- Do not load any fixture or example dataset.

---
name: sr-improvement-plan
description: Builds the improvement plan for a feedback round — one row per answer and per theme, with destination, change, provenance, re-entry sub-stage, impact set and disposition — before any item is touched, escalating changes that cross a frozen Ctx 00 boundary; loaded by specify-requirements after feedback, not invoked directly.
---

# sr-improvement-plan

## Purpose

Turn a round's feedback into an explicit plan, written before anything is edited,
so no answer or theme is lost in silence and no change spreads past its impact
set. Only `sr-draft-items` executes the plan's rows.

## Inputs

- The classified answers (`Q-id`) and themes (`T-id`) from `sr-feedback-cycle`.
- `results/ctx01/record.json` (for `deriva_de` chains) and `results/ctx00/problem-baseline.json`
  (to detect a change that crosses a frozen boundary).
- `references/item-schema.md` for the adjustment classes and the `relaxation` mark.

## Procedure

1. **One row per input.** Every `Q-id` and every `T-id` gets at least one row.
   None is dropped; a theme judged out of scope still gets a row with that
   disposition and its reason.
2. **Fill each row:** destination item(s), the concrete change, the resulting
   provenance, the re-entry sub-stage (01.2–01.5), the impact set, and the
   disposition.
3. **Impact set.** Compute it by following `deriva_de` downward from the
   destination. Items outside the set are not touched.
4. **Escalation (`R0`).** If the change reaches objectives, scope, stakeholders or
   the Ctx 00 boundary, classify it `R0`: escalate, do not apply. Otherwise it is
   `R1` or `R2` and stays within Ctx 01.
5. **Relaxation.** If the change relaxes a threshold or removes a requirement,
   mark the row `relaxation`; the DEE then requests explicit confirmation.
6. **Reason by citation.** The reason for a row is the person's own text, cited by
   line — no prose justification of your own.
7. After the plan, the whole gate is re-run (not only the impact set).
8. Emit `improvement_planned` with the plan path and the row count by disposition.

## Output format

`results/ctx01/rounds/O<n>/improvement-plan.md`: a table with columns destination, change,
provenance, re-entry sub-stage, impact set, class (`R0`/`R1`/`R2`), marks
(`relaxation` if any), disposition, and the cited reason. One row per `Q-id` and
per `T-id`.

## Do not

- Do not edit any item here; the plan is written first and `sr-draft-items`
  executes it.
- Do not apply an `R0` change; escalate it to Ctx 00.
- Do not touch an item outside the computed impact set.
- A seeded requirement is never removed by feedback.
- Do not justify a row in your own prose.
- Do not load any fixture or example dataset.

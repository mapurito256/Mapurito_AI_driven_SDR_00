---
name: sr-feedback-cycle
description: Reads a round's feedback form, drives the outputs through the round table, forces closure of open questions at O3, and caps the stage at six outputs; loaded by specify-requirements between outputs, not invoked directly.
---

# sr-feedback-cycle

## Purpose

Lead the rounds. Read the person's answers and themes, enforce the round table,
force-close every open question at the third output, and stop the stage at six
outputs. This skill owns the round table; it must not diverge from the
orchestrator.

## Inputs

- `results/ctx01/rounds/O<n>/response-form.md` (the person's answers by `Q-id`, themes by
  `T-id`, and the decision).
- `results/ctx01/state.json` for the round and question-run counters.
- `references/item-schema.md` and `references/templates.md`.

## The round table (identical to the orchestrator and PLAN §4)

| Output | New questions | Then receives |
|---|---|---|
| O1 (first draft) | Allowed — new-question run 1 | Feedback F1 |
| O2 (after F1) | Allowed — new-question run 2 | Feedback F2 |
| O3 (after F2) | No — every open question is force-closed | F3 (improvement or approval only) |
| O4, O5, O6 (after F3, F4, F5) | No — improvement themes only | up to three improvement feedbacks |

- At most six outputs. After O6 the only decision is `APROBAR` (with the forced
  assumptions visible) or `DETENER`.
- New questions only in the runs that produce O1 and O2 (`sr-gap-questions`),
  capped at 8 per run.

## Procedure

1. Read the response form. Classify each entry: an answer to a `Q-id` (content or
   forced closure) or an improvement `T-id`. Nothing is read as prose to act on;
   the reason is the person's text, cited by line.
2. Close questions. A content answer closes its `OQ` as answered and feeds a row
   to `sr-improvement-plan`; a forced closure closes it and is never reformulated.
3. **Forced closure at O3.** When the output being prepared is O3, every still-open
   `OQ` is closed as a forced assumption, with an owner and a closure criterion,
   and made visible in the DEE. No new question is raised from O3 onward.
4. Hand every answer and every theme to `sr-improvement-plan`; it writes the plan
   before any item is touched. Only `sr-draft-items` then executes its rows.
5. Update `results/ctx01/state.json`: increment `round`, record the decision, keep the two
   counters consistent.
6. Emit `feedback_received` with the round index and the answers and themes read.

## Decision handling

`APROBAR` → hand to the orchestrator's freeze (gate must be clean).
`AJUSTAR` → run the improvement plan and produce the next output.
`DETENER` → stop; record the decision and the open set; do not freeze.

## Output format

Updated `results/ctx01/state.json`; closed/converted `OQ` objects in `results/ctx01/record.json`; a classified
list of answers and themes passed to `sr-improvement-plan`.

## Do not

- Do not raise or re-ask a question in O3–O6, and do not exceed six outputs.
- Do not re-ask a question the person answered or force-closed.
- Do not apply a theme directly; it must pass through the improvement plan.
- Do not load any fixture or example dataset.

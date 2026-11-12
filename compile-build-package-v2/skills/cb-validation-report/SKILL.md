---
name: cb-validation-report
description: Writes the V1 hardware-proposal document and the V2 final-specification document, open questions first, plus the response form the person fills; loaded by compile-build-package-v2 after the gate, not invoked directly.
---

# cb-validation-report

## Objective

Produce the one document a person reads at each validation and the form they
answer with. Substages leave their trace in `results/ctx03/substages/`, the
modules in `results/ctx03/specs/` and the events in `results/ctx03/events.jsonl`;
the validation document is the only narrative the person sees per presentation.
The agent exposes; the person decides.

## Inputs

`results/ctx03/items.json`, `results/ctx03/questions.json`,
`results/ctx03/state.json`, `results/ctx03/spec-register.json`, the gate result of
`cb-gate-check`, `results/ctx03/substages/*.md`, `references/templates.md` (the V1,
V2 and form layouts), `references/item-schema.md`.

## Steps

1. Pick the document: V1 after 03.2 (`results/ctx03/validations/V1/R<n>/hardware-proposal.md`),
   V2 after 03.5 (`results/ctx03/validations/V2/R<n>/final-spec.md`), where `R<n>` is
   the presentation index of `results/ctx03/state.json`.
2. Fill the sections of the template exactly in order. **Section 1 is always the
   open questions**: all of them with state, `kind`, `category`, `gate`; those whose
   gate is this validation are marked as blocking; a question with a
   `provisional` value shows it and the `SPEC` ids that use it. A question closed
   by force (`forced: true`) is highlighted with the value chosen and the
   criterion step from `references/mvp-criteria.md`; a need closed `by-limit` is
   highlighted the same way.
3. V1 content: each component with at most two options (or one with its dominance
   statement), the criteria file hash, the eliminatory matrix, the ordinal
   comparison, the robustness line, the optional recommendation marked `propuesto`,
   the references fixed by Ctx 02, the compatibility checks, the provisional budget
   with the planning margins used, the Ctx 02 open points closed or still open, and
   the register: what will be specified, in order, and what needs no specification.
4. V2 content: each `SPEC` in order with the ids it closes and its critical
   parameters, the hardware as approved, the final budget and open-point closure,
   the `TBD-Ctx03` and `DFR` closure tables, the AC→TST table with the threshold
   written side by side, the coverage tables, blind-review disagreements, the
   consumer-test questions and their resolution, and any change that touches
   approved hardware as an `escalate:V1` row.
5. "What the agent decided" is an index of ids and marks: proposed items and
   figures, forced closures, provisional values resolved, `beyond_mvp`. In V2 only
   the `critical` parameters show with a one-line rationale; the routine ones are
   referenced to the list in `results/ctx03/items.json`. No prose justification.
6. Copy the gate rows with their verdicts and evidence; list warnings apart.
7. State what this presentation accepts, from the round table of
   `cb-feedback-cycle`: R1 to R3 accept answers, themes and a decision; R4 accepts
   only `APROBAR` or `DETENER`. If any blocking question is open or a gate is
   `FAIL`, say that `APROBAR` is not accepted until it is cleared.
8. Write the empty form `results/ctx03/validations/V<k>/R<n>/feedback.md` from its
   template, listing each open question as a `Q-03-nn` to answer, with the
   directive `CERRAR_FORZADO: <Q-03-nn>` available; leave themes empty.
9. Emit `VALIDATION_ISSUED` with the path, validation and presentation. Update
   `state.json` (`next_action`: wait for the human) and `STATUS.md`.

## Output format

The document (sections of the template) and the empty form.

## Do not

- Do not put anything above the open questions.
- Do not add a written justification to "what the agent decided".
- Do not recommend as if decided: a recommendation is `propuesto`.
- Do not hide a `FAIL`, a forced closure, a provisional value or a `by-limit` need.
- Do not approve, sign or decide for the person.
- Do not load any fixture or example dataset.

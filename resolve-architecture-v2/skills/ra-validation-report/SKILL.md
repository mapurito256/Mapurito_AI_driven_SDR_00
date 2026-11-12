---
name: ra-validation-report
description: Writes the V1 hardware-proposal document and the V2 final-design document, open questions first, plus the response form the person fills; loaded by resolve-architecture-v2 after the gate, not invoked directly.
---

# ra-validation-report

## Objective

Produce the one document a person reads at each validation and the form they
answer with. Sub-stages leave their trace in `results/ctx02/substages/` and `results/ctx02/events.jsonl`; the
validation document is the only narrative the person sees per presentation. The
agent exposes; the person decides.

## Inputs

`results/ctx02/items.json`, `results/ctx02/questions.json`, `results/ctx02/state.json`, the gate result of `ra-gate-check`,
`results/ctx02/substages/*.md`, `references/templates.md` (the V1, V2 and form layouts),
`references/item-schema.md`.

## Steps

1. Pick the document: V1 after 02.4 (`results/ctx02/validations/V1/R<n>/hardware-proposal.md`),
   V2 after 02.7 (`results/ctx02/validations/V2/R<n>/final-design.md`), where `R<n>` is the
   presentation index of `results/ctx02/state.json`.
2. Fill the sections of the template exactly in order. **Section 1 is always the
   open questions**, all of them with state, `kind`, `category`, `gate`; those
   whose gate is this validation are marked as blocking. A question closed by
   force (`forced: true`) is highlighted with the value chosen and the criterion
   step from `references/mvp-criteria.md`; a need closed `by-limit` is highlighted
   the same way.
3. V1 content: the options (1 to 3), the criteria file hash, the eliminatory
   matrix with `pass`/`fail`/`unverified` per cell, the ordinal comparison, the
   robustness lines, the optional recommendation marked `propuesto`, the dominance
   statement when there is one option, the flow, the RF elements needed or not
   with reasons, and the characteristic cards.
4. V2 content: the decisions, components, dependencies and the plan equal to
   `tsort`, the closure of the Ctx 02 `DFR`s, the Ctx 03 boundary, the coverage
   tables and blind-review disagreements, and any change that touches approved
   hardware as an `escalate:V1` row.
5. "What the agent decided" is an index of ids and marks: proposed items and
   figures, forced closures, `beyond_mvp`. No prose justification.
6. Copy the gate rows with their verdicts and evidence; list warnings apart.
7. State what this presentation accepts, from the round table of
   `ra-feedback-cycle`: R1 to R3 accept answers, themes and a decision; R4 accepts
   only `APROBAR` or `DETENER`. If any blocking question is open or a gate is
   `FAIL`, say that `APROBAR` is not accepted until it is cleared.
8. Write the empty form `results/ctx02/validations/V<k>/R<n>/feedback.md` from its template,
   listing each open question as a `Q-02-nn` to answer, with the directive
   `CERRAR_FORZADO: <Q-02-nn>` available; leave themes empty.
9. Emit `VALIDATION_ISSUED` with the path, validation and presentation.

## Output format

The document (six sections, from the template) and the empty form.

## Do not

- Do not put anything above the open questions.
- Do not add a written justification to "what the agent decided".
- Do not recommend as if decided: a recommendation is `propuesto`.
- Do not hide a `FAIL`, a forced closure or a `by-limit` need.
- Do not approve, sign or decide for the person.
- Do not load any fixture or example dataset.

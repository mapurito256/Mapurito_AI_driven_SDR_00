---
name: sr-dee-report
description: Writes the Stage Delivery Document (DEE 01) for an output and the response form the person fills, from the record and the gate result; loaded by specify-requirements after the gate, not invoked directly.
---

# sr-dee-report

## Purpose

Produce the single document a person reads in the stage — the DEE — and the
response form they answer with. Sub-stages 01.1–01.6 leave their trace in
`results/ctx01/events.jsonl`, not in prose; the DEE is the only narrative the person sees per
output.

## Inputs

- `results/ctx01/record.json`, `results/ctx01/state.json` and the gate result from `sr-gate-check`.
- `references/templates.md` for the DEE and the response-form layouts.
- `references/item-schema.md` for item fields and codes.

## Procedure

1. Fill the six sections of the DEE template exactly in order into
   `results/ctx01/rounds/O<n>/dee.md`:
   - **1 Summary** — counts of REQ by subtype, LIM, AC, DFR by responsible stage,
     and the seven gates as pass/FAIL.
   - **2 Content** — every item, legible, with its marks, bound, provenance and
     citation reference.
   - **3 What the agent decided** — the computed index: proposed thresholds with
     no declared anchor, whole proposed items, transfer discards with code,
     downgrades, omission candidates rejected. Ids and marks, **no prose
     justification**.
   - **4 What remains open** — the DFRs with governing REQ, stage, closure
     criterion, bracket and materiality; converted assumptions; the computed "not
     acceptable until closure" set.
   - **5 Gate result** — the seven gate rows with cited evidence, the per-anchor
     coverage table with single-requirement objectives flagged, and the warnings
     grouped apart from verdicts.
   - **6 Pending decision** — the four human questions and the computed verdict,
     with the request to sign `APROBAR` or `AJUSTAR`.
2. Compute the candidate baseline hash over the items and exclusions and show it
   in the DEE; the baseline is frozen only on approval.
3. Write the empty response form `results/ctx01/rounds/O<n>/response-form.md` from its template,
   listing each open `OQ` as a `Q-id` to answer and leaving the themes open.
4. Emit `dee_emitted` with the DEE path and the candidate hash.

## Output format

`results/ctx01/rounds/O<n>/dee.md` (six sections, from the template) and
`results/ctx01/rounds/O<n>/response-form.md` (empty, for the person).

## Do not

- Do not add a written justification to section 3; the decision is judged on the
  result.
- Do not present a coverage percentage as sufficiency.
- Do not decide the verdict or sign; the person signs.
- Do not load any fixture or example dataset.

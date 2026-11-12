---
name: sr-draft-items
description: Drafts the typed items of Ctx 01 — disposition of transferred material, limits, requirements, acceptance criteria and controlled deferrals — each with marked provenance and citation; loaded by specify-requirements at 01.2–01.5, not invoked directly.
---

# sr-draft-items

## Purpose

Write the requirements, limits, acceptance criteria and deferrals, each with a
provenance mark and, when `declarado`/`derivado`, a literal citation. This skill
also executes the rows of an approved improvement plan (and only those rows).

## Inputs

- `results/ctx00/problem-baseline.json`, `results/ctx00/intake.md` (the text of each `STM`) and `results/ctx01/record.json`.
- `references/item-schema.md` for fields, provenance, EARS/AC forms and codes.
- In a feedback round, `results/ctx01/rounds/O<n>/improvement-plan.md` from `sr-improvement-plan`.

## Procedure (dependency order; do not reorder)

1. **01.2 Disposition of transferred material.** First adopt each guardrail of
   `pipeline-layout/guardrails.md` as a REQ (subtype `restriction`, `sembrado: true`,
   `guardrail_id`, `text` = catalog text verbatim, `procedencia: declarado`, `cita` =
   catalog text, `cita_ref` = its `GRD-nn`). Then the transferred material, defined
   under "Transferred material" in `references/item-schema.md`, is the
   `statements` of the baseline with category `constraints` or `expected results`
   that are not discarded (`jq -r '.statements[] | select(.category=="constraints" or .category=="expected results") | .id'`).
   A transferred statement that contradicts a guardrail is discarded with
   `incoherent-with-seeded`.
   For each, read its text in `results/ctx00/intake.md` and write one well-formed
   requirement (an EARS form) that keeps its citation, splitting a statement that
   holds more than one requirement; discard a non-requirement with a code from the
   transfer-discard set. Every transferred statement ends adopted (a REQ names it
   in `deriva_de`) or discarded.
2. **01.3 Constraints and limits.** Write one restriction REQ per
   obligation of the baseline with `active: true`, citing the snapshot of its `SRC`; write one LIM per relevant
   capability with its five fields and a citation. A LIM is never `propuesto`:
   with no value in the corpus there is no LIM, and the gap becomes a question.
3. **01.4 Product and system requirements.** Write the requirements the scope
   demands, marking `propuesto` those the objectives imply and nobody stated;
   bound each quantitative one with value + unit + operator, citing the LIM when
   the bound comes from the envelope. Propose an exclusion with a code where an
   objective should generate no requirement. Record any downgrade of
   `obligatorio`/`relevante_arquitectura` in `downgrades`.
4. **01.5 Acceptance criteria.** For each mandatory REQ write at least one AC with
   the five elements. A threshold nobody can anchor is either `propuesto` or
   deferred through a `DFR` (four fields + materiality + bracket); the AC then
   carries `{dfr, horquilla}` in place of a number.

## Provenance rule

Mark `declarado` only when the value, unit and operator all appear in the literal
`cita`. Otherwise mark `derivado` (computed from cited material) or `propuesto`
(chosen because nothing anchored it, carrying no citation).

## Output format

Append or edit objects in `results/ctx01/record.json.items`, with `discards`, `exclusions` and
`downgrades` populated as above. Emit `items_drafted` with the ids written or
edited and their provenance.

## Do not

- Do not name an algorithm, data structure, architecture or product in a REQ;
  record such a candidate for Ctx 02 and keep the requirement about *what*.
- Do not invent a value to avoid a question, and do not mark `declarado` a figure
  absent from the citation.
- Do not create a `DFR` at close.
- Do not delete or weaken a seeded requirement.
- Do not act on a feedback theme that has no row in the approved improvement plan.
- Do not load any fixture or example dataset.

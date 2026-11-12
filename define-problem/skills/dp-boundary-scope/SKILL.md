---
name: dp-boundary-scope
description: Draws the boundary between what the system does and what is excluded, with external entities and scope; loaded by define-problem, not invoked directly.
---

# dp-boundary-scope

## Purpose

Draw the line between what the system does and what is left out. The exclusion
list is never empty: a scope with no explicit exclusions has not been examined.

## Inputs

- Sections 1 to 4 of `results/ctx00/problem-definition.md` and `results/ctx00/intake.md`.
- `../../references/record-schema.md` for **Identifiers**, **Item lines**, **Citation grammar** and **Provenance marks**.

## Procedure

1. Define what is inside the system (the boundary elements).
2. Identify the external entities the system interacts with and the direction of each flow; write each as the next `EXT-nn` line.
3. List what is explicitly in scope as `SCP-nn` lines with `side: in`; each traces to one or more `OBJ-nn` of section 3 (`traces to`).
4. List what is explicitly out of scope as `SCP-nn` lines with `side: out`; each carries its `reason`, citing the material or an objective. `SCP` numbers run in one sequence across both sides, in the order written, with no gaps and no reuse.
5. If an element of the material fits neither clearly inside nor clearly outside, raise it as an open question through `dp-gap-search` rather than forcing a side.
6. Write section 5 with provenance marks.
7. Run `dp-verify-consistency` parts A and B over section 5.
8. Run `dp-gap-search` in section mode over section 5.

Do not invent exclusions to fill the list. If you cannot state an exclusion's
reason by citing the material or the objectives, do not include it.

## Output

Section 5 written: `SCP-nn` lines in scope (each tracing to an objective) and out
of scope (each with a reason), and `EXT-nn` lines with flow direction, all
provenance-marked.

## Exit condition

At least one in-scope item and at least one exclusion with a reason, nothing
both inside and outside, and `dp-verify-consistency` part A over section 5 is
`GREEN`.

## If it fails

If part A reports an item on both sides of the scope, correct the document as
`dp-verify-consistency` directs. If the exclusion list would be empty, examine
the objectives again for what the system deliberately does not do; do not leave
it empty and do not pad it with unfounded exclusions.

## Do not

- Do not leave the exclusions empty, nor pad them with unfounded ones.
- Do not put one item on both sides, nor write an `in` item with no `traces to`.
- Do not force a doubtful element onto a side: raise a question.

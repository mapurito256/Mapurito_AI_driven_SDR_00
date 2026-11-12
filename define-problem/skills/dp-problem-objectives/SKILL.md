---
name: dp-problem-objectives
description: Writes the problem statement and the objectives with their success measures; loaded by define-problem, not invoked directly.
---

# dp-problem-objectives

## Purpose

State the problem in one sentence and the objectives of the system, and give
each objective a success measure that says what is measured, in what unit and
in which direction — with no threshold, which belongs to the next stage.

## Inputs

- Section 1 of `results/ctx00/problem-definition.md` (the classified statements) and `results/ctx00/intake.md`.
- `../../references/record-schema.md` for **Identifiers**, **Item lines**, **Citation grammar** and **Provenance marks**.

## Procedure

1. Write the problem in one sentence in section 2, citing the statements it comes from.
2. Extract or formulate the objectives in section 3, in order, as `OBJ-nn` lines (**Item lines**): numbered from 01 with no gaps and no reuse. Each carries the operational decision it enables.
3. For each `OBJ-nn` write one success measure, on the line under it, with these fields: what is measured, operational definition, unit, reference point, and sense (`higher is better` | `lower is better`). Do not include a threshold.
4. Mark every element with its provenance. Anything you chose that is not in the material is `[P]` and is set apart visually; anything derived from cited material is `[R]`; anything quoted is `[D]` with its citation.
5. If the material states an objective that names a solution (a technology, algorithm or product), reformulate the objective without the solution and copy the solution to section 7 (Registered solution suggestions) as the next `SOL-nn` line, with its citation. No solution term appears in the problem or an objective.
6. Run `dp-verify-citations` over sections 2 and 3.
7. Run `dp-gap-search` in section mode over sections 2 and 3.

If the material covers the problem and objectives completely, record `No gaps
identified…` as `dp-gap-search` directs and advance; there is no quota of
questions and zero is a correct result.

## Output

Section 2 (the problem) and section 3 (`OBJ-nn` lines with success measures)
written, cited and provenance-marked, with any named solution moved to
section 7.

## Exit condition

There is a problem in one sentence, at least one objective with a complete
success measure, no solution term in the problem or any objective, no threshold
in any measure, and `dp-verify-citations` over sections 2 and 3 is `GREEN`.

## If it fails

If a citation fails, correct it as `dp-verify-citations` directs before moving
on. If an objective has no measurable success measure derivable from the
material, raise an open question through `dp-gap-search` rather than inventing a
unit. Never write a threshold here.

## Do not

- Do not write an `OBJ-nn` without its measure, nor reuse or skip an `OBJ` number.
- Do not write a threshold, target or limit in any measure.
- Do not name a solution in the problem or an objective.
- Do not decide the purpose, scope or priorities: they are the person's.

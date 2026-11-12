---
name: dp-verify-consistency
description: Audits the document for classification errors, incompatible magnitudes and real contradictions, at three levels of strength; loaded by define-problem, not invoked directly.
---

# dp-verify-consistency

## Purpose

Catch the ways the document can contradict itself or the material: a statement
classified twice, the same magnitude given two values, or two statements that
cannot both be true. Part A blocks; parts B and C inform and go to the person.

## Inputs

- The part of `results/ctx00/problem-definition.md` in scope (section 1 after ordering; sections 1 and 5 after boundary and scope; the whole document at closure and each feedback round).
- `results/ctx00/intake.md` for the statements and their count.
- `../../references/record-schema.md` for identifiers and the **Open-question block**.
- `../dp-gap-search/SKILL.md` for the criteria a precision question must meet.

The caller names which parts to run and over which sections.

## Procedure

### Part A — objective audit (blocks)

1. **A1.** Each `STM-nn` appears exactly once in section 1. The count of classified-or-discarded statements (expanding any range discard) equals `Total statements: N`.
2. **A2.** No statement is classified into two categories, and none is both classified and discarded.
3. **A3.** No statement is cited both inside and outside the scope in section 5.

### Part B — magnitude sweep (warning, does not block)

4. List every number with its unit in the document and in `results/ctx00/intake.md`. Group by magnitude (same unit and same subject). If a group holds different values, judge whether it is the same magnitude (a possible contradiction, note it) or different magnitudes (discard).

### Part C — semantic contradictions (does not block; a real one goes to the person)

5. Group the statements by topic; compare within each group, not everything against everything.
6. Before flagging a contradiction: quote both statements literally, try a reasonable reading under which they coexist, and explain why that reading fails. If such a reading exists, it is an imprecision, not a contradiction.
7. If the two statements cannot both be quoted literally, there is no contradiction.
8. A real contradiction becomes an **Open-question block** in section 8 with type `contradiction` and both citations. An imprecision becomes a precision question only if it meets the gap criteria in `dp-gap-search`.

### Report

9. Report `GREEN` or `FAIL`. Part A failing is `FAIL`; one failure is enough, there is no partial green. Parts B and C never make the verdict `FAIL`: their output is warnings and section-8 questions.

## Output

A `GREEN` or `FAIL` verdict for part A recorded in section 10, the magnitude
warnings from part B, and any `contradiction` questions part C added to
section 8.

## Exit condition

Part A is `GREEN` over its scope, and every real contradiction found in part C
is written as a `contradiction` question in section 8.

## If it fails

Correct the classification or the scope in the document so part A passes:
reclassify the statement, remove the duplicate entry, or move the item to one
side of the scope. Never edit `results/ctx00/intake.md` and never relax part A to
pass. Re-run part A. The orchestrator allows three correction attempts; if it
still fails, the document is presented with the failure stated at the top and
the person decides.

## Do not

- Do not flag a contradiction you cannot quote on both sides.
- Do not let part B or C turn the verdict into `FAIL`.
- Do not edit `results/ctx00/intake.md` or relax part A.

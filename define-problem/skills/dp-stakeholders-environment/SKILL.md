---
name: dp-stakeholders-environment
description: Identifies the typed stakeholders and the environment conditions of the system; loaded by define-problem, not invoked directly.
---

# dp-stakeholders-environment

## Purpose

Identify who uses, operates, maintains, regulates, is affected by or pays for
the system, and the physical, electromagnetic, network, temporal and access
conditions it operates in.

## Inputs

- Sections 1 to 3 of `results/ctx00/problem-definition.md` and `results/ctx00/intake.md`.
- `../../references/record-schema.md` for **Identifiers**, **Item lines**, **Stakeholder and environment types (section 4)**, **Citation grammar** and **Provenance marks**.

## Procedure

1. Identify the stakeholders named in the material and write each as the next `STK-nn` line (from 01, no gaps, no reuse), typed from **Stakeholder and environment types (section 4)**. Cite each. A user declares its `use`.
2. Identify the environment conditions named in the material and write each as the next `ENV-nn` line, typed the same way. Cite each. A hardware fact is an environment condition, never a design limit.
3. Review whether a stakeholder category is evidently absent. The type list is a guide, not a checklist: raise a question about an absent category only if its absence would create a concrete problem in the objectives or scope already defined, and name that problem.
4. Write section 4 with provenance marks.
5. Run `dp-gap-search` in section mode over section 4.

## Output

Section 4 written: `STK-nn` and `ENV-nn` lines, typed, each cited and
provenance-marked.

## Exit condition

At least one stakeholder and one environment condition are identified, each
with a citation.

## If it fails

If no stakeholder or no environment condition can be found in the material,
raise an open question through `dp-gap-search` instead of inventing one. Do not
ask about a stakeholder category only because the list mentions it: if you
cannot name a concrete problem its absence causes, do not ask.

## Do not

- Do not write a stakeholder or condition without its `STK`/`ENV` identifier and a citation.
- Do not treat a hardware fact as a design limit.
- Do not ask about a stakeholder category only because the type list names it.

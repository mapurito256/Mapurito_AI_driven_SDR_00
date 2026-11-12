---
name: sr-coverage-contrast
description: Computes backward coverage of every objective, in-scope element and active obligation, and runs an independent blind review that sees only the input, to surface omissions the generator missed; loaded by specify-requirements at 01.6, not invoked directly.
---

# sr-coverage-contrast

## Purpose

Check that nothing upstream is left without a requirement, and contrast the draft
against a second, independent reading that never saw the draft. Coverage is
zero-tolerance on empty cells, not a quality score; the independent review finds
what the generator omitted and another reading expected.

## Inputs

- `results/ctx00/problem-baseline.json` and `results/ctx01/record.json`.
- `references/item-schema.md` for the coverage-exclusion and omission codes.

## Procedure

### A. Backward coverage (mechanical set check, then disposition)

List the upstream anchors and which requirements derive from each:

```
jq -r '.objectives[].id' results/ctx00/problem-baseline.json
jq -r '.scope[] | select(.side=="in") | .id' results/ctx00/problem-baseline.json
jq -r '.obligations[] | select(.active==true) | .id' results/ctx00/problem-baseline.json
jq -r '.items[] | select(.type=="REQ") | {id, deriva_de}' results/ctx01/record.json
```

Each anchor must be disposed: covered by a requirement whose `deriva_de` names
it, or excluded with a code from the coverage-exclusion set and a citation. An
undisposed anchor is a G01-5 failure, not a warning. Build the per-anchor table
and flag single-requirement objectives (shown, not blocked).

### B. Independent blind review

Run a second reading with fresh context that sees **only** the Ctx 00 baseline,
the `SRC` snapshots and the obligation categories — never `results/ctx01/record.json`, no
provenance, no item written in this stage. It returns `(anchor_id, category)`
tuples with a citation to the baseline or a snapshot; it proposes no solution.

Prefer a subagent for this reading; if none is available, run it in line and
record `independent_pass: inline`, which is weaker because the context is shared.

### C. Attend the omission candidates

Match each returned tuple against the `deriva_de` and category of the draft.
Every unmatched tuple becomes an omission candidate and must be attended: either
add the item (re-enter `sr-draft-items`), or reject it with a code from the
omission set (`already-covered`, `out-of-scope`, `not-a-gap`) and a reason.

## Output format

Write the coverage table and the omission candidates (`{id, anchor_id, category,
cita, disposition}`) into `results/ctx01/record.json`. Emit `coverage_contrasted` with the
table and the independent-pass mode (`subagent` or `inline`).

## Do not

- Do not let the independent reading see the draft or any provenance.
- Do not treat a coverage percentage as sufficiency; show the per-anchor table.
- Do not leave an omission candidate unattended or reject one without a code.
- Do not load any fixture or example dataset.

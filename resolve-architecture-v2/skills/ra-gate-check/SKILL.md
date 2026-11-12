---
name: ra-gate-check
description: Evaluates gates G02-1 to G02-8 for V1 and V2 as an evidence table — mechanical parts by shell, judgement parts with a cited verdict and an independent recheck — and computes a verdict without deciding it; loaded by resolve-architecture-v2 before each validation, not invoked directly.
---

# ra-gate-check

## Objective

Evaluate the gates for the validation about to be issued. The gate computes and
exposes; it does not decide. Each row gives a verdict (`PASS`, `FAIL`,
`NOT_EVALUABLE`), the ids involved, and one computed line or a quotation. A
`FAIL` does not stop the document from being issued; it blocks `APROBAR` without
changes.

## Gates (wording identical to `references/templates.md`)

| ID | What it checks | How | V1 | V2 |
|---|---|---|---|---|
| G02-1 | Input integrity (hash, status, Ctx 00 with no open questions) | Shell | yes | yes |
| G02-2 | Criteria written and saved before comparing (hash cited) | Shell | yes | yes |
| G02-3 | Eliminatory filter with evidence per cell; every `DEC` cites a `REQ`; criteria derive from `REQ`/`LIM`; critical decisions with 2 or more alternatives or a dominance statement | Judgement + `jq` + recheck | yes | yes |
| G02-4 | Scope and MVP: no component without a `REQ`, no hardware to manufacture, no violation of Ctx 00 `SCP-OUT` | Judgement + recheck | yes | yes |
| G02-5 | Ctx 03 boundary: no parameters and no specification of procedures | Judgement + recheck | yes | yes |
| G02-6 | Questions: none `open` that blocks this gate | Shell (`jq`) | yes | yes |
| G02-7 | Bidirectional coverage (architectural `REQ` to `DEC`/`CMP`; each `CMP` to a `REQ`) and closure of the Ctx 02 `DFR`s | `jq` + judgement + blind review | no | yes |
| G02-8 | Acyclic graph and plan equal to the `tsort` order | Shell | no | yes |

V1 evaluates G02-1 to G02-6 only; G02-7 and G02-8 are evaluated at V2.

## Mechanical evidence (shell)

```
# G02-1: repeat the admission hashes and status of ra-admit-inputs
sha256sum -c results/ctx01/requirements-baseline.sha256
# G02-2: each criteria file hash equals results/ctx02/state.json and is quoted by its comparison file; written first
sha256sum results/ctx02/substages/02.*-criteria.md; jq -r '.criteria_sha256' results/ctx02/state.json
test results/ctx02/substages/02.4-criteria.md -ot results/ctx02/substages/02.4.md && echo order-ok
# G02-3 (part): DEC without a REQ; one alternative and no dominance
jq -r '.items[] | select(.type=="DEC") | select((.reqs|length)==0) | .id' results/ctx02/items.json
jq -r '.items[] | select(.type=="DEC") | select((.alternatives|length)<2 and (.dominance==null)) | .id' results/ctx02/items.json
# G02-6: open questions of this validation's gate (V1 or V2)
jq -r '.questions[] | select(.state=="open" and .gate=="V1") | .id' results/ctx02/questions.json
# G02-8: same text from tsort and from the plan
{ jq -r '.items[]|select(.type=="DEP")|"\(.from) \(.to)"' results/ctx02/items.json; jq -r '.items[]|select(.type=="CMP")|"\(.id) \(.id)"' results/ctx02/items.json; } | tsort
jq -r '.plan[]' results/ctx02/items.json
```
Compare the two lists of G02-8 line by line; a `tsort` error is a `FAIL`. For G02-2
repeat the `test` line for each substage that has a criteria file. A cell that
cannot be checked is `NOT_EVALUABLE`, never `PASS`.

## Judgement evidence and independent recheck

G02-3: is each cell's evidence real and in one unit; does each criterion derive
from a `REQ`/`LIM`; do critical decisions have alternatives. G02-4: component
without a `REQ`, hardware that would be manufactured, any `SCP-OUT` touched,
`beyond-MVP` inside the design. G02-5: any figure not cited or derived, any
procedure specified. G02-7: use the tables of `ra-coverage-contrast`.
Launch a subagent with a fresh context (Agent tool) that sees the artifacts and the
gate wording but not your verdicts, and repeats G02-3 to G02-5. Disagreements are
shown beside the verdict. If the tool is unavailable, run `inline` and record it.

## Warnings (listed apart, never blocking)

Vague adjectives without a measure; options above the cap; datasheet claims
unverified in ordinal criteria; Ctx 03 detail that slipped in; `beyond-MVP`
elements inside the design.

## Output format

The gate rows (V1: six; V2: eight) with verdict, ids and evidence, and the
warnings. Computed verdict: `FAIL on <ids>` or all `PASS`. Emit `GATE_RESULT` with
the validation and the per-gate verdicts. Update `blocked_by` in `results/ctx02/state.json`.

## Do not

- Do not decide approval or sign; the person does.
- Do not turn a warning into a gate, or relax a gate's wording to pass it.
- Do not mark `PASS` a cell, hash or coverage you could not check.
- Do not load any fixture or example dataset.

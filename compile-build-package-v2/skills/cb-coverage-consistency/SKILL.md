---
name: cb-coverage-consistency
description: Runs the 03.5 closure — checks locked hardware is unchanged, cross-module consistency of parameters, units and schemas, the final resource budget, the closure of TBD-Ctx03 ranges, deferrals and open points, coverage both ways, and a blind review of the dispositions; loaded by compile-build-package-v2 at 03.5, not invoked directly.
---

# cb-coverage-consistency

## Objective

Show that the specification is complete (nothing upstream lacks an element, nothing
in the package lacks a requirement) and consistent (modules agree with each other and
with the hardware). Sufficiency (a reader who only has the implementation document
needs no design decision) is tested afterwards by `cb-assemble-spec` at 03.6.
Coverage is zero tolerance on empty cells, not a quality score.

## Inputs

`results/ctx03/items.json`, `results/ctx03/spec-register.json`,
`results/ctx03/specs/`, the admitted inputs, `references/item-schema.md`.

## Steps

1. **Locked hardware unchanged** (mechanical):
   ```
   jq -S -c '[.items[] | select(.locked_v1==true)]' results/ctx03/items.json | sha256sum
   jq -r '.v1_locked_sha256' results/ctx03/state.json
   ```
   A difference means an approved item changed: do not continue; the change is
   `escalate:V1` for the human (`cb-feedback-cycle`).
2. **Forward coverage.**
   ```
   comm -23 <(jq -r '.items[]|select(.type=="REQ" or .type=="LIM" or .type=="AC" or .type=="DFR")|.id' results/ctx01/requirements-baseline.json|sort) <(jq -r '.dispositions[].upstream_id' results/ctx03/items.json|sort)
   comm -23 <(jq -r '.dispositions[]|select(.disposition=="specify")|.upstream_id' results/ctx03/items.json|sort) <(jq -r '.specs[].closes[]' results/ctx03/spec-register.json|sort -u)
   jq -r '.specs[]|select(.status!="done")|.id' results/ctx03/spec-register.json
   ```
   Each command must print nothing. An upstream id without a disposition or a
   `specify` id outside every `SPEC` is a G03-5 failure; a `SPEC` not `done` too.
3. **Backward coverage.** An element without a requirement is a scope defect:
   ```
   jq -r '.items[]|select(.type=="PAR" or .type=="PRC" or .type=="SCH" or .type=="ERR" or .type=="TST")|select(((.reqs // (if .for_req then [.for_req] else [] end))|length)==0)|.id' results/ctx03/items.json
   jq -r '.specs[]|select((.closes|length)==0)|.id' results/ctx03/spec-register.json
   ```
   Drop the element or find its `REQ`. A `reqs` id that is not in `dispositions` is
   a defect.
4. **Cross-module consistency** (read the digests and `jq` by name):
   - Units: one unit per quantity across modules; flag any quantity written in two.
   - Parameters: the same `PAR` name has one value; a value copied into a module
     file equals the item.
   - Schemas: for each `SCH`, producer fields and consumer fields have the same
     names, types, units and version.
   - Time and rate: the sweep, frame, report and verification periods are mutually
     compatible (written as one line of arithmetic).
   - Procedures: every procedure that a module depends on exists and its output
     schema is the input of the dependent.
   ```
   jq -r '[.items[]|select(.type=="PAR")]|group_by(.name)[]|select((map("\(.value) \(.unit)")|unique|length)>1)|.[0].name' results/ctx03/items.json
   ```
   (prints each parameter name that carries two different values; it must print
   nothing).
5. **Closures.**
   - `tbd_closure`: every Ctx 02 `CMP` with a `TBD-Ctx03` range has a `closed_by`
     `HW` or `PAR`:
     ```
     jq -r '.tbd_closure[]|select(.closed_by==null)|.cmp' results/ctx03/items.json
     ```
   - `dfr`: every Ctx 01 `DFR` with `etapa_responsable` `Ctx03` names its closing
     `PAR` with the value inside `horquilla` and the closing criterion met; those of
     `implementation` stay `travels-intact` with a note that their window is still
     open. Show the closure table.
   - `open_points`: each `OP-nn` is `closed` by a snapshot or derivation, or stays
     `open` with a named `hardware-qualification` test.
6. **Final budget.** Load `cb-resource-budget` in `final` mode and settle every row.
   Apply the remedy ladder; `escalate:V1`, `R2`, `R1` or `R0` as it says.
7. **Blind review of dispositions.** Launch a subagent with a fresh context. It
   sees only the Ctx 01 `REQ`/`LIM`/`AC`/`DFR` text and the Ctx 00 document, never
   `results/ctx03/` or the Ctx 02 design. For each it proposes a disposition
   (`specify`, `hardware`, `already-closed`, `not-applicable`) with a quote. If the
   tool is unavailable, run `inline` and record `independent_pass: inline`, which
   is weaker.
8. **Attend disagreements.** Compare with `dispositions` and write `blind_review`
   entries. For each, either change the disposition and add the missing spec or
   element (re-enter the owning skill) or keep it with a written reason. Never
   resolve silently.
9. Write `results/ctx03/substages/03.5.md`: consistency findings, closure tables,
   final budget, coverage tables, blind-review table, pass modes.

## Output format

`results/ctx03/items.json` (`blind_review`, `dfr`, `tbd_closure`, `open_points`,
`budget`), `results/ctx03/substages/03.5.md`. The orchestrator emits
`SUBSTAGE_END`; the result is evidence for G03-5 to G03-9 in `cb-gate-check`.

## Do not

- Do not let the blind review see the design, the dispositions or earlier
  answers.
- Do not show a coverage percentage as sufficiency; show the per-id table.
- Do not leave a disagreement unattended.
- Do not close a `DFR` outside its window or modify an upstream item.
- Do not load any fixture or example dataset.

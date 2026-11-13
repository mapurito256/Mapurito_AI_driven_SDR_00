---
name: cb-gate-check
description: Evaluates gates G03-1 to G03-12 for V1 and V2 as an evidence table — mechanical parts by shell, judgement parts with a cited verdict and an independent recheck — and computes a verdict without deciding it; loaded by compile-build-package-v2 before each validation, not invoked directly.
---

# cb-gate-check

## Objective

Evaluate the gates for the validation about to be issued. The gate computes and
exposes; it does not decide. Each row gives a verdict (`PASS`, `FAIL`,
`NOT_EVALUABLE`), the ids involved, and one computed line or a quotation. A
`FAIL` does not stop the document from being issued; it blocks `APROBAR` without
changes.

## Gates (wording identical to `references/templates.md`)

| ID | What it checks | How | V1 | V2 |
|---|---|---|---|---|
| G03-1 | Input integrity (Ctx 02 and Ctx 01 hashes and status; Ctx 00 with no open questions) | Shell | yes | yes |
| G03-2 | Criteria written and saved before comparing (hash cited) | Shell | yes | yes |
| G03-3 | Hardware selection: eliminatory evidence per cell from datasheet snapshots; at most two options per component or a dominance statement; interface compatibility between neighbours; every reference serves a `CMP`; nothing to manufacture | Judgement + `jq` + recheck | yes | yes |
| G03-4 | Questions: none `open` that blocks this validation | Shell (`jq`) | yes | yes |
| G03-5 | Register: every `REQ`/`LIM`/`AC`/`DFR` has a disposition; every `specify` item, every `TBD-Ctx03` `CMP` and every open point is closed by a `SPEC`; at V2 every `SPEC` is `done` | `jq` + judgement | yes (register) | yes (all done) |
| G03-6 | Parameters: value, unit, range, rationale, sensitivity and sources present; no `TBD` left; units consistent; every `DFR` of Ctx 03 closed inside its window | `jq` + judgement + recheck | no | yes |
| G03-7 | Resource and hardware fit: budget rows with margin, no `exceeds`, no `unverified` without a qualification test; Ctx 02 open points closed | Judgement + arithmetic + recheck | yes (provisional) | yes (final) |
| G03-8 | Tests: one `TST` per `AC`, threshold equality, three cases, `fails_if`; every `REQ`/`LIM` covered | `jq` + judgement + blind review | no | yes |
| G03-9 | Boundary and immutability: no Ctx 00/01/02 item modified, no new requirement, no architecture change, no executable code, no uncited figure, V1-locked hardware unchanged | `jq` + hash + judgement + recheck | yes (no code, figures, immutability) | yes |
| G03-10 | Order: dependency graph acyclic and the register `order` equals the `tsort` order | Shell | yes | yes |
| G03-11 | Consumer test: a blind implementer reading only the implementation document lists no question that needs a design decision | Judgement by subagent | no | yes |
| G03-12 | Implementation document: every requirement, limit, criterion, deferral, component, decision, hardware, parameter, procedure, schema, error code and test id appears in it; every parameter value equals its item; no process material, placeholder, code, problem or scope section; assembled from sources only | Shell (`jq`, `grep`) + judgement | no | yes |

V1 evaluates G03-1 to G03-5, G03-7 (provisional), G03-9 (partial) and G03-10:
eight gates. V2 evaluates all twelve.

## Mechanical evidence (shell)

```
# G03-1
sha256sum -c results/ctx02/architecture-baseline.sha256
sha256sum -c results/ctx01/requirements-baseline.sha256
# G03-2: criteria hash equals state and was written before the comparison file
sha256sum results/ctx03/substages/03.2-criteria.md; jq -r '.criteria_sha256' results/ctx03/state.json
test results/ctx03/substages/03.2-criteria.md -ot results/ctx03/substages/03.2.md && echo order-ok
# G03-3 (part): hardware decisions with more than two alternatives, or one and no dominance
jq -r '.items[]|select(.type=="DEC" and .class=="hw-selection")|select((.alternatives|length)>2 or ((.alternatives|length)<2 and .dominance==null))|.id' results/ctx03/items.json
# G03-4
jq -r '.questions[]|select(.state=="open" and .gate=="V1")|.id' results/ctx03/questions.json   # use "V2" at V2
# G03-5
comm -23 <(jq -r '.items[]|select(.type=="REQ" or .type=="LIM" or .type=="AC" or .type=="DFR")|.id' results/ctx01/requirements-baseline.json|sort) <(jq -r '.dispositions[].upstream_id' results/ctx03/items.json|sort)
comm -23 <(jq -r '.dispositions[]|select(.disposition=="specify")|.upstream_id' results/ctx03/items.json|sort) <(jq -r '.specs[].closes[]' results/ctx03/spec-register.json|sort -u)
jq -r '.specs[]|select(.status!="done")|.id' results/ctx03/spec-register.json                   # V2 only
# G03-6
jq -r '.items[]|select(.type=="PAR")|select(.value==null or .unit==null or .range==null or .rationale==null or .sensitivity==null or ((.reqs|length)==0))|.id' results/ctx03/items.json
grep -rnwiE 'TBD|TODO|to be defined' results/ctx03/specs
# G03-8
comm -3 <(jq -r '.items[]|select(.type=="AC")|.id' results/ctx01/requirements-baseline.json|sort) <(jq -r '.items[]|select(.type=="TST" and .for_ac!=null)|.for_ac' results/ctx03/items.json|sort)
jq -r '.items[]|select(.type=="TST" and .for_ac!=null)|.for_ac' results/ctx03/items.json | sort | uniq -d
diff <(jq -S -c '.items[]|select(.type=="AC")|{id,operador,umbral,unidad}' results/ctx01/requirements-baseline.json | sort) <(jq -S -c '.items[]|select(.type=="TST" and .for_ac!=null)|{id:.for_ac,operador,umbral,unidad}' results/ctx03/items.json | sort)
jq -r '.items[]|select(.type=="TST" and .level=="acceptance")|select(([.cases[].kind]|unique|length)<3 or .fails_if==null)|.id' results/ctx03/items.json
# G03-9: immutability, locked hardware, no executable code
jq -S -c '[.items[]|select(.locked_v1==true)]' results/ctx03/items.json | sha256sum; jq -r '.v1_locked_sha256' results/ctx03/state.json
grep -rnE '^[`]{3}(python|bash|sh|c|cpp|rust|js|javascript)' results/ctx03/specs
# G03-10
jq -r '.specs[]|.id as $i|(.depends_on[]?|"\(.) \($i)"), "\($i) \($i)"' results/ctx03/spec-register.json | tsort
jq -r '.order[]' results/ctx03/spec-register.json
# G03-12: run the fidelity checks of references/implementation-doc.md on
# results/ctx03/validations/V2/R<n>/final-spec.md (each must print nothing)
```
Compare the two lists of G03-10 line by line; a `tsort` error is a `FAIL`. For the
`diff` of G03-8, every remaining line is a row to judge: only a threshold deferred by
a `DFR` and replaced by its closed `PAR` value may differ, and the value must lie
inside `horquilla`; any other difference is a `FAIL`. The commands that must print
nothing are `FAIL` if they print an id. A check that cannot be run is
`NOT_EVALUABLE`, never `PASS`. At V1 the locked-hash line is not yet evaluable
(nothing is locked): record `NOT_EVALUABLE` and judge the rest of G03-9.

## Judgement evidence and independent recheck

G03-3: is each cell's evidence real and in one unit; do options respect the cap;
are neighbours compatible. G03-5: are dispositions reasoned. G03-6: are rationales
real and sensitivities meaningful; no remission instead of a value. G03-7: recompute
each budget row's arithmetic from its operands; check each capacity is cited and
each margin kept. G03-9: any figure not cited or derived; any `Ctx 02` decision
reopened; any new requirement; any procedure or value needing a decision the
builder would have to make. G03-8: use the tables and results of `cb-test-design`
and `cb-coverage-consistency`. G03-11 and G03-12: use the consumer-test table and the
fidelity and exclusion findings recorded in `results/ctx03/substages/03.6.md` by
`cb-assemble-spec`; check that the document holds no problem, scope or objectives
text, no discarded alternative and no process id.
Launch a subagent with a fresh context (Agent tool) that sees the artifacts and the
gate wording but not your verdicts, and repeats G03-3, G03-6, G03-7 and G03-9.
Disagreements are shown beside the verdict. If the tool is unavailable, run
`inline` and record it.

## Warnings (listed apart, never blocking)

Vague adjectives without a measure; `tight` budget rows; planning margins that are
`propuesto`; options above the cap; datasheet claims `unverified` in ordinal
criteria; `defer:build` themes; `beyond-MVP` elements inside the package;
provisional values still unresolved.

## Output format

The gate rows (V1: eight; V2: twelve) with verdict, ids and evidence, and the
warnings. Computed verdict: `FAIL on <ids>` or all `PASS`. Emit `GATE_RESULT` with
the validation and the per-gate verdicts. Update `blocked_by` in
`results/ctx03/state.json`.

## Do not

- Do not decide approval or sign; the person does.
- Do not turn a warning into a gate, or relax a gate's wording to pass it.
- Do not mark `PASS` a cell, hash, budget or coverage you could not check.
- Do not load any fixture or example dataset.

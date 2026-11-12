---
name: ra-coverage-contrast
description: Computes coverage in both directions between REQ/LIM and the design, checks that every Ctx 02 DFR is closed and that V1-locked items are unchanged, and runs a blind review by a subagent that sees only the input; loaded by resolve-architecture-v2 at 02.7, not invoked directly.
---

# ra-coverage-contrast

## Objective

Show that nothing architectural upstream lacks a design element, that nothing in
the design lacks a `REQ`, and that every `DFR` assigned to Ctx 02 is closed. Then
contrast the dispositions of 02.1 against a second reading that never saw them.
Coverage is zero tolerance on empty cells, not a quality score.

## Inputs

`results/ctx02/items.json` (`dispositions`, `dfr`, `DEC`, `CMP`), the admitted inputs,
`references/item-schema.md`.

## Steps

1. **Locked hardware unchanged** (mechanical). Recompute the hash of the V1-locked
   items and compare with `v1_locked_sha256` of `results/ctx02/state.json`:
   ```
   jq -S -c '[.items[] | select(.locked_v1==true)]' results/ctx02/items.json | sha256sum
   jq -r '.v1_locked_sha256' results/ctx02/state.json
   ```
   A difference means an approved item changed: do not continue; the change is
   `escalate:V1` for the human (`ra-feedback-cycle`).
2. **Forward coverage.** List every upstream `REQ`/`LIM` with disposition
   `architectural` and the `DEC`/`CMP` whose `reqs` name it:
   ```
   jq -r '.dispositions[] | select(.disposition=="architectural") | .upstream_id' results/ctx02/items.json
   jq -r '.items[] | select(.type=="DEC" or .type=="CMP") | {id, reqs}' results/ctx02/items.json
   ```
   An architectural id with no `DEC`/`CMP` is a G02-7 failure, not a warning.
3. **Backward coverage.** List the `CMP` with an empty `reqs` or a `reqs` id absent
   from `dispositions`:
   ```
   jq -r '.items[] | select(.type=="CMP") | select((.reqs|length)==0) | .id' results/ctx02/items.json
   ```
   Such a component is dropped or its `REQ` found; a component with no `REQ` is a
   scope defect.
4. **DFR closure.** List the Ctx 01 `DFR` with `etapa_responsable` `Ctx02`:
   ```
   jq -r '.dfr[] | select(.etapa_responsable=="Ctx02") | select(.action==null) | .dfr_id' results/ctx02/items.json
   ```
   Each must name a closing `DEC` (`closes`). Those of other stages stay
   `travels-intact`. Show the closure table.
5. **Blind review.** Launch a subagent with a fresh context and the Agent tool. It
   sees only the Ctx 01 `REQ`/`LIM` statements and the Ctx 00 document, never
   `results/ctx02/items.json`, dispositions, or any design. For each `REQ`/`LIM` it returns a
   proposed disposition (`architectural`, `detail-for-Ctx03`, `not-architectural`)
   with a quote. If the tool is unavailable, run `inline` and record
   `independent_pass: inline`, which is weaker.
6. **Attend disagreements.** Compare each proposal with `dispositions` and write
   `blind_review` entries. For each disagreement either change the disposition and
   add the missing `DEC`/`CMP` (re-enter the owning skill), or keep it with a
   written reason. Disagreements are shown in the document, never resolved
   silently.
7. Write `results/ctx02/substages/02.7.md` with the coverage tables, the closure table, the
   blind-review table and the pass mode.

## Output format

`results/ctx02/items.json` (`blind_review`, `dfr`), `results/ctx02/substages/02.7.md`. The orchestrator emits
`SUBSTAGE_END`; the result is evidence for G02-7 in `ra-gate-check`.

## Do not

- Do not let the blind review see the design or any disposition.
- Do not show a coverage percentage as sufficiency; show the per-id table.
- Do not leave a disagreement unattended or resolve it silently.
- Do not close a `DFR` without a `DEC`, or modify an upstream item.
- Do not load any fixture or example dataset.

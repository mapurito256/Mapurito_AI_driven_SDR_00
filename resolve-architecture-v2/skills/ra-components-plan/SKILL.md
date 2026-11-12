---
name: ra-components-plan
description: Converts the decisions into components (CMP) and dependencies (DEP) and derives the implementation plan as the topological order computed with tsort (02.6); loaded by resolve-architecture-v2, not invoked directly.
---

# ra-components-plan

## Objective

Turn every `DEC` into the components that realise it, state their dependencies,
and let `tsort` produce the order. The plan is calculated, never written by hand;
if the graph has a cycle there is no plan.

## Inputs

`results/ctx02/items.json` (all `DEC`, the Phase A `CMP`), `results/ctx02/substages/02.4.md`, `02.5.md`,
`references/item-schema.md`, `references/mvp-criteria.md`.

## Steps

1. For each `DEC` list the component(s) it requires. Add a `CMP` for each software
   component (`realization: software`) with its function, `reqs`, `decided_by`
   and `integration_note`. SDR and board already exist as `acquired-ref`; the rest
   of the hardware as `acquired-spec`. Write nothing that must be manufactured.
2. Every `CMP` cites at least one `REQ`/`LIM` in `reqs`. A component that cannot
   is dropped or moved to `beyond_mvp` (`references/mvp-criteria.md`).
3. Write each dependency as a `DEP` (`from` is the prerequisite, `to` the
   dependent) with a one-line reason naming the interface or data flow, and its
   provenance.
4. **Plan with `tsort`.** Pipe the edge list, plus one self-pair per component so isolated
   components appear in the order, into `tsort`:
   ```
   { jq -r '.items[] | select(.type=="DEP") | "\(.from) \(.to)"' results/ctx02/items.json
     jq -r '.items[] | select(.type=="CMP") | "\(.id) \(.id)"' results/ctx02/items.json; } | tsort
   ```
   If `tsort` reports a cycle, the stage has no plan: break the cycle by changing
   a `DEP` or a decision, and repeat. Never bypass the check. Store the output as
   `plan` in `results/ctx02/items.json` and as the list in `results/ctx02/substages/02.6.md`.
5. Re-check that no `CMP` has an empty `reqs` and that every `DEP` end is an
   existing `CMP`:
   ```
   jq -r '.items[] | select(.type=="CMP" and ((.reqs|length)==0)) | .id' results/ctx02/items.json
   jq -r '[.items[]|select(.type=="CMP")|.id] as $c | .items[] | select(.type=="DEP") | select(([.from,.to]-$c|length)>0) | .id' results/ctx02/items.json
   ```
6. Close each Ctx 02 `DFR` of Ctx 01 with a `DEC` (`closes`) and write that id
   into `dfr` of `results/ctx02/items.json`; a `DFR` that cannot be closed here becomes a
   question for the human (`ra-gap-questions`, `design`), not a silent leave-open.
7. Write `results/ctx02/substages/02.6.md`: component table, dependency table, the `tsort`
   output, the cycle check result.

## Output format

`results/ctx02/items.json` (`CMP`, `DEP`, `plan`, `dfr`), `results/ctx02/substages/02.6.md`. The orchestrator
emits `SUBSTAGE_END`.

## Do not

- Do not write the plan by hand or reorder `tsort`'s output.
- Do not create a component without a `REQ`/`LIM`, or one that must be built.
- Do not add a component or dependency "for completeness".
- Do not give a brand or part number to any `CMP` except the SDR and the board.
- Do not load any fixture or example dataset.

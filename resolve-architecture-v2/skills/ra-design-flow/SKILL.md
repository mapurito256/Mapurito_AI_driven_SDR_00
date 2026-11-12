---
name: ra-design-flow
description: Designs the end-to-end system flow with the smallest base architecture that covers the mandatory requirements (02.2), then decides which RF front-end elements are needed and writes a characteristic card for each (02.3); loaded by resolve-architecture-v2, not invoked directly.
---

# ra-design-flow

## Objective

Draw the system as functional blocks without brands, choose the minimal base
architecture, and decide for every RF front-end element whether it is needed, with
a reason. What is needed becomes a characteristic card; what is not needed keeps
its reason. Hardware is bought: no card describes something to manufacture.

## Inputs

`results/ctx02/substages/02.1.md` (dispositions, candidates), `results/ctx02/items.json`, the admitted inputs,
`references/decision-classes.md` (Phase A classes), `references/mvp-criteria.md`,
`references/item-schema.md`.

## Part 1 — 02.2 flow and base architecture

1. List the `REQ`/`LIM` marked `architectural` that shape the flow.
2. Draw the chain as blocks in order: antenna, protection, switching,
   conditioning, SDR, host, processing, reporting. Drop a block only with a
   written reason citing a `REQ`/`LIM`; add none that nothing requires.
3. Start from the small base architectures (one host with one SDR; with an
   intermediate RF chain; several nodes) and choose the minimal one that covers
   every mandatory `REQ`. If more than one plausible variant remains, apply the
   comparison method of `ra-hardware-options` with the criteria file
   `results/ctx02/substages/02.2-criteria.md`; a choice that belongs to the human becomes a
   question (`ra-gap-questions`, `design`).
4. Record a `DEC` of class `system-topology` and one of `functional-flow`, each
   citing the `REQ`/`LIM` it serves.
5. Write `results/ctx02/substages/02.2.md`.

## Part 2 — 02.3 RF path and characteristic cards

1. For each element, decide needed or not needed: antenna or antenna array,
   switch, RF protection (limiter, DC block, discharge), filter, low-noise
   amplifier, attenuator. Record one `DEC` of class `rf-element` per element with
   `chosen: needed` or `not-needed`, `needed_reason`, and the `REQ`/`LIM` it rests
   on.
2. For each needed element write a `CMP` with `realization: acquired-spec`:
   function, chain position, required characteristics, the `REQ`/`LIM` each
   derives from, and an integration note.
3. `range` is written only if a source gives it or it is derived, with the
   operation written out and `procedencia`. Otherwise `range: TBD-Ctx03` with a
   `closure_criterion`. No brand, part number or chosen value appears.
4. Power, cabling and enclosure get a card the same way, class `support-hardware`,
   only if a `REQ` or `LIM` requires them.
5. A desirable element no `REQ` requires goes to `beyond_mvp`.
6. Write `results/ctx02/substages/02.3.md`. The RF-path variant is part of each hardware option
   built next in 02.4.

## Output format

`results/ctx02/items.json` gains `DEC` and `CMP` items; `results/ctx02/substages/02.2.md` (blocks, base
architecture, reasons) and `results/ctx02/substages/02.3.md` (element table: needed or not and
why; card list). The orchestrator emits `SUBSTAGE_END`.

## Do not

- Do not name a brand, model or part number for anything but the SDR and the
  board (and those only in 02.4).
- Do not write a figure that is not cited from a `REQ`, `LIM` or datasheet or
  derived with its operation.
- Do not specify a procedure or a parameter (Ctx 03).
- Do not add a block, element or card with no `REQ` behind it.
- Do not treat a Ctx 00 suggested solution as decided.
- Do not load any fixture or example dataset.

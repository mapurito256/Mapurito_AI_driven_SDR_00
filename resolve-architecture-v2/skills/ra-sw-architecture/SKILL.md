---
name: ra-sw-architecture
description: Decides the types of procedure, algorithm and process of the software side (02.5) — estimator and detector families, existence of a calibration, sweep strategy, inter-block representation, error handling, storage, reporting — with the conditional learned-model class and the Ctx 03 boundary; loaded by resolve-architecture-v2, not invoked directly.
---

# ra-sw-architecture

## Objective

Decide the *type* of each software procedure, algorithm and process, and why.
Never the parameters, the procedure or the schema: those belong to Ctx 03. This
runs after V1 approved the hardware; the approved items are locked.

## Inputs

`results/ctx02/items.json` with the V1-locked items, `results/ctx02/substages/02.1.md` dispositions, the
Phase B classes of `references/decision-classes.md`, the feedback and
`integration.md` of V1, `references/mvp-criteria.md`, `references/item-schema.md`.

## Steps

1. Take the `REQ`/`LIM` with disposition `architectural` that the software side
   must satisfy. Walk the Phase B classes of `decision-classes.md`; for each class
   that a `REQ`/`LIM` touches, record a `DEC` citing it. For a class none touches,
   write one line saying so; do not invent a decision.
2. For each `DEC` state: the decision, the family or type chosen, the
   alternatives (two or more, or a dominance statement), and the reason.
   If more than one plausible alternative remains, apply the comparison method of
   `ra-hardware-options` with the criteria file `results/ctx02/substages/02.5-criteria.md`,
   written and hashed before comparing.
3. **Boundary table.** For every `DEC` write a line `Ctx 02 decides: <type> |
   Ctx 03 specifies: <what>`. What stays in Ctx 03: every parameter and unit, behaviour under degraded
   input, the calibration procedure, concrete configuration, versioned schemas,
   error codes and tests.
4. A figure appears only if cited from a `REQ`, `LIM` or datasheet snapshot, or
   written as a derivation. Otherwise leave it for Ctx 03.
5. **Calibration.** Decide only that one exists, what it calibrates, and when it
   runs. If a `REQ` does not require one, record that.
6. **Learned-model class (conditional).** Active only if a `REQ` demands an
   inference that a normalised measurement cannot cover. The baseline is a
   classical algorithm. If active, decide need, model family and dataset route and
   note that Ctx 03 produces the values with the `sdr-modelo-*` and
   `sdr-dataset-*` skills. If no `REQ` demands it, record the class as inactive
   with that statement and stop.
7. A decision that would change a V1-locked item is not made here: raise
   `escalate:V1` in the next document (`ra-feedback-cycle` rules) or ask a
   question. A need that only emerges from presentation R3 on is closed by the
   most viable option, `propuesto`, `forced: by-limit`.
8. A choice that belongs to the human is noted as a candidate question; the
   `design` pass of 02.7 raises it.
9. Desirable-but-unneeded software goes to `beyond_mvp`.
10. Write `results/ctx02/substages/02.5.md`: the `DEC` list, the boundary table, the inactive
    classes with their statement.

## Output format

`results/ctx02/items.json` gains `DEC` items; `results/ctx02/substages/02.5.md`; optional
`results/ctx02/substages/02.5-criteria.md`. The orchestrator emits `SUBSTAGE_END`.

## Do not

- Do not write a parameter, a value to tune, a procedure step or a schema.
- Do not activate the learned-model class on a nice-to-have.
- Do not alter a V1-locked item or any Ctx 00 or Ctx 01 item.
- Do not record a `DEC` that cites no `REQ`/`LIM`.
- Do not load any fixture or example dataset.

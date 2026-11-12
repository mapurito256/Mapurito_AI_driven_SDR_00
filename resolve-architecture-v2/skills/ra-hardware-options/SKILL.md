---
name: ra-hardware-options
description: Builds the hardware proposal of 02.4 — criteria first, eliminatory filter, ordinal comparison, robustness note, one to three options for the SDR and the compute board with datasheet snapshots — and holds the comparison method used by every substage that compares alternatives; loaded by resolve-architecture-v2, not invoked directly.
---

# ra-hardware-options

## Objective

Propose the SDR reference and the compute-board reference as coherent options,
chosen without a rules engine: written criteria, an eliminatory filter, an
ordinal comparison with cited reasons, and a robustness note. The human decides.

## Comparison method (used by 02.2, 02.4 and 02.5 for any decision with alternatives)

1. **Criteria first.** Write the criteria file `results/ctx02/substages/02.<n>-criteria.md`
   before looking at any alternative. Each criterion derives from a `REQ`, `LIM` or
   Ctx 00 `SCP-OUT`; eliminatory ones derive from what is mandatory; each ordinal
   one defines its three levels in text (1 worst, 3 best). Then save
   `sha256sum` of the file into `criteria_sha256` of `results/ctx02/state.json`.
2. **Eliminatory filter.** Each cell cites the `REQ`/`LIM`, writes both values in
   one unit and the comparison. A cell without a citation to the datasheet
   snapshot is `unverified` and can never be `pass`.
3. **Ordinal comparison** among survivors, one level per criterion with a cited
   reason per cell. No weights, no sums.
4. **Robustness note**, one line per decision: would the result change if the most
   debatable criterion were ignored.
5. **Recommendation** (optional), `propuesto`. The comparison file
   (`results/ctx02/substages/02.<n>.md`) quotes the criteria-file hash; a mismatch fails G02-2.
6. **Recheck.** A subagent with fresh context repeats only the eliminatory cells
   from the criteria file and the snapshots. Disagreements are shown in the
   document, never resolved silently. If unavailable, run `inline` and record it.

## Steps for 02.4

1. Read `results/ctx02/substages/02.2.md`, `02.3.md`, the `LIM` list and the candidates of
   `02.1.md`. Apply the comparison method to the SDR and to the board; limit the
   search to 6 references per category.
2. **Datasheets.** Use `WebSearch` and `WebFetch` only for the SDR and the board of
   each option. Save each as `results/ctx02/sources/SRC-02-nn.md` with URL, access date and the
   extract used. A figure from a datasheet is `declarado` only inside that
   extract. Nothing is read from memory.
3. Build options as sets: SDR reference + board reference + RF-path variant (from
   02.3). Offer 2 or 3. Offer one only with a dominance statement and the
   discarded alternatives listed with their cause (`references/mvp-criteria.md`).
4. If no purchasable combination passes the eliminatory filter for a mandatory
   `REQ` or `LIM`, do not invent hardware: emit `ESCALATION` `R1` with the
   failing cells, set `status: returned_upstream`, and hand to
   `ra-feedback-cycle` for `results/ctx02/CONTEXT-ctx02.md`.
5. Record the `DEC` items (classes `sdr-reference`, `board-reference`) and, for the
   recommended or chosen references, a `CMP` with `realization: acquired-ref` and
   `reference` citing its `SRC-02-nn`. Everything else stays a characteristic card.
6. Write `results/ctx02/substages/02.4.md` (options, matrices, robustness) with the criteria
   hash. Then the orchestrator loads `ra-gap-questions` (`design`).

## Output format

`results/ctx02/substages/02.<n>-criteria.md`, `results/ctx02/substages/02.4.md`, `results/ctx02/sources/SRC-02-nn.md`,
`results/ctx02/items.json` updates, `criteria_sha256` in `results/ctx02/state.json`.

## Do not

- Do not compare before the criteria file is written and its hash saved.
- Do not record a `pass` without a snapshot citation; it is `unverified`.
- Do not use weights, scores or sums.
- Do not force a second option to reach two; do not exceed three options.
- Do not give any component but the SDR and the board a brand or part number.
- Do not propose hardware that must be manufactured.
- Do not use web access outside 02.4.
- Do not load any fixture or example dataset.

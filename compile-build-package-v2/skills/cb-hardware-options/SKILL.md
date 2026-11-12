---
name: cb-hardware-options
description: Builds the 03.2 hardware proposal — written criteria first, eliminatory filter, ordinal comparison, robustness note, at most two catalogue options per component beyond the SDR and the board, with datasheet snapshots and closure of the Ctx 02 TBD-Ctx03 ranges — and holds the comparison method for any decision with alternatives; loaded by compile-build-package-v2, not invoked directly.
---

# cb-hardware-options

## Objective

Replace each Ctx 02 characteristic card (every `CMP` with
`realization: acquired-spec`) with a concrete, purchasable reference, chosen
without a rules engine: written criteria, an eliminatory filter, an ordinal
comparison with cited reasons, and a robustness note. The SDR and the board keep
the references fixed by Ctx 02. The human decides at V1.

## Comparison method (any decision with alternatives)

1. **Criteria first.** Write the criteria file
   `results/ctx03/substages/03.2-criteria.md` before looking at any alternative,
   one section per component. Each criterion derives from a `REQ`, `LIM`, `AC`, a
   Ctx 02 `CMP` characteristic or a Ctx 00 `SCP-OUT`; eliminatory ones derive from
   what is mandatory; each ordinal one defines its three levels in text (1 worst,
   3 best). Then save `sha256sum` of the file into `criteria_sha256` of
   `results/ctx03/state.json`.
2. **Eliminatory filter.** Each cell cites the `REQ`/`LIM`/characteristic, writes
   both values in one unit and the comparison. A cell without a citation to a
   datasheet snapshot is `unverified` and can never be `pass`.
3. **Ordinal comparison** among survivors, one level per criterion with a cited
   reason per cell. No weights, no sums.
4. **Robustness note**, one line per decision: would the result change if the most
   debatable criterion were ignored.
5. **Recommendation** (optional), `propuesto`. The comparison file quotes the
   criteria-file hash; a mismatch fails G03-2.
6. **Recheck.** A subagent with fresh context repeats only the eliminatory cells
   from the criteria file and the snapshots. Disagreements are shown in the
   document, never resolved silently. If unavailable, run `inline` and record it.

## Steps for 03.2

1. Read `results/ctx03/substages/03.1.md`, the register entries of kind
   `hardware`, each `acquired-spec` `CMP` with its characteristics, `range`,
   `closure_criterion` and `integration_note`, and the `LIM` list.
2. Write the criteria file and save its hash (comparison method step 1).
3. **Datasheets.** Use `WebSearch` and `WebFetch` only for the components of this
   step. Queries carry the component class, the required characteristics and
   manufacturer or model names only; never project, user or location details.
   Save each as `results/ctx03/sources/SRC-03-nn.md` with URL, access date and the
   extract used. A figure from a datasheet is `declarado` only inside that extract.
   Nothing is read from memory. Limit the search to 6 references per component.
4. For each component apply the comparison method. Offer **at most two options**;
   offer a second only if it is a real alternative on at least one criterion. Offer
   one only with a dominance statement and the discarded alternatives with their
   cause (`references/mvp-criteria.md`). Never force a second.
5. **Neighbour compatibility.** For each pair joined in the Ctx 02 chain write the
   check: connector and gender, impedance or bus, frequency range, level, supply
   voltage and current. An incompatible pair is a `fail` on the eliminatory
   criterion of the later component, not a note.
6. **Fixed hardware.** Copy the SDR and board references from Ctx 02 into `HW`
   entries and add from their snapshots the characteristics later budgets need:
   sample-rate limit, resolution, interface throughput, core count, memory,
   maximum operating temperature, supply requirement. A characteristic missing
   from the existing snapshot gets a new `SRC-03-nn` snapshot; if it cannot be
   found it stays `unverified`.
7. **Closure of ranges.** For each `CMP` with `range: TBD-Ctx03` of an
   `acquired-spec`, the chosen reference closes it: write `range_closure` in the
   `HW` and a `tbd_closure` row.
8. If no purchasable option passes the eliminatory filter for a mandatory `REQ`,
   `LIM` or `AC`, do not invent hardware: emit `ESCALATION` `R1` with the failing
   cells (or `R2` when a Ctx 02 characteristic is what no product meets), set
   `status: returned_upstream` and hand to `cb-feedback-cycle`.
9. Record `DEC` items (class `hw-selection`) and one `HW` per component, with
   `alternatives_considered`. A desirable component no `REQ` requires goes to
   `beyond_mvp`.
10. Write `results/ctx03/substages/03.2.md` (options, matrices, compatibility,
    robustness, criteria hash). Then the orchestrator loads `cb-resource-budget`
    (`provisional`).

## Output format

`results/ctx03/substages/03.2-criteria.md`, `results/ctx03/substages/03.2.md`,
`results/ctx03/sources/SRC-03-nn.md`, `results/ctx03/items.json` updates (`HW`,
`DEC`, `tbd_closure`), `criteria_sha256` in `results/ctx03/state.json`.

## Do not

- Do not compare before the criteria file is written and its hash saved.
- Do not record a `pass` without a snapshot citation; it is `unverified`.
- Do not use weights, scores or sums.
- Do not force a second option; do not exceed two per component.
- Do not propose hardware that must be manufactured or adapted.
- Do not change the SDR or the board; that is `escalate:R2`.
- Do not use web access outside 03.2 or send project or user details.
- Do not load any fixture or example dataset.

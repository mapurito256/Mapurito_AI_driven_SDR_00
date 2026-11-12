---
name: record-schema
description: Shared formats for Ctx 00 (define-problem) — working files, identifiers, item lines, document layout, categories, provenance, citations, open-question block and the CONTEXT template. Read by every dp-* skill.
---

# record-schema — shared formats for Ctx 00

## Objective

The single place where the stage's formats are defined; skills refer here by
heading title, and this file prevails over them. Mechanical checks use
`sha256sum`, `grep` and `jq`.

## Working files

| File | What it holds |
|---|---|
| `results/ctx00/intake.md` | The material, one `STM-nn` statement per line, `Total statements:` line first. Immutable once numbered. |
| `results/ctx00/sources/SRC-nn.md` | One plain-text copy per normative source; citations are checked against it. |
| `results/ctx00/problem-definition.md` | The readable document, for the person. |
| `results/ctx00/problem-baseline.json` | The frozen baseline, same information as JSON; only after approval (`baseline-schema.md`). |
| `results/ctx00/problem-baseline.sha256` | One `sha256sum -c` line for the JSON. |
| `results/ctx00/CONTEXT-ctx00.md` | Hand-off note (**CONTEXT template**); written whether approved or not. |

## Identifiers

Assigned in order, no gaps, no reuse, when the section is written. Two digits; three past 99.

| Section | Identifiers |
|---|---|
| 1 | `STM-nn` — a statement of the material (assigned in `results/ctx00/intake.md`) |
| 3 | `OBJ-nn` — an objective |
| 4 | `STK-nn` — a stakeholder · `ENV-nn` — an environment condition |
| 5 | `SCP-nn` — a scope item, side `in` or `out` · `EXT-nn` — an external entity |
| 6 | `SRC-nn` — a normative source (file `results/ctx00/sources/SRC-nn.md`) · `OBL-nn` — an obligation |
| 7 · 8 · 9 | `SOL-nn` — a solution suggestion · `OQ-nn` — an open question · `ASM-nn` — an assumption |
| 10 | `FB-n/OQ-nn` — the person's answer to `OQ-nn` in round `n` |

## Item lines

Each element of sections 2 to 9 is one line starting with `- ` and its
identifier (the problem has none). Fields after the text are separated by ` · `;
an empty field is omitted. `<mark>` is a **Provenance marks** letter, `<cites>`
follows **Citation grammar**.

```markdown
- OBJ-nn [<mark>] <text> <cites>
  - decision: <operational decision it enables>
  - measure: what: <…>; definition: <…>; unit: <…>; reference point: <…>; sense: higher is better | lower is better
- STK-nn [<mark>] <text> · type: <stakeholder type> · use: <only for type user> <cites>
- ENV-nn [<mark>] <text> · type: <environment type> <cites>
- SCP-nn [<mark>] <text> · side: in · traces to: OBJ-nn, … <cites>
- SCP-nn [<mark>] <text> · side: out · reason: <why excluded> <cites>
- EXT-nn [<mark>] <text> · direction: in | out | both <cites>
- SRC-nn [<mark>] <what it is> · issuer: <…> · identifier: <…> · version: <…> · snapshot: results/ctx00/sources/SRC-nn.md · sha256: <hex> · status: verified | unverified <cites>
- OBL-nn [<mark>] <text> · source: SRC-nn · status: verified | suggested · active: true | false <cites>
- SOL-nn [<mark>] <text> <cites>
- ASM-nn [<mark>] <text> · owner: <who> · closure criterion: <what closes it> <cites>
```

Section 1 lines: `- STM-nn · <category>` or `- STM-nn · discard: <reason>`.
**Obligation `active`.** `true` only if its source is `verified` and it applies
to the scope. A `suggested` one stays `active: false` until an `FB-n/OQ-nn`
answer confirms it and its source has a snapshot; then it cites that `FB` and
becomes `status: verified`, `active: true`.

## Final document layout

`results/ctx00/problem-definition.md` has these eleven sections, in this order:

1. **Input material** — each statement with its category, or discarded with its reason.
2. **Problem** — the problem in one sentence, cited.
3. **Objectives and success measures** — `OBJ` lines; no threshold.
4. **Stakeholders and environment** — `STK` and `ENV` lines.
5. **Boundary and scope** — `SCP` (each `in` traces to an objective, each `out` has a reason) and `EXT` lines.
6. **Normative sources and obligations** — `SRC` and `OBL` lines.
7. **Registered solution suggestions** — `SOL` lines, kept for a later stage.
8. **Open questions** — one block per question (see **Open-question block**).
9. **Assumptions** — `ASM` lines.
10. **Feedback log** — one entry per round, the two counters, and the verification verdicts.
11. **Decision** — the request while pending; after approval, the person's decision.

Section 11 form, pending then approved: `- Decision: <pending | APROBAR>`,
`- Approved by: <pending | name written by the person>`, `- Date: <pending | YYYY-MM-DD>`.

## Categories and types

Guides, not closed lists; an element that fits none keeps its own short label.
Section 1 categories: `problem`, `objectives`, `scope`, `constraints`,
`expected results`, `environment`, `assumptions`. Each statement is classified
or discarded, exactly once; discard reasons: `solution` (goes to section 7),
`duplicate`, `noise`, `out of stage`. A block with no substance may be one range
line: `STM-nn to STM-nn · discard: <reason>`. Stakeholder types: `user` (declares
its `use`), `affected`, `operator`, `maintainer`, `regulator`, `data provider`,
`payer`. Environment types: `physical`, `electromagnetic`, `network`,
`temporal`, `access`; a hardware fact is an environment fact, never a design limit.

## Provenance marks

`[D]` declared (in the material, cited literally) · `[R]` derived (computed from
cited material, choosing nothing) · `[P]` proposed (chosen by the agent because
nothing determined it; needs the person's approval). A value, unit or sense
absent from the cited quote is never `[D]`.

## Citation grammar

Four forms, nothing else: `"<text>" [cite: STM-nn]` (literal quote of a
statement); `[cite: STM-nn]` (anchor, no text); `"<text>" [cite: SRC-nn]`
(literal quote, checked in `results/ctx00/sources/SRC-nn.md`); `[cite: FB-n/OQ-nn]`
(the person's answer, checked in section 10).

**Matching rule.** A quote matches only if it appears in the cited text after
equalizing quote marks and dashes, stripping `*`, `_` and backticks, and
collapsing whitespace. Case counts; no synonyms, reordering or ellipsis; two
fragments are two quotes.

## Open-question block

Four fields plus a state; a question missing any field is not written:

```markdown
### OQ-nn: <question in one sentence>

- **Affected section:** <section the answer belongs in>
- **Origin:** <STM-nn cited, or "absence: no statements about X">
- **Impact:** <what the next stage cannot produce without it>
- **Type:** information | precision | normative | contradiction
- **State:** open | closed (answered) | closed (forced)
```

Criteria for raising a question: `dp-gap-search`.

## CONTEXT template

```markdown
# CONTEXT-ctx00
- Stage: Ctx00 · Status: frozen | not_approved · Reason: <only when not_approved>
- Approved by / at: <name> · <date>   (omit when not_approved)
## Files (path · sha256)
- Document · Baseline (frozen only) · Intake · one line per SRC
## Hash checks (command · output)
## Closed by forced closure (OQ-nn · FB-n/OQ-nn · affected section)
## Open assumptions (ASM-nn · owner · closure criterion)
## Reading order for Ctx 01
1. this file  2. results/ctx00/problem-baseline.json  3. results/ctx00/intake.md and results/ctx00/sources/
```

## Do not

- Do not skip, reuse or renumber an identifier, nor write an element without identifier and mark.

# templates.md — empty forms for Ctx 02

Empty templates only. No worked example and no case value appears here; a filled
example would anchor the wording. Fields in `<...>` are placeholders. The gate
table is the authoritative wording and reads identically in `ra-gate-check`.

## Gate evidence table (identical wording in `ra-gate-check`)

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

Each row: verdict (`PASS`, `FAIL`, `NOT_EVALUABLE`), ids, one computed line or citation.

## V1 document — `results/ctx02/validations/V1/R<n>/hardware-proposal.md`

```markdown
# V1 — Hardware proposal — presentation R<n>
_The agent proposes; the person decides. A gate PASS means no defect was found._
## 1. Open questions (all states; those with gate V1 block approval)
- <Q-02-nn> [kind, category, gate] <text> — state <open|answered|closed-forced> [forced <true|by-limit>: HIGHLIGHT value and criterion step]
## 2. Hardware options (1 to 3)
- Option <n>: SDR <reference, SRC-02-nn> + board <reference, SRC-02-nn> + RF-path variant <name>
- Single-option dominance statement and discarded alternatives (if one option): <text>
- Criteria file: <path> sha256 <hash> (eliminatory first, then ordinal with three levels)
- Eliminatory matrix: <criterion x option: pass|fail|unverified, both values in one unit, cita>
- Ordinal comparison: <criterion x option: level 1-3, reason cited> (no weights, no sums)
- Robustness: <one line per decision>
- Agent recommendation (propuesto, optional): <option>
## 3. Flow and RF path
- Functional flow and minimal base architecture: <summary, DEC ids>
- RF elements: <element: needed|not-needed, reason, DEC id>; characteristic cards: <CMP ids>
## 4. What the agent decided
- Proposed (not declared) items and figures: <ids> ; forced closures: <ids> ; beyond-MVP: <list>
## 5. Gate result (V1)
<rows G02-1 to G02-6 from the table above; warnings listed apart>
## 6. Pending decision
Computed verdict: <PASS | FAIL on ids>. Fill `response-form.md`: APROBAR, AJUSTAR or DETENER.
Presentation R<n> accepts: <answers, themes and decision | only APROBAR or DETENER>.
```

## V2 document — `results/ctx02/validations/V2/R<n>/final-design.md`

```markdown
# V2 — Final design — presentation R<n>
## 1. Open questions (all states; those with gate V2 block approval)
- <same line form as V1 section 1>; changes touching approved hardware: <escalate:V1 rows>
## 2. Design
- Decisions: <DEC id, class, chosen, alternatives or dominance, criteria file hash, robustness>
- Components: <CMP id, realization, reqs, range or TBD-Ctx03>
- Dependencies and plan: <DEP ids>; implementation order = `tsort` output: <CMP ids>
- Ctx 02 deferrals of Ctx 01: <DFR id -> closing DEC id>; travelling intact: <DFR ids>
- Ctx 03 boundary: <what Ctx 03 specifies for each class>
## 3. Coverage
- <REQ or LIM id: disposition, DEC/CMP ids>; each CMP -> <REQ ids>; blind-review disagreements: <list>
## 4. What the agent decided
- Proposed items and figures: <ids> ; forced closures: <ids> ; beyond-MVP: <list>
## 5. Gate result (V2)
<rows G02-1 to G02-8 from the table above; warnings listed apart>
## 6. Pending decision
Computed verdict and the accepted inputs of this presentation, as in V1.
```

## Response form — `results/ctx02/validations/V<k>/R<n>/feedback.md`

```markdown
# Feedback — V<k> presentation R<n>
Decision: <APROBAR | AJUSTAR | DETENER>
## Answers
- <Q-02-nn>: <answer text | CERRAR_FORZADO: <Q-02-nn>>
## Themes
- <T-nn>: <the theme in the person's words>
```

## CONTEXT-ctx02.md

```markdown
# Ctx 02 context — read this first, then the baseline
- Status: <approved | stopped | returned_upstream (R0|R1)>; reason: <text>
- Baseline: <path> sha256 <hash>; final document: <path> sha256 <hash>
- Inputs admitted: <Ctx 01 baseline hash>, <Ctx 00 document hash>
- Forced closures: <Q-02-nn: forced true|by-limit, value, criterion step>
- Travels open to Ctx 03: <DFR ids; CMP ids with TBD-Ctx03; defer:Ctx03 themes>
- How to read: results/ctx02/items.json holds DEC, CMP, DEP; `jq '.items[]|select(.type=="CMP")'`;
  plan = `plan` key; sources in results/ctx02/sources/SRC-02-nn.md
- Where to look: <substage files, validations folders, results/ctx02/events.jsonl>
```

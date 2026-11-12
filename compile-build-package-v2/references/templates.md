# templates.md — empty forms for Ctx 03

Empty templates only. No worked example and no case value appears here; a filled
example would anchor the wording. Fields in `<...>` are placeholders. The gate
table is the authoritative wording and reads identically in `cb-gate-check`.

## Gate evidence table (identical wording in `cb-gate-check`)

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
| G03-11 | Consumer test: a blind implementer reading only the package lists no question that needs a design decision | Judgement by subagent | no | yes |

Each row: verdict (`PASS`, `FAIL`, `NOT_EVALUABLE`), ids, one computed line or citation.

## V1 document — `results/ctx03/validations/V1/R<n>/hardware-proposal.md`

```markdown
# V1 — Hardware references — presentation R<n>
_The agent proposes; the person decides. A gate PASS means no defect was found._
## 1. Open questions (all states; those with gate V1 block approval)
- <Q-03-nn> [kind, category, gate] <text> — state <open|answered|closed-forced> [provisional: <value>] [forced <true|by-limit>: HIGHLIGHT value and criterion step]
## 2. Hardware by component (one block per component; at most two options)
- Component <CMP id, function>: Option A <reference, SRC-03-nn> · Option B <reference, SRC-03-nn> (or: single option, dominance statement and discarded alternatives)
- Criteria file: <path> sha256 <hash> (eliminatory first, then ordinal with three levels)
- Eliminatory matrix: <criterion x option: pass|fail|unverified, both values in one unit, cita>
- Ordinal comparison: <criterion x option: level 1-3, reason cited> (no weights, no sums)
- Robustness: <one line> · Agent recommendation (propuesto, optional): <option>
- Fixed by Ctx 02: <SDR and board references with the characteristics used>
## 3. Integration and provisional budgets
- Compatibility between neighbours: <connector, impedance or bus, level, power, per pair>
- Provisional resource budget: <RB rows: resource, demand, capacity, margin, verdict>; planning margins used: <list, propuesto>
- Ctx 02 open points closed here: <OP id: how closed> ; still open: <OP ids and why>
## 4. What will be specified (input analysis)
- Register: <count of SPEC by kind>; order: <SPEC ids>; each SPEC with the ids it closes
- Items with no specification needed: <id: disposition code and reason>
## 5. What the agent decided
- Proposed (not declared) items and figures: <ids> ; forced closures: <ids> ; beyond-MVP: <list>
## 6. Gate result (V1)
<rows G03-1 to G03-5, G03-7, G03-9, G03-10 from the table above; warnings listed apart>
## 7. Pending decision
Computed verdict: <PASS | FAIL on ids>. Fill `feedback.md`: APROBAR, AJUSTAR or DETENER.
Presentation R<n> accepts: <answers, themes and decision | only APROBAR or DETENER>.
```

## V2 document — `results/ctx03/validations/V2/R<n>/final-spec.md`

```markdown
# V2 — Final specification — presentation R<n>
## 1. Open questions (all states; those with gate V2 block approval)
- <same line form as V1 section 1>; changes touching approved hardware: <escalate:V1 rows>
## 2. Specification
- Per SPEC in order: <SPEC id, kind, ids closed, file path, critical PAR ids with value and unit, PRC/SCH/ERR ids>
- Hardware as approved at V1: <HW ids, locked hash>
## 3. Resource closure
- Final budget: <RB rows with verdict>; Ctx 02 open points: <OP id -> closure>
- Closure of Ctx 02 TBD ranges: <CMP id -> closing PAR or HW id>
- Closure of Ctx 01 deferrals: <DFR id -> PAR id, value inside window>; travelling intact: <DFR ids>
## 4. Tests
- <AC id -> TST id: threshold, unit, operator side by side>; qualification and procedure tests: <TST ids>
## 5. Coverage and independent review
- <REQ/LIM/AC id: disposition, SPEC ids>; each spec element -> <REQ ids>
- Blind-review disagreements: <list> ; consumer-test questions and their resolution: <list>
## 6. What the agent decided
- Critical parameters proposed: <PAR id, value, unit, rationale line> ; provisional values resolved: <Q ids>
- Forced closures: <ids> ; beyond-MVP: <list> ; routine proposed parameters: <path to the list in items.json>
## 7. Gate result (V2)
<rows G03-1 to G03-11 from the table above; warnings listed apart>
## 8. Pending decision
Computed verdict and the accepted inputs of this presentation, as in V1.
```

## Response form — `results/ctx03/validations/V<k>/R<n>/feedback.md`

```markdown
# Feedback — V<k> presentation R<n>
Decision: <APROBAR | AJUSTAR | DETENER>
## Answers
- <Q-03-nn>: <answer text | CERRAR_FORZADO: <Q-03-nn>>
## Themes
- <T-nn>: <the theme in the person's words>
```

## CONTEXT-ctx03.md

```markdown
# Ctx 03 context — read this first, then the baseline
- Status: <approved | stopped | returned_upstream (R0|R1|R2)>; reason: <text>
- Baseline: <path> sha256 <hash>; final document: <path> sha256 <hash>
- Inputs admitted: <Ctx 02 baseline hash>, <Ctx 01 baseline hash>, <Ctx 00 document hash>
- Forced closures: <Q-03-nn: forced true|by-limit, value, criterion step>
- Travels open to the build stage: <DFR ids of implementation; OP ids still open; defer:build themes>
- How to read: results/ctx03/items.json holds HW, PAR, PRC, SCH, ERR, TST, DEC;
  `jq '.items[]|select(.type=="PAR")'`; modules in results/ctx03/specs/SPEC-nn.md in `order`
  of results/ctx03/spec-register.json; sources in results/ctx03/sources/SRC-03-nn.md
- Where to look: <substage files, validations folders, results/ctx03/events.jsonl, results/ctx03/STATUS.md>
```

## STATUS.md

```markdown
# Ctx 03 status — <ts>
- Status <status> · phase <A|B> · validation <V1|V2> presentation R<n>
- Feedbacks used: V1 <n>/3 · V2 <n>/3 · question runs used: V1 <n>/2 · V2 <n>/2
- Specs: <done>/<total> · current: <SPEC id or none>
| SPEC | Title | Kind | Status |
- Blocked by: <ids or none>
- Last events: <ten lines: ts, event, key detail>
- Next action: <the same line as state.json>
```

# templates.md — empty forms for Ctx 01

Empty templates only. No worked example and no case value appears here; a filled
example would anchor the wording. Fields in `<...>` are placeholders. The gate
rows are the authoritative wording and must read identically in `sr-gate-check`.

## DEE — Stage Delivery Document (one per output O<n>)

```markdown
# Stage Delivery Document — DEE 01 (Gate 1) — Output O<n>

_The agent computes and exposes; the person decides. A clean gate means no
detectable defect was found, nothing more._

## 1. Summary
- REQ by subtype: funcional=<n>, no-funcional=<n>, restriction=<n>
- LIM: <n>   AC: <n>   DFR: <n>
- DFR by responsible stage: <stage>=<n>, ...
- Gates: G01-1=<pass|FAIL> G01-2=<..> G01-3=<..> G01-4=<..> G01-5=<..> NZC-1=<..> NZC-2=<..>

## 2. Content
- <REQ-id> (subtype, marks)[<op value unit>]: <text> (<procedencia>)
- <LIM-id>: <magnitud> <op> <value> <unit>, sense=<techo|piso> (<procedencia> <- <cita_ref>)
- <AC-id> for <REQ-id>: <metrica> <op> <umbral> <unit>, method=<metodo>, when: <condicion>
- <DFR-id>: governs <REQ-id>, stage <etapa>, bracket <horquilla>, material=<bool>, closure: <criterio>

## 3. What the agent decided
- Proposed thresholds without a declared anchor: <AC/REQ ids>, or none
- Whole proposed items: <ids>, or none
- Transfer discards: <STM-id[code]>, or none
- Downgrades: <item.field from->to>, or none
- Omission candidates rejected: <ids with code>, or none
_No prose justification. The decision is judged on the result._

## 4. What remains open
- <DFR-id>: governs <REQ-id> | stage <etapa> | closure <criterio> | bracket <horquilla> | material=<bool>
- Converted assumptions: <id, owner, closure>
- Not acceptable until closure (computed): <ids>, or none

## 5. Gate result
<the seven rows of "Gate evidence table" below, each with verdict and evidence>
Coverage by upstream item (sufficiency is NOT judged by the gate):
- <upstream-id>: <REQ ids | excluded <code> | UNCOVERED> [<- single requirement, if one]
Warnings (non-blocking): <vagueness, uncited-limit, single-requirement>, or none

## 6. Pending decision (human judgement, not a gate)
1. Is each requirement necessary and correct?
2. Is coverage sufficient? (see the per-upstream table in section 5)
3. Is each deferral immaterial? (brackets in section 4)
4. Can Ctx 02 compare alternatives without inventing?
Computed verdict: <SEGUIR | APROBAR_CON_APLAZAMIENTO | AJUSTAR>.
ACTION REQUIRED: a person signs -> APROBAR or AJUSTAR. The agent does not sign.
```

## Gate evidence table (identical wording in `sr-gate-check`)

| Gate | Check |
|---|---|
| G01-1 | Input integrity: upstream `status: frozen`; `sha256sum -c` of the baseline passes; `document.sha256` equals the hash of the `.md`; every `open_questions` entry is closed; every verified SRC has a snapshot; record hash link; every catalog guardrail present with `sembrado` and its `modality_marker` intact. |
| G01-2 | Bounding: every quantitative REQ and every LIM carries value + unit + operator and dimensional coherence; a LIM is never `propuesto`. |
| G01-3 | Feasibility: no numeric REQ or AC exceeds the LIM it cites, compared like-for-like after unit coherence. |
| G01-4 | Acceptance: every mandatory REQ has an AC with the five elements (or four + bracket + DFR), method in the closed set, and the AC measures the requirement. |
| G01-5 | Coverage: K1 (each OBJ), K2 (each in-scope SCP), K3 (each active obligation) disposed 100% by a requirement link or an approved exclusion with a code. |
| NZC-1 | Transfer disposition: every transferred statement (category `constraints` or `expected results`, not discarded) is adopted by a REQ naming it in `deriva_de`, or discarded with a code. |
| NZC-2 | Deferral form: every DFR has its four fields, a declared materiality, and a dimensioned bracket or the explicit `sin cota`. |

## Response form (one per feedback round)

```markdown
# Feedback response — round <n> (output O<n>)
Decision: <APROBAR | AJUSTAR | DETENER>

## Answers to open questions
- <Q-id>: <content answer, or "forced closure">   [cite line: <source>]

## Improvement themes
- <T-id>: <the theme, in the person's words>   [cite line: <source>]
```

## CONTEXT-ctx01.md (hand-off to Ctx 02)

```markdown
# Ctx 01 context — frozen Requirements Baseline
- Gate-1 decision: <SEGUIR | APROBAR_CON_APLAZAMIENTO> signed by <name>
- Frozen hash: <hash>
## Files (path · sha256)
- pipeline-layout/guardrails.md · <sha256>
- results/ctx01/requirements-baseline.json · <hash>
- results/ctx01/requirements-baseline.sha256
## Requirements
- <REQ-id> (subtype, marks): <text> [<op value unit>] (<procedencia>)
## Limits
- <LIM-id>: <magnitud> <op> <value> <unit>, sense=<techo|piso>
## Acceptance criteria
- <AC-id> for <REQ-id>: <metrica> <op> <umbral> <unit>, method=<metodo>, when: <condicion>
## Open deferrals
- <DFR-id>: governs <REQ-id>, stage <etapa>, bracket <horquilla>, material=<bool>
- Not acceptable until closure: <ids>
## Discards and downgrades
- <STM-id[code]>; <item.field from->to>
```

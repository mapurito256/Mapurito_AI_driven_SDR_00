---
name: sr-gate-check
description: Runs the seven gates of Ctx 01 as an evidence table — the mechanical part with shell commands, the judgement part with a cited verdict per gate — and computes the gate-1 verdict without deciding it; loaded by specify-requirements at 01.7, not invoked directly.
---

# sr-gate-check

## Purpose

Evaluate the seven gates and compute the verdict. The gate **computes and
exposes; it does not decide.** A clean gate means no detectable defect was found,
nothing more. Each gate verdict cites the item ids and the evidence behind it.

## Inputs

- `results/ctx00/problem-baseline.json` and `results/ctx01/record.json`.
- `references/item-schema.md` (fields, closed codes) and `references/templates.md`
  (the gate wording, which this skill reproduces identically).

## The seven gates (wording identical to templates.md)

| Gate | Check |
|---|---|
| G01-1 | Input integrity: upstream `status: frozen`; `sha256sum -c` of the baseline passes; `document.sha256` equals the hash of the `.md`; every `open_questions` entry is closed; every verified SRC has a snapshot; record hash link; every catalog guardrail present with `sembrado` and its `modality_marker` intact. |
| G01-2 | Bounding: every quantitative REQ and every LIM carries value + unit + operator and dimensional coherence; a LIM is never `propuesto`. |
| G01-3 | Feasibility: no numeric REQ or AC exceeds the LIM it cites, compared like-for-like after unit coherence. |
| G01-4 | Acceptance: every mandatory REQ has an AC with the five elements (or four + bracket + DFR), method in the closed set, and the AC measures the requirement. |
| G01-5 | Coverage: K1 (each OBJ), K2 (each in-scope SCP), K3 (each active obligation) disposed 100% by a requirement link or an approved exclusion with a code. |
| NZC-1 | Transfer disposition: every transferred statement (category `constraints` or `expected results`, not discarded) is adopted by a REQ naming it in `deriva_de`, or discarded with a code. |
| NZC-2 | Deferral form: every DFR has its four fields, a declared materiality, and a dimensioned bracket or the explicit `sin cota`. |

## Mechanical evidence (shell; no script)

```
# G01-2: quantitative REQ missing unit/operator; a propuesto LIM
jq -r '.items[] | select(.type=="REQ" and .valor!=null) | select(.unidad==null or .operador==null) | .id' results/ctx01/record.json
jq -r '.items[] | select(.type=="LIM" and .procedencia=="propuesto") | .id' results/ctx01/record.json
# G01-4: AC with a method outside the closed set; mandatory REQ with no AC
jq -r '.items[] | select(.type=="AC") | select(.metodo|IN("test","analysis","inspection","demonstration")|not) | .id' results/ctx01/record.json
# NZC-2: DFR missing a required field
jq -r '.items[] | select(.type=="DFR") | select(.requisito_gobernante==null or .criterio_cierre==null or (has("materialidad_declarada")|not)) | .id' results/ctx01/record.json
# literal citation: the cita must be a substring of its source in results/ctx00/intake.md, results/ctx00/sources/ or pipeline-layout/guardrails.md
#   for each declarado/derivado item, grep -F "<cita>" against results/ctx00/intake.md, results/ctx00/sources/SRC-nn.md or pipeline-layout/guardrails.md
# NZC-1: transferred statements neither adopted in a deriva_de nor discarded (must print nothing)
comm -23 <(jq -r '.statements[]|select(.category=="constraints" or .category=="expected results")|.id' results/ctx00/problem-baseline.json | sort -u) <(jq -r '([.items[]|select(.type=="REQ")|.deriva_de[]?]+[.discards[]?.stm])|.[]' results/ctx01/record.json | sort -u)
```

Run the coverage and admission commands of `sr-coverage-contrast` and the
orchestrator for the G01-5 and G01-1 cells.

## Judgement evidence (cited verdict, not mechanical)

- G01-1/G01-2: is the figure actually in the cited quote (the rewrite rule), and
  is the unit dimensionally coherent for the magnitude?
- G01-3: does the value stay within the limit once units are reconciled?
- G01-4: does the AC measure the requirement, or a neighbouring quantity?
Each verdict names the item id and quotes the evidence; vagueness, uncited-limit
and single-requirement are **warnings**, listed, never blocking.

## Output format

Fill the gate rows of the DEE (section 5) with `pass`/`FAIL`, the cited evidence,
and the warnings separated from verdicts. Compute the verdict: `AJUSTAR` if any
gate FAILs; otherwise `SEGUIR`. Separately expose every open DFR with responsible
stage, bracket, materiality, closure criterion and the not-acceptable-until-closure
set. Neither `SEGUIR` nor the DFR list is a human approval. Open OQ block freeze.
Emit `gate_evaluated` with the per-gate verdict.

## Do not

- Do not decide approval; present the verdict and the four human questions.
- Do not block on a warning, and do not turn the vagueness lexicon into a gate.
- Do not pass a gate by relaxing its wording.
- Do not load any fixture or example dataset.

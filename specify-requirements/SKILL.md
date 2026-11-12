---
name: specify-requirements
description: Ctx 01 — turn a frozen Ctx 00 problem baseline into a Versioned Requirements Baseline: functional, non-functional and restriction requirements, limits of the SDR/platform/RF environment, measurable acceptance criteria and controlled deferrals, each with marked provenance and backward coverage. Ends at gate 1, which a person signs. This is the only entry point; it loads the sr-* skills in order.
---

# specify-requirements — Ctx 01 (requirements and constraints)

Ctx 01 adopts what Ctx 00 classified as a requirement, completes what the frozen
scope demands, bounds what arrives without a bound, and defers with a rule what
cannot be closed yet — producing requirements and acceptance criteria, never
design decisions. The agent drafts and judges
by following the sr-* skills, mechanical facts are checked with shell commands,
and a person signs gate 1.

This skill orchestrates. It holds the flow order, the rounds, the invariants and
where state lives. It does not hold the detail of any sub-stage; each skill does.

## Invariants (do not negotiate)

- Requirements and acceptance criteria only. No algorithm, architecture or
  component contract (that is Ctx 02). Say *what*, never *how*.
- Material transferred from Ctx 00 is not re-elicited.
- A value, unit or operator not in the literal `cita` is never `declarado`.
- Every transferred statement ends adopted by a requirement or discarded with a
  code; none is dropped in silence.
- Seeded requirements enter with their `sembrado` flag and are never deleted.
- Every objective and every in-scope element has at least one requirement
  deriving from it, or an approved exclusion with a code.
- No model approves its own output. Freeze requires a human sign-off.
- Every artifact is in English.

## Working files

Defined in `references/records.md`. State lives in `results/ctx01/state.json` and
`results/ctx01/events.jsonl`; items in `results/ctx01/record.json`; the input is
read-only in `results/ctx00/` (`problem-baseline.json`, `problem-baseline.sha256`,
`problem-definition.md`, `intake.md`, `sources/`); per-round outputs under
`results/ctx01/rounds/O<n>/`; the frozen result and the hand-off in
`results/ctx01/requirements-baseline.json`, `results/ctx01/requirements-baseline.sha256`,
`results/ctx01/requirements-baseline.md` (reading copy) and `results/ctx01/CONTEXT-ctx01.md`. Formats shared across skills live
in `references/item-schema.md` (fields and closed codes) and
`references/templates.md` (empty forms). No skill reads `evals/`.
Paths follow the root skill `pipeline-layout`.

## The skills (load one at a time, from `skills/<name>/SKILL.md`)

| Skill | Role |
|---|---|
| `sr-gap-questions` | 01.1 and 01.6: real gaps, anti-bias tests, open questions |
| `sr-draft-items` | 01.2–01.5: draft REQ/LIM/AC/DFR with provenance |
| `sr-coverage-contrast` | 01.6: backward coverage and the independent blind review |
| `sr-gate-check` | 01.7: the seven gates as an evidence table |
| `sr-dee-report` | the DEE and the response form |
| `sr-feedback-cycle` | read the feedback, run the rounds, force closure |
| `sr-improvement-plan` | build the improvement plan from a round's feedback |

## Base flow (output O1)

1. **Admit (01.1).** Read `results/ctx00/CONTEXT-ctx00.md` first, then the baseline JSON, `results/ctx00/intake.md` and `results/ctx00/sources/` (its reading order). Run the mechanical checks below. If any fails, do not start:
   a version mismatch re-runs against the current baseline; a content problem is
   an R0 return to Ctx 00. Emit `admission_checked`. Then load `sr-gap-questions`
   over the input to produce the first question candidates.
2. **Draft (01.2–01.5).** Load `sr-draft-items`: disposition of transferred
   material, then limits, then requirements, then acceptance criteria and any
   `DFR`. Order is a dependency: limits before requirements, requirements before
   criteria. A `DFR` is proposed here, never born at close.
3. **Contrast (01.6).** Load `sr-coverage-contrast` (coverage + independent
   review), then `sr-gap-questions` again to attend new candidates.
4. **Gate (01.7).** Load `sr-gate-check`; it writes the gate verdict. Then load
   `sr-dee-report` to write `results/ctx01/rounds/O1/dee.md` and the response form.
5. Present the DEE. A person decides.

### Admission — mechanical checks (shell, no script)

```
# all commands run from the root; read results/ctx00/CONTEXT-ctx00.md first, then:
# frozen, and the JSON still matches its stored hash
jq -r '.status' results/ctx00/problem-baseline.json
sha256sum -c results/ctx00/problem-baseline.sha256
# the readable document is the one the baseline was frozen from
jq -r '.document.sha256' results/ctx00/problem-baseline.json
sha256sum results/ctx00/problem-definition.md
# record is built against this baseline (the JSON's hash from the .sha256 file)
jq -r '.upstream_baseline_hash' results/ctx01/record.json
cut -d' ' -f1 results/ctx00/problem-baseline.sha256
# guardrail catalog is the one the record was built against
sha256sum pipeline-layout/guardrails.md      # equals the next line
jq -r '.guardrails_sha256' results/ctx01/record.json
# every catalog guardrail is a seeded item, and only those
diff <(grep -oE '^\| *GRD-[0-9]+' pipeline-layout/guardrails.md | tr -d '| ' | sort) <(jq -r '.items[]|select(.sembrado==true)|.guardrail_id' results/ctx01/record.json | sort)   # empty
# every open question closed; every verified source has a snapshot
jq -r '.open_questions[] | select(.state|startswith("closed")|not) | .id' results/ctx00/problem-baseline.json
jq -r '.sources[] | select(.status=="verified" and (.snapshot_file==null or .snapshot_file=="")) | .id' results/ctx00/problem-baseline.json
```
Each seeded item's `text` must contain its catalog `modality_marker` (judgement, cited in G01-1 evidence).
A judgement about the baseline (is the frozen content actually complete?) is not
mechanical and is not Ctx 01's to make; a content defect returns to Ctx 00.

## Rounds and the question cap

| Output | New questions | Then receives |
|---|---|---|
| O1 (first draft) | Allowed — new-question run 1 | Feedback F1 |
| O2 (after F1) | Allowed — new-question run 2 | Feedback F2 |
| O3 (after F2) | No — every open question is force-closed | F3 (improvement or approval only) |
| O4, O5, O6 (after F3, F4, F5) | No — improvement themes only | up to three improvement feedbacks |

- At most six outputs. After O6 the only decision is `APROBAR` (with the forced
  assumptions visible) or `DETENER`.
- At most 8 new questions per run; the rest go to `not_asked`.
- `sr-feedback-cycle` owns this table and must not diverge from it.

## Close and gate 1 (01.7)

The gate re-runs complete every round, not only the impact set. On a clean gate
and a human `APROBAR`, freeze: write `results/ctx01/requirements-baseline.json` with
`status: frozen`, the decision and the signer, store its hash with
`sha256sum results/ctx01/requirements-baseline.json > results/ctx01/requirements-baseline.sha256`,
write `results/ctx01/requirements-baseline.md` as defined in `references/records.md`,
and write `results/ctx01/CONTEXT-ctx01.md`. Emit `baseline_frozen`. If any `DFR` is open, the only
approval is `APROBAR_CON_APLAZAMIENTO`, carrying the deferral list. Without a
sign-off, do not freeze.

## Stop rules

1. Do not advance while a gate is FAIL; correct and re-run that gate.
2. Never relax a rule to make a gate pass, and never delete a seeded requirement.
3. Run the independent review and gate in a fresh subagent context when the
   environment offers it; otherwise in line, recorded as less reliable.

## Assumptions carried from PLAN §9

V2-01 forced closure at O3 · V2-03 cap 8 questions/run · V2-04 resolved: the input
contract is `results/ctx00/problem-baseline.json` with its `results/ctx00/problem-baseline.sha256`,
and seeded requirements come from `pipeline-layout/guardrails.md`, not from Ctx 00 · V2-05
tokens external; event records `tokens: not-measured` if unavailable · V2-06
subagent fallback is inline · V2-07 DEE size limit open · V2-08 a value with no
bound is not frozen as a figure.

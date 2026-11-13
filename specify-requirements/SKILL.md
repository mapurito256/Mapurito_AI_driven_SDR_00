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
   an R0 return to Ctx 00. For a new run, initialize records only after upstream-only
   checks pass, as specified below. Emit `admission_checked` once at that
   initialization checkpoint; do not duplicate it on resume. Then load `sr-gap-questions`
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

Separate admission into these checkpoints; do not query a new record before it
exists:

1. **Upstream only:** read the handoff first; require ctx00 state `approved`,
   handoff/baseline `frozen`, recorded human `APROBAR` with signer, closed questions,
   verified source snapshots and matching baseline/document/intake hashes.
   Older runs lacking modern logs/state require the explicit read-only
   compatibility review in `.agents/mapurito/contracts/handoff.md`; absence is
   not automatically interpreted as a valid older run.
2. **New run:** only when `results/ctx01/` has no existing work, initialize
   `record.json` and `state.json` per `references/records.md`; capture upstream and
   guardrail hashes. Initialize an empty event log and emit `admission_checked`
   after those checks pass. Do not create seeded REQs during 01.1.
3. **Resume:** preserve all files and counters; verify stored hash links. A partial
   initialization requires reconciliation with existing evidence, not reset.
4. **After drafting 01.2:** `sr-draft-items` creates the seeded REQs. Check catalog
   completeness and modality markers then, and again in G01-1 at every gate.
   Missing seeds at 01.1 are not yet a failure; missing seeds after 01.2 are.

The commands below are grouped by their prerequisites:

```
# all commands run from the root; read results/ctx00/CONTEXT-ctx00.md first, then:
# frozen, and the JSON still matches its stored hash
jq -e '.status=="frozen" and .approved.decision=="APROBAR" and (.approved.by|type=="string" and length>0)' results/ctx00/problem-baseline.json
jq -r '.status' results/ctx00/problem-baseline.json
sha256sum -c results/ctx00/problem-baseline.sha256
# the readable document is the one the baseline was frozen from
jq -r '.document.sha256' results/ctx00/problem-baseline.json
sha256sum results/ctx00/problem-definition.md
# after new-record initialization, or on resume: record hash links
jq -r '.upstream_baseline_hash' results/ctx01/record.json
cut -d' ' -f1 results/ctx00/problem-baseline.sha256
# guardrail catalog is the one the record was built against
sha256sum pipeline-layout/guardrails.md      # equals the next line
jq -r '.guardrails_sha256' results/ctx01/record.json
# after 01.2, then at every G01-1: every guardrail is seeded, and only those
diff <(grep -oE '^\| *GRD-[0-9]+' pipeline-layout/guardrails.md | tr -d '| ' | sort) <(jq -r '.items[]|select(.sembrado==true)|.guardrail_id' results/ctx01/record.json | sort)   # empty
# every open question closed; every verified source has a snapshot
jq -r '.open_questions[] | select(.state|startswith("closed")|not) | .id' results/ctx00/problem-baseline.json
jq -r '.sources[] | select(.status=="verified" and (.snapshot_file==null or .snapshot_file=="")) | .id' results/ctx00/problem-baseline.json
```
The non-empty-output checks must be interpreted as checks, not merely run: hashes
and links must equal, closed-question and missing-snapshot lists must be empty,
and catalog comparison must be empty after 01.2. Each seeded item's `text` must
contain its catalog `modality_marker` (judgement, cited in G01-1 evidence).
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

The gate re-runs complete every round, not only the impact set. Require zero open
OQ, every gate passing, and explicit human `APROBAR` with signer before freeze.
Write `results/ctx01/requirements-baseline.json` with
`status: frozen`, the decision and the signer, store its hash with
`sha256sum results/ctx01/requirements-baseline.json > results/ctx01/requirements-baseline.sha256`,
write `results/ctx01/requirements-baseline.md` as defined in `references/records.md`,
and write `results/ctx01/CONTEXT-ctx01.md`. Verify the hash, then emit
`baseline_frozen` with signer, decision and frozen hash. Open `DFR` items are
controlled technical obligations, not open questions: present their list,
responsible stage, closure criteria and `not_acceptable_until_closure` explicitly
to the signer and carry them intact. The human decision remains `APROBAR`.
Without sign-off or with a failed check, do not freeze. Interrupted closure is
incomplete; reconcile evidence before downstream admission.

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

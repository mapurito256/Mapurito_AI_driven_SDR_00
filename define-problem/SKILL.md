---
name: define-problem
description: Ctx 00 — turn a heterogeneous intake (an idea, a proposal, objectives, a requirements document) into an approved problem-definition document and a frozen JSON baseline, before any requirement or architecture exists. Use when starting the build-package process on a new problem. This is the only entry point; it loads the dp-* skills in order.
---

# define-problem — Ctx 00 (define the problem)

Ctx 00 turns a heterogeneous intake into an approved, readable problem
definition: the agreed, stable problem, before any requirement or architecture.
The agent writes the document and checks it by following the skills below;
mechanical checks use `sha256sum`, `grep` and `jq`. The stage closes with two
products that carry the same information in two formats:
`results/ctx00/problem-definition.md` (for the person) and
`results/ctx00/problem-baseline.json` (the frozen baseline, the input of Ctx 01),
written only after the person's explicit approval.

This skill orchestrates. It holds the flow order, where state lives, and the
stop rules, and it loads one sub-stage or cross-cutting skill at a time. It does
not hold the detail of any sub-stage; each skill does.

## Four general rules

1. **The person decides.** Purpose, scope, functionality and priorities are the person's decisions, never the agent's. The agent extracts, states, measures and asks; it does not choose what the project is for.
2. **Human validation only at the end.** There is no human review between sub-stages. Open questions found in steps 1 to 5 accumulate without stopping the flow and are presented together in the final document.
3. **The agent never approves.** Only the person decides `APROBAR`. Nothing is frozen, and `dp-freeze-handoff` is not loaded, without it.
4. **Never invent.** Where the material does not reach, raise an open question; never fill a gap from the agent's own knowledge. A value, unit or sense absent from a cited quote is never marked declared.

## Working files

The stage reads and writes only these, defined under **Working files** in
`references/record-schema.md`: `results/ctx00/intake.md` (the numbered, immutable
statements), `results/ctx00/sources/SRC-nn.md` (one copy per normative source),
`results/ctx00/problem-definition.md` (the document), and, after approval,
`results/ctx00/problem-baseline.json`, `results/ctx00/problem-baseline.sha256` and
`results/ctx00/CONTEXT-ctx00.md`.
Paths follow the root skill `pipeline-layout`.

## The skills

Load each from its folder under `skills/` (`skills/<name>/SKILL.md`); each
folder name equals its skill `name`. The sub-stage and cross-cutting skills are
not entry points — only this
orchestrator loads them.

| Skill | Role |
|---|---|
| `dp-order-material` | Sub-stage 1: flatten, number and classify the material. |
| `dp-problem-objectives` | Sub-stage 2: problem, objectives and success measures. |
| `dp-stakeholders-environment` | Sub-stage 3: stakeholders and environment. |
| `dp-boundary-scope` | Sub-stage 4: boundary and scope. |
| `dp-normative-sources` | Sub-stage 5: normative sources and obligations. |
| `dp-close-feedback` | Sub-stage 6: consolidate, check structure, lead the feedback. |
| `dp-freeze-handoff` | Sub-stage 7: after `APROBAR`, freeze the JSON, check equivalence, write the hand-off note. |
| `dp-gap-search` | Cross-cutting: the criteria and the re-runnable gap pass. |
| `dp-verify-citations` | Cross-cutting: literal citation verification. |
| `dp-verify-consistency` | Cross-cutting: classification, magnitude and contradiction audit. |

Formats shared across skills live in `references/record-schema.md`; the JSON shape lives in `references/baseline-schema.md`.

## Base flow

Run the seven steps in order. Each step writes its section, then runs the
verifications named. In steps 1 to 5 verification covers only what was just
written; only step 6 and each feedback round verify the whole document, so the
cost does not multiply.

| Step | Skill that writes | Verification | Exit condition |
|---|---|---|---|
| 1 | `dp-order-material` | `dp-verify-consistency` part A, on section 1 | Count equals N; section 1 without duplicates |
| 2 | `dp-problem-objectives` | `dp-verify-citations` on sections 2 and 3; `dp-gap-search` section mode | Problem, at least one objective with a measure, no solution or threshold |
| 3 | `dp-stakeholders-environment` | `dp-gap-search` section mode | At least one stakeholder and one environment condition, with citation |
| 4 | `dp-boundary-scope` | `dp-verify-consistency` parts A and B on section 5; `dp-gap-search` section mode | At least one item inside and one exclusion with a reason; nothing both inside and outside |
| 5 | `dp-normative-sources` | `dp-verify-citations` on section 6, with the source copies; `dp-gap-search` section mode | Each source named, verified, or marked unverified with a question |
| 6 | `dp-close-feedback` | `dp-verify-citations` and `dp-verify-consistency` (A, B and C) complete; structural checklist; `dp-gap-search` full mode | Reports `GREEN`, structure complete, document presented, and the person's explicit `APROBAR` (or `not_approved`) |
| 7 | `dp-freeze-handoff` | Content checks and hash checks with `grep`, `jq` and `sha256sum` | Three hand-off files written; stop, Ctx 01 is not started |

## Feedback

`dp-close-feedback` leads the feedback. The person answers every open question
with a content answer or a forced closure; both count as closed, and the
document cannot be approved while any question is open. There are at most three
feedback rounds, and `dp-gap-search` re-runs at most twice — after rounds 1 and
2, never after round 3. If the document is not clean after round 3, the stage is
declared not approved and restarted with a corrected input. In that case, and
if the person stops the stage, only `results/ctx00/CONTEXT-ctx00.md` is written, with
`Status: not_approved` and the reason; no JSON is generated.

## Stop rules

1. Do not move to the next step while a verification is `FAIL`. Correct it and repeat the same verification.
2. Never relax a rule to make a verification pass, and never edit `results/ctx00/intake.md`.
3. Three correction attempts per verification. If it still fails, present the document with the unresolved failure stated in a box at the top, and the person decides.
4. Each verification leaves its verdict in section 10. A step is not finished while its report is missing.
5. Run the two verification skills in an independent context when the environment offers subagents; otherwise run them in the same context with the evidence table.

## Where state lives

Stage state lives in the document itself, in section 10: the feedback log
(one entry per round), the two counters — feedback rounds used (n of 3) and gap
search re-runs used (n of 2) — and the verification verdicts; the decision lives
in section 11. There is no event log and no separate state file.

## Hand-off to Ctx 01

The stage ends with the approved `results/ctx00/problem-definition.md` and these three
files, written by `dp-freeze-handoff`:

| File | Role |
|---|---|
| `results/ctx00/problem-baseline.json` | The frozen baseline: the same items as the document, one by one, per `references/baseline-schema.md`. Objectives carry measures with no thresholds. |
| `results/ctx00/problem-baseline.sha256` | The `sha256sum` line that fixes the JSON. |
| `results/ctx00/CONTEXT-ctx00.md` | Status, paths and hashes, questions closed by forced closure, open assumptions with closure criterion, and the reading order for Ctx 01. |

Reading order for Ctx 01: the context note, the JSON, then `results/ctx00/intake.md` and
the sources. If the stage was not approved, only the context note exists.

## Do not

- Do not approve, freeze or hand off without the person's explicit `APROBAR`.
- Do not start Ctx 01 from this stage.
- Do not load a dp-* skill other than through this orchestrator, nor hold sub-stage detail here.
- Do not relax a verification, nor edit `results/ctx00/intake.md`.

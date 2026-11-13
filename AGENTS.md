# AGENTS.md — Build-Package Methodology (read this first)

This repository holds a four-stage, agent-run methodology that turns a raw project
document into a **Build Package**: a complete, traceable, human-approved
specification a developer can implement without re-deciding anything.

You (the agent) run the stages. **A person decides every gate.** You draft, check
and present; you never approve your own output.

> This file is the entry point. Read it fully, then load **only** the stage skill the
> user asked for. Do not read other stage folders ahead of time.

## Agent harness entry

For running, resuming or inspecting Mapurito, read
`.agents/skills/mapurito/SKILL.md` and follow its common contracts before selecting
a stage. Claude Code enters through `.claude/skills/mapurito-claude/SKILL.md`.
For execution, invoke the corresponding native skill tool so the trusted
session-activation hook runs; filesystem reading alone does not activate it.
These are routing adapters, not replacements for stage skills. Repository
maintenance requests do not start the methodology. Source maintenance needs a
human-managed developer environment without the executor guard; the agent must
not disable its own protection. Start with normal `opencode`
or `claude`; project plugin/hooks select a stage policy from execution evidence.
They protect file tools independently of the skill. Optional fixed-stage profiles
remain available; no agent may weaken policy by editing its own configuration.

The development mapping is `.agents/mapurito/layout.json`: project and methodology
roots are currently the same. A future `.mapurito/` relocation is not active yet.

---

## 1. Core principles (apply in every stage)

1. **The person decides.** Scope, priorities, hardware and every approval
   (`APROBAR`, `AJUSTAR`, `DETENER`, `CERRAR_FORZADO`) are human decisions. Never
   infer approval from silence or from a vague reply.
2. **Never invent.** A value is `declarado` only if it is literally in a cited source,
   a datasheet snapshot or a human answer. Otherwise it is `derivado` (operation
   shown) or `propuesto`. Where material does not reach, raise a question.
3. **Upstream is read-only.** Each stage writes only to its own `results/ctxNN/`.
   Earlier stages' files are never modified; a needed change is an escalation
   (`R0`–`R3`), not an edit.
4. **Hashes bind the chain.** Each stage freezes a baseline JSON plus a `.sha256`;
   the next stage refuses to start if the hash does not verify.
5. **No evaluation material.** Never read or imitate anything under `evals/` or
   `legacy/`.
6. **Artifacts are in English.** Talk to the user in their language; write files in
   English.
7. **Shell one-liners only** (`sha256sum`, `jq`, `grep`, `comm`, `tsort`, `diff`).
   Do not generate or keep scripts as stage work. Run commands from this root.
   Repository-owned infrastructure in `.agents/mapurito/runtime/` implements the
   requested automatic permission harness; it is not a generated stage artifact
   and does not replace human approval or substantive gate judgement.
8. **Freeze is a verified closure.** Never freeze without explicit human approval,
   all blocking questions closed and all required checks passing. V1 hardware
   locking is not a stage freeze. Files from an interrupted freeze do not permit
   downstream admission; reconcile state, events, decision, artifacts and hashes.

---

## 2. The four stages

| Stage | Folder (entry skill) | Turns… | …into | Human stops |
|---|---|---|---|---|
| **ctx00** | `define-problem/SKILL.md` | the raw input document | Problem Definition + frozen `problem-baseline.json` | one final review → `APROBAR` |
| **ctx01** | `specify-requirements/SKILL.md` | problem baseline | Requirements Baseline (REQ / LIM / AC / DFR), **gate 1** | DEE review, up to 6 rounds → `APROBAR` |
| **ctx02** | `resolve-architecture-v2/SKILL.md` | requirements baseline | architecture, hardware references, plan, **V1** + **V2** | V1 (hardware), V2 (final design) |
| **ctx03** | `compile-build-package-v2/SKILL.md` | architecture + requirements | modular specification, tests, **V1** + **V2** | V1 (hardware refs), V2 (final spec) |

Strict order: `ctx00 → ctx01 → ctx02 → ctx03`. Each stage's `SKILL.md` is its **only
entry point**: it loads its own `skills/<prefix>-*/SKILL.md` one at a time
(`dp-*`, `sr-*`, `ra-*`, `cb-*`) and its `references/`. Never load a sub-skill
directly or skip ahead.

Path and hash rules for the whole pipeline live in **`pipeline-layout/SKILL.md`**
(read it once before running any stage). `pipeline-layout/guardrails.md` is
method-owned and read-only.

Final product: `results/ctx03/final-spec.md` (the implementation document for the
developer, assembled from the ctx01, ctx02 and ctx03 outputs) and
`results/ctx03/build-package-baseline.json` (+ `.sha256`).

---

## 3. Project structure

```
AGENTS.md                      ← this file (entry point)
inputs/                        ← the user's input document(s) go HERE
pipeline-layout/               ← result paths, hash rules, guardrails.md
define-problem/                ← ctx00  (SKILL.md, skills/dp-*, references/)
specify-requirements/          ← ctx01  (SKILL.md, skills/sr-*, references/, evals/)
resolve-architecture-v2/       ← ctx02  (SKILL.md, skills/ra-*, references/, evals/)
compile-build-package-v2/      ← ctx03  (SKILL.md, skills/cb-*, references/, evals/)
02_contexto/                   ← human background docs; not needed to run stages
results/                       ← ALL outputs (created by the stages)
  ctx00/  state.json, events.jsonl, intake.md, sources/, problem-definition.md, problem-baseline.json/.sha256, CONTEXT-ctx00.md
  ctx01/  record.json, state.json, events.jsonl, rounds/O<n>/, requirements-baseline.json/.sha256/.md, CONTEXT-ctx01.md
  ctx02/  state.json, events.jsonl, questions.json, items.json, substages/, validations/, architecture-baseline.json/.sha256/.md, final-design.md, CONTEXT-ctx02.md
  ctx03/  state.json, STATUS.md, events.jsonl, questions.json, items.json, spec-register.json, specs/, validations/, build-package-baseline.json/.sha256, final-spec.md, CONTEXT-ctx03.md
```

- **Input:** selected document(s) must be in `inputs/`. Use explicit references
  when supplied; otherwise inspect the folder: no files → request upload; one
  file → select it and proceed after validation; multiple files → immediately
  ask which one(s), then stop. See `.agents/mapurito/contracts/input-selection.md`.
  The current intake contract requires Markdown/plain text; a selected PDF needs
  a Markdown/text copy before execution. Never proceed with ambiguous inputs.
- **Output:** everything goes to `results/ctxNN/` (flat, no `output` subfolder).
  `results/` is created on demand.
- **Hand-off between stages** is only through files: each stage ends with a
  `CONTEXT-ctxNN.md` (status, paths, hashes, reading order). The next stage reads
  that note first. No stage relies on conversation memory of a previous one.

---

## 4. How to start (trigger phrases)

The user starts a run with a short instruction plus a reference to the input:

| User says (or similar) | You do |
|---|---|
| `Run ctx00 with @inputs/<doc>` | Run **only** ctx00 on that document. Stop when it ends. |
| `Run ctx01` / `Run ctx02` / `Run ctx03` | Run **only** that stage on the existing `results/` of the previous one. |
| `Run Full methodology with @inputs/<doc>` | **Full run** (§6): ctx00 → ctx03, each in an isolated context. |
| `Continue` / `Resume` | Detect progress (§7) and continue the current stage or the next one. |
| `Start methodology` / `Run methodology` / `Start with @inputs/<doc>` | Inspect progress first; resume existing work or select inputs and admit ctx00 if new. This is not an implicit restart or full-run request. |

Equivalent phrasing in Spanish ("Corre ctx00 con @…", "Corre toda la metodología con @…")
means the same. For a new ctx00 use the explicit/zero/one/multiple input rule
above. Resume and downstream stages use existing admitted inputs and handoffs,
not a fresh automatic selection from `inputs/`.

---

## 5. Mode A — stage by stage (sequential)

1. **Verify the start condition** for the requested stage:

   | Stage | Required before starting |
   |---|---|
   | ctx00 | Clear selected text input(s) in `inputs/` (explicit selection or sole discovered file). `results/ctx00/` empty or the user confirmed a restart. |
   | ctx01 | `CONTEXT-ctx00.md` has `Status: frozen`, ctx00 execution state is `approved`, human `APROBAR` is recorded, questions are closed, and `sha256sum -c results/ctx00/problem-baseline.sha256` passes. |
   | ctx02 | `sha256sum -c results/ctx01/requirements-baseline.sha256` passes, baseline `status: frozen`. |
   | ctx03 | `sha256sum -c results/ctx02/architecture-baseline.sha256` **and** `…/ctx01/requirements-baseline.sha256` pass. |

   If a check fails, do not start; report it. (The stage's own admission step then
   re-checks it in detail.)
2. Read `pipeline-layout/SKILL.md`, then the stage's `SKILL.md`, and follow it.
3. Work until the stage reaches a **human stop**; present the document, then wait.
   Continue only on the person's explicit decision.
4. When the stage freezes its baseline, confirm the output files exist, report
   them (path + hash) and **stop**. Do not start the next stage unless asked.
   Recommend a fresh context for the next one.

Run each stage in a **fresh session or after clearing context** whenever practical.
Mode A tolerates continuing in the same session only if the user explicitly asks.

---

## 6. Mode B — full run (all stages)

Triggered by `Run Full methodology with @inputs/<doc>`.

**Hard rule: each stage (ctx00, ctx01, ctx02, ctx03) runs in an isolated context.**
Nothing from a previous stage's conversation may leak forward. Context passes only
through the files in `results/`.

How to isolate, in order of preference:

1. **New session per stage.** After a stage freezes, tell the user the stage is done
   and give them the exact line to paste in a fresh session:
   `Run ctx0N` (or `Continue`). This is the default and always works.
2. **Clear the context** (`/clear` or equivalent) and continue, if the harness lets
   you do it between stages.
3. **A fresh subagent per stage**, only if the subagent can talk to the person for the
   stage's human gates. If it cannot, use option 1 or 2.

Never run two stages in the same context, even if the window has room.

Full-run procedure:

1. Confirm the input: `inputs/<doc>` exists and is readable. Announce the plan:
   four stages, strictly sequential, each isolated, each ending in a human decision.
2. Run **ctx00** (§5). On `APROBAR` and a verified hash → stage done.
3. **Isolate** (see above), then run **ctx01** → done on freeze + hash.
4. **Isolate**, then run **ctx02** → V1 approved, V2 approved, baseline frozen.
5. **Isolate**, then run **ctx03** → V1 approved, V2 approved, baseline frozen.
6. Report the final products (§2) and stop.

"Full run" means *one instruction drives the whole chain*; it does **not** remove the
human gates. A stage that ends `blocked`, `not_approved`, `DETENER` or
`returned_upstream` **halts the full run**. Report why, and wait. Never proceed to the
next stage over a failed gate or a failed hash.

---

## 7. Detecting progress and resuming

Read `results/` to locate candidate progress using the table below. Before choosing
an action, apply `.agents/mapurito/contracts/stage-routing.md` and `handoff.md`:
state, events, human decision, artifacts and hashes must agree. A baseline file
alone never proves completion; contradictions stop routing. This table does not
override a blocked, stopped or returned state, even if later files exist.

| Evidence | State |
|---|---|
| `results/` missing or empty | Nothing run. Start ctx00. |
| `results/ctx00/state.json` exists and `status` is not `approved` | ctx00 in progress or stopped; read `status`, `next_action` and events, then resume per its `SKILL.md`, even if freeze files are partially present. |
| `results/ctx00/CONTEXT-ctx00.md` says `Status: not_approved` | ctx00 failed. Restart it with a corrected input. |
| ctx00 closure evidence agrees, including `state.json: approved`, `CONTEXT: frozen`, approval, closed questions and a verified baseline hash | ctx00 done → ctx01 is next, subject to admission. Older runs need the read-only compatibility review in `handoff.md`; never fabricate logs. |
| `results/ctx01/state.json` exists, no `requirements-baseline.json` | ctx01 in progress. Resume per its `SKILL.md`. |
| ctx01 baseline + hash + handoff + recorded human approval + `baseline_frozen` agree | ctx01 done → ctx02 is next, subject to admission. |
| `results/ctx02/state.json` without `architecture-baseline.json` | ctx02 in progress (read `status`, `blocked_by`). |
| ctx02 state, V1/V2 approval, `STAGE_APPROVED`, handoff and verified baseline agree | ctx02 done → ctx03 is next, subject to admission. |
| `results/ctx03/state.json` (`next_action`, `STATUS.md`) without `build-package-baseline.json` | ctx03 in progress. |
| ctx03 closure evidence agrees, including V1/V2 approval, hashes and final-candidate identity | Methodology complete. |

For ctx02/ctx03, `state.json` is written after every step so a fresh session can
resume (ctx03 also has `STATUS.md`). A stage in `returned_upstream` means the human
must reopen the earlier stage as a controlled change (`R0`–`R2`); do not edit
upstream files yourself.

Never overwrite an existing `results/ctxNN/` without the user's explicit
confirmation. A restart of a stage on a new input discards that stage's results and
invalidates every later stage; say so before doing it.

---

## 8. Quick checklist before you act

- [ ] Did the user say which mode (stage / full) and which `@inputs/…` document?
- [ ] Did I read `pipeline-layout/SKILL.md` and the one stage `SKILL.md`?
- [ ] Do the upstream hashes verify (§5 table)?
- [ ] Am I in a fresh context for this stage?
- [ ] Am I writing only under `results/ctxNN/` for this stage?
- [ ] At every gate, am I waiting for the person's explicit decision?

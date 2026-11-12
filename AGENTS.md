# AGENTS.md — Build-Package Methodology (read this first)

This repository holds a four-stage, agent-run methodology that turns a raw project
document into a **Build Package**: a complete, traceable, human-approved
specification a developer can implement without re-deciding anything.

You (the agent) run the stages. **A person decides every gate.** You draft, check
and present; you never approve your own output.

> This file is the entry point. Read it fully, then load **only** the stage skill the
> user asked for. Do not read other stage folders ahead of time.

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
   Do not write or keep scripts. Run commands from this root.

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

Final product: `results/ctx03/build-package-baseline.json` (+ `.sha256`, `.md`),
`results/ctx03/final-spec.md`.

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
  ctx03/  state.json, STATUS.md, events.jsonl, questions.json, items.json, spec-register.json, specs/, validations/, build-package-baseline.json/.sha256/.md, final-spec.md, CONTEXT-ctx03.md
```

- **Input:** the project document must be in `inputs/` and **referenced explicitly**
  by the user. Agents can't read PDFs reliably: use the `.md` version. If only a
  PDF is given, stop and ask for a Markdown/text copy.
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

Equivalent phrasing in Spanish ("Corre ctx00 con @…", "Corre toda la metodología con @…")
means the same. If the document is not in `inputs/` or not referenced, ask for it
before doing anything else.

---

## 5. Mode A — stage by stage (sequential)

1. **Verify the start condition** for the requested stage:

   | Stage | Required before starting |
   |---|---|
   | ctx00 | A document in `inputs/`, referenced by the user. `results/ctx00/` empty or the user confirmed a restart. |
   | ctx01 | `results/ctx00/CONTEXT-ctx00.md` with `Status: approved`, and `sha256sum -c results/ctx00/problem-baseline.sha256` passes. |
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

Read `results/` to find where things stand (check in this order, last match wins):

| Evidence | State |
|---|---|
| `results/` missing or empty | Nothing run. Start ctx00. |
| `results/ctx00/state.json` exists and `status` is not `approved` | ctx00 in progress or stopped; read `status`, `next_action` and events, then resume per its `SKILL.md`, even if freeze files are partially present. |
| `results/ctx00/CONTEXT-ctx00.md` says `Status: not_approved` | ctx00 failed. Restart it with a corrected input. |
| `results/ctx00/problem-baseline.json` + `.sha256` exist and `state.json` says `approved` (or an older run without `state.json` has an approved hand-off) | ctx00 done → ctx01 is next, subject to the admission checks. |
| `results/ctx01/state.json` exists, no `requirements-baseline.json` | ctx01 in progress. Resume per its `SKILL.md`. |
| `results/ctx01/requirements-baseline.json` + `.sha256` | ctx01 done → ctx02 is next. |
| `results/ctx02/state.json` without `architecture-baseline.json` | ctx02 in progress (read `status`, `blocked_by`). |
| `results/ctx02/architecture-baseline.json` + `.sha256` | ctx02 done → ctx03 is next. |
| `results/ctx03/state.json` (`next_action`, `STATUS.md`) without `build-package-baseline.json` | ctx03 in progress. |
| `results/ctx03/build-package-baseline.json` + `.sha256` | Methodology complete. |

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

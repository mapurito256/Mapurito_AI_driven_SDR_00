# Usage Guide — how to run the methodology

This guide is for you, the person using the methodology. It explains how to start it, what the agent does, where the results end up and what you have to decide at each stage.

> To understand the reasoning behind the design, read `02_contexto/proceso-build-package.md`. The agent reads `AGENTS.md`.

---

## 1. What the methodology does

It turns an input document (idea, proposal, objectives, requirements draft) into a **Build Package**: a complete specification that a developer can implement without deciding anything about design.

It does so in four stages, always in this order:

| Stage | What it produces | You decide |
|---|---|---|
| **ctx00** Define the problem | Agreed and frozen problem | That the problem and scope are correct |
| **ctx01** Specify requirements | Requirements, limits and acceptance criteria | That the requirements are complete and verifiable |
| **ctx02** Resolve the architecture | Architecture, reference hardware and plan | The hardware (V1) and the final design (V2) |
| **ctx03** Compile the Build Package | Modular specification and tests | The hardware references (V1) and the final specification (V2) |

**The agent proposes and you decide.** Nothing advances without your explicit approval.

---

## 2. Before you start

1. **Put your input document in `inputs/`.** Use Markdown or text: agents do not read PDFs well. If you only have a PDF, convert it to `.md`.
2. **Open the agent in this folder** (`methodology_22/`). The agent reads `AGENTS.md` on its own.
3. **Decide the run mode** (see §3).
4. **Set aside time to respond.** At each validation the agent stops and waits for your decision.

---

## 3. How to run it

### Mode A · stage by stage (recommended the first time)

Write to the agent, in a new session:

```
Run ctx00 with @inputs/my_document.md
```

When ctx00 finishes and you approve it, open **a new session** (or clear the context) and write:

```
Run ctx01
Run ctx02
Run ctx03
```

one per session, in that order. Each stage checks by itself that the previous one finished correctly (correct hash) and refuses to start if not.

### Mode B · the whole methodology

```
Run Full methodology with @inputs/my_document.md
```

The agent chains the four stages, **each with an isolated context**. It does so by asking you to open a new session (or clear the context) at the end of each stage and resuming with `Continue`. **It does not remove your validations:** it stops at each one, and also if a stage ends blocked, not approved, stopped or returned.

### Resume

If you close the session midway, open a new one and write:

```
Continue
```

The agent looks at `results/`, detects which stage and which point you are at, and continues from there.

### Equivalent phrases

Variants such as "Corre ctx00 con @inputs/…", "Corre toda la metodología con @inputs/…" or "Continúa" also work.

---

## 4. Where the results end up

Everything is saved in `results/`, inside each stage's folder. Stages are never mixed.

```
results/
├── ctx00/   state.json · events.jsonl · intake.md · sources/ · problem-definition.md ·
│            problem-baseline.json · problem-baseline.sha256 · CONTEXT-ctx00.md
├── ctx01/   record.json · state.json · events.jsonl · rounds/O1…O6/ ·
│            requirements-baseline.json/.sha256/.md · CONTEXT-ctx01.md
├── ctx02/   state.json · events.jsonl · questions.json · items.json · substages/ ·
│            validations/V1|V2/R<n>/ · architecture-baseline.json/.sha256/.md ·
│            final-design.md · CONTEXT-ctx02.md
└── ctx03/   state.json · STATUS.md · events.jsonl · questions.json · items.json ·
             spec-register.json · specs/ · validations/V1|V2/R<n>/ ·
             build-package-baseline.json/.sha256/.md · final-spec.md · CONTEXT-ctx03.md
```

**What to look at:**

| You want to… | Open |
|---|---|
| Read the approved problem | `results/ctx00/problem-definition.md` |
| Read the approved requirements | `results/ctx01/requirements-baseline.md` |
| Read the approved design | `results/ctx02/final-design.md` |
| **Read the final product** | `results/ctx03/final-spec.md` and `results/ctx03/build-package-baseline.md` |
| Know where a stage stands | that stage's `state.json` (in ctx03, also `STATUS.md`) |
| Understand what a stage hands to the next | `CONTEXT-ctxNN.md` |

The `*-baseline.json` files with their `.sha256` are the **frozen** version of each stage. Do not edit them: if they change, the next stage will refuse to start.

---

## 5. How your validation works in each stage

Common rule: **the agent never approves**. It presents a document, stops and waits. Only your explicit decision counts.

The possible decisions:

| Decision | Meaning |
|---|---|
| `APROBAR` | The stage (or the validation) is fine. It is frozen and the next step is enabled. |
| `AJUSTAR` | You want changes. The agent applies them and comes back with a new document. |
| `DETENER` | You stop the stage. Nothing is frozen. |
| `CERRAR_FORZADO: <Q-id>` | You close a question without giving it content (you consider it unfounded). The agent decides by the minimum viable product criterion and marks it as *proposed* and *forced*. |

`APROBAR` **is not accepted** while there is an open question that blocks that validation or a gate in `FAIL`. In that case the agent tells you and the stage is left `blocked`.

### ctx00 — one review at the end

1. The agent works through the seven sub-stages **without interrupting you** and gathers all doubts.
2. It presents `results/ctx00/problem-definition.md` with the open questions (`OQ-nn`).
3. **You respond in the chat:**
   - each question with a **content answer** or as a **forced closure**;
   - any modification you want;
   - or, if there are no questions or changes, you write **`APROBAR` with your name**.
4. There are **up to 3 rounds**. After round 3, if the document is not clean, the stage is left *not approved* and restarts with a corrected input.

Only with your `APROBAR` does the agent freeze the JSON and write the hash.

### ctx01 — one document per round (DEE)

1. The agent delivers, in `results/ctx01/rounds/O<n>/`:
   - `dee.md`: the document you read. Its six sections are: summary and status of the 7 gates, complete content, what the agent decided, what remains open, gate results with evidence, and the pending decision.
   - `response-form.md`: the empty form.
2. **You fill in `response-form.md`:**

   ```markdown
   # Feedback response — round 1 (output O1)
   Decision: AJUSTAR            <- APROBAR | AJUSTAR | DETENER

   ## Answers to open questions
   - Q-01: <your answer, or "forced closure">

   ## Improvement themes
   - T-01: <an improvement theme, in your own words>
   ```

   A theme does not need technical grounding: if something does not convince you, that is already a finding.
3. You tell the agent you have responded; it reads it, plans the changes and comes back with the next output.

**Limits:** up to **6 outputs** (O1–O6).

| Output | New questions | What you can send |
|---|---|---|
| O1, O2 | Yes | Answers, themes and decision |
| O3 | No: open ones are **forced closed** as visible assumptions | Improvements or approval |
| O4–O6 | No | Only improvement themes |
| After O6 | — | Only `APROBAR` (with forced assumptions visible) or `DETENER` |

If any deferral (`DFR`) remains open, the only possible approval is `APROBAR_CON_APLAZAMIENTO`, which carries the list of deferrals attached.

### ctx02 — two validations: V1 (hardware) and V2 (final design)

1. **V1.** After comparing hardware, the agent stops and leaves in `results/ctx02/validations/V1/R<n>/`:
   - `hardware-proposal.md`: what you read. **Open questions always come first**, and the ones that block are marked.
   - `feedback.md`: the empty form, with each question as `Q-02-nn`.
2. **You fill in `feedback.md`** with the decision, your answers (or `CERRAR_FORZADO: Q-02-nn`) and your `T-nn` themes.
3. The agent writes `integration.md` with one row for each answer and theme, saying what it will do with it: `apply`, `no-op-confirmed`, `reject`, `defer:Ctx03`, `escalate:…` or `not-locatable`. Nothing is lost.
4. With `APROBAR` in V1, **the approved hardware is locked** and the second phase starts.
5. **V2** works the same way with `final-design.md` (decisions, components, dependencies and plan).

**Rounds per validation:**

| Presentation | New questions | What you can send |
|---|---|---|
| R1, R2 | Yes | Answers, themes and decision |
| R3 | No | Answers, themes and decision |
| R4 | No | **Only `APROBAR` or `DETENER`** |

Up to **3 adjustments per validation** (V1 and V2 separately). A change in V2 that touches already approved hardware is escalated to V1 and consumes one of its rounds.

### ctx03 — two validations: V1 (hardware references) and V2 (final specification)

Same as ctx02, with:

- **V1:** hardware references for everything that is not the SDR or the board (datasheets, at most two options per component). Document: `results/ctx03/validations/V1/R<n>/hardware-proposal.md`.
- **Intermediate phase without interruption:** the agent writes the specification modules one by one. You can follow progress in `results/ctx03/STATUS.md`.
- **V2:** final specification in `results/ctx03/validations/V2/R<n>/final-spec.md`. Values the agent could not close without you appear as questions.
- `APROBAR` in V2 generates the Build Package.

### If you disagree with an escalation

If the agent detects that a change affects something already frozen (scope, requirements or design), it **does not apply it**: it records it as `escalate:…` and the stage goes to `returned_upstream`. It is your decision whether to reopen the earlier stage; that reopening invalidates the results of later stages.

---

## 6. What to do when something does not go as expected

| Situation | What it means and what to do |
|---|---|
| The agent says it cannot start a stage | The previous stage's hash does not verify or `CONTEXT-ctxNN.md` is missing. Check that you have not edited `results/` and that the previous stage is approved. |
| State `blocked` | There is an open question or a gate in `FAIL`. Answer it or close it with `CERRAR_FORZADO`, or adjust what fails. |
| State `not_approved` (ctx00) | After 3 rounds it was not clean. Fix the input document and rerun ctx00. |
| State `returned_upstream` | A change affects a frozen stage. Decide whether to reopen that stage; the agent will not do it on its own. |
| You closed the session | Open a new one and write `Continue`. |
| You want to redo a stage | Tell the agent. **Beforehand** it will warn you that its results are discarded and that later stages are invalidated; it never overwrites without your confirmation. |

---

## 7. Good practices

- **One stage per session.** It is the isolation rule and the one that most protects quality.
- **Do not edit by hand** anything in `results/`, especially the `*-baseline.json` files, the `.sha256` files or `intake.md`.
- **Read the whole document before deciding.** Green gates are necessary, not sufficient: you can respond `AJUSTAR` with everything green.
- **Prefer answering with content** over forcing closure. A forced closure leaves an assumption that travels to later stages.
- **Pay special attention** to the `propuesto` (proposed) and `forced` marks: they are what the agent decided and not what the source or you said.
- **Respond by identifier** (`Q-…`, `T-…`) and in the form, not in loose prose.

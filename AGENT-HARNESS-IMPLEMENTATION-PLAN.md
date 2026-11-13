# Agent Skills and Harness: Initial Implementation Plan

**Status:** approved for local implementation by the user's implementation request;
development-tree harness and contract corrections implemented on
`feat/agent-harness-base`. Native interactive acceptance and full-process
isolation remain unverified; see `.agents/mapurito/verification.md`.

**Objective:** let OpenCode and Claude Code run the existing four-stage methodology through a common, auditable entry point, while preserving human decisions, stage contracts, and isolated handoffs.

This document captures the initial plan and incorporates the resolution of the
four identified discrepancies. The evidence in section 5 records the original
pre-change findings. The implemented contract changes are in the stage sources
and `.agents/mapurito/`; execution evidence is tracked in the verification file.
The future `.mapurito/` layout, CLI, installer, and version migration remain
subsequent work.

## Automatic activation revision

The user requested normal `opencode` / `claude` startup with stage policies chosen
automatically after state inspection. Implemented with a shared checked-in
mechanical runtime, an OpenCode plugin and Claude project hooks. Optional fixed
`--agent` / `--settings` profiles remain, but are no longer required. The runtime
selects and enforces file-scope rules; it does not replace semantic gates, human
approval or isolated contexts. It is infrastructure, not a generated stage script.

Input selection now follows explicit references first; otherwise zero files in
`inputs/` requests upload, one selects automatically, several immediately asks
which one(s) and stops. Multiple selected text files preserve their paths, hashes
and order in one immutable intake. Resume retains the admitted input set.
See `.agents/mapurito/contracts/input-selection.md` and `verification.md`.
This revision supersedes mandatory manual profile selection in the original
design below. Profile files remain the configuration source for the automatic
file guard; unsupported native tools and full host isolation remain outside its
claims. Current implementation details take precedence over historical findings.

## 1. Scope and governing principles

- Keep the internal organization and substantive process of the existing stages. Limit necessary changes to entry, path resolution, contract clarifications, and integration.
- A person determines scope, priorities, hardware, and approval. The agent drafts, checks, reports, and waits at the prescribed human stops.
- Never infer approval from silence, a green gate, a file's presence, or a vague response.
- A stage reads upstream outputs as read-only and writes only its own `results/ctxNN/` files. A needed upstream change is an escalation, not an edit.
- Preserve provenance, traceability, baseline hashes, stage-specific validations, closed event sets, and documented handoffs.
- Load `pipeline-layout/SKILL.md`, then only the requested stage's entry skill; its orchestrator loads its own subskills one at a time. Do not read or imitate `evals/` or `legacy/`.
- Project conversation follows the person's language; generated methodology artifacts and repository documentation are in English.
- Stage work still uses shell one-liners and does not generate scripts. The user's automatic-activation request is implemented as repository-owned infrastructure under `.agents/mapurito/runtime/` and native project adapters, outside the stage artifacts.
- This plan targets one active run using the existing `results/ctx00/` through `results/ctx03/` paths. Parallel runs and automatic migration between methodology versions are future design work.

## 2. Verified stage contracts

Sources: repository `AGENTS.md`, `pipeline-layout/SKILL.md`, each stage's entry `SKILL.md`, and the stage record references. The detailed gate and admission skills remain authoritative for their own checks.

| Stage | Input and admission | Principal outputs | Human validation |
|---|---|---|---|
| **ctx00** | Selected Markdown/text document(s) under `inputs/`, explicit references first or sole-file discovery; multiple candidates require a human choice. Existing results require restart confirmation. | `state.json`, `events.jsonl`, immutable numbered `intake.md`, `sources/`, `problem-definition.md`; after approval and checks, `problem-baseline.json`, `.sha256`, `CONTEXT-ctx00.md`. | Final review; up to three feedback rounds. Explicit `APROBAR` with the person's name and no open questions are required before freeze. A stop or failed review produces `not_approved`, preserving work without a frozen baseline. |
| **ctx01** | Read `CONTEXT-ctx00.md` first, then the approved problem baseline, intake and sources; verify hashes and admission; use `pipeline-layout/guardrails.md`. | `state.json`, `events.jsonl`, `record.json`, `rounds/O<n>/`, frozen `requirements-baseline.json`, `.sha256`, readable `.md`, `CONTEXT-ctx01.md`. | DEE and response form each round; up to O1–O6. Gate failures block freeze. The current process force-closes remaining open questions as visible assumptions when preparing O3; this differs from ctx02/03. An open controlled deferral currently leads to the computed `APROBAR_CON_APLAZAMIENTO` verdict. |
| **ctx02** | Read `CONTEXT-ctx01.md` first, followed by the requirements baseline, record/state and indicated ctx00 material; validate the baseline hash and stage admission. | `state.json`, `events.jsonl`, `questions.json`, `items.json`, `sources/`, `substages/`, `validations/`, approved architecture baseline and hash, readable baseline, `final-design.md`, `CONTEXT-ctx02.md`. | V1 for hardware, V2 for final design. Up to three adjustments per validation; open blocking questions or failed gates block approval. Human-declared forced closure is explicit. Upstream defects escalate rather than modify earlier stages. |
| **ctx03** | Read `CONTEXT-ctx02.md` first, then the architecture and design, ctx01 context/baseline/record, and indicated ctx00/ctx02 sources. Verify ctx01 and ctx02 hashes and admission. | `state.json`, `STATUS.md`, `events.jsonl`, questions, items, specification register, sources, modules and validations; approved `final-spec.md`, `build-package-baseline.json`, `.sha256`, `CONTEXT-ctx03.md`. | V1 for hardware, V2 for the candidate specification. The approved final document must be byte-identical to the candidate reviewed. Blocking questions or failed gates prevent approval; changes needing upstream work escalate. |

The inputs above are a navigation summary, not a substitute for the full admission checks, reading order, round rules, and gate evidence in each stage.

## 3. Context, handoffs, and interruption recovery

### 3.1 Between stages

For a full-methodology run, use an isolated context for each stage. The default handoff is a new session; only `results/` files carry project context forward. After a verified freeze, provide the exact next-stage instruction and stop. Do not simulate isolation with a chat summary. If isolation cannot be established, stop and ask the person to open a fresh session.

For stage-by-stage mode, a fresh session is recommended; the current instructions allow the same session only on explicit request. Read the preceding `CONTEXT-ctxNN.md` first, then the ordered inputs and hashes required by the next stage.

### 3.2 Within a stage

Resume from the stage's own state, event log, artifacts, round/validation feedback and schema. Ctx03 additionally has `STATUS.md`, `spec-register.json`, `current_spec`, and `next_action`. A generated file without the relevant closing event may be incomplete; do not infer completion or duplicate human decisions. Reconcile inconsistent evidence as described in section 5.4.

## 4. Proposed harness and discovery layout

```text
project/
├── .agents/
│   ├── skills/mapurito/SKILL.md       # Canonical OpenCode-discoverable entry
│   └── mapurito/
│       ├── contracts/                 # Routing, permissions, execution, handoffs
│       ├── adapters/                  # Agent-specific integration contracts
│       ├── runtime/                   # Automatic file-policy enforcement
│       └── tests/                     # Isolated mechanical runtime tests
├── .claude/
│   └── skills/mapurito-claude/SKILL.md # Minimal Claude-discoverable adapter
├── inputs/
└── results/ctx00 ... ctx03/
```

The common paths above are implemented, together with `.opencode/plugins/mapurito.js`,
`.claude/settings.json` and shared `runtime/` and `tests/` directories. OpenCode
discovers `.agents/skills/`; Claude Code discovers `.claude/skills/`. The Claude
adapter reads common instructions without copying the methodology. Distinct IDs
avoid competing entries. Preserve pre-existing project settings on future installs.

### 4.1 Entry protocol

1. Load the Mapurito entry skill and common execution contract.
2. Resolve the explicit project root, methodology root, and version/run binding applicable to the current deployment mode.
3. Read the selected methodology's `AGENTS.md`, then inspect relevant state and evidence.
4. Determine the requested or resumable stage; stop on ambiguous or contradictory records.
5. Check session/context and stage admission; runtime hooks independently select and enforce the stage file policy without manual launch flags.
6. Read `pipeline-layout/SKILL.md`, then the selected stage's `SKILL.md`; follow the stage's own ordered subskill loading.
7. Present evidence and wait at human gates. After a verified freeze, stop or isolate according to the chosen mode.

Suggested status output: stage, state, evidence consulted, blockers, permitted next action, and human decision awaited. The router chooses the applicable procedure; it never makes project decisions or approves a gate.

### 4.2 Permissions and enforcement

| Resource | Expected read | Expected write during execution |
|---|---|---|
| Harness contracts, methodology copy and protection configuration | As needed | Deny to the executor |
| `inputs/` | Referenced input | Do not modify the source input |
| Active `results/ctxNN/` | Yes | Only as the active stage permits |
| Earlier stage outputs | As required by admission | Deny |
| Later stage outputs | Do not read ahead | Deny |
| `evals/`, `legacy/` | Deny | Deny |
| Outside the project | Only when the workflow and configured permissions allow | Deny by default |

This is a target policy, not a claim of enforced isolation. Implement and test agent-specific file-tool permissions, command/process restrictions, subagent permissions, and the actual boundaries of MCP, hooks, plugins and services. A denied edit tool does not by itself deny shell or external processes. Hashes detect changes relative to an inventory; they do not prevent writes or authenticate their origin. Report any uncovered path.

### 4.3 Future `.mapurito/` integration

Define, without yet relocating files: `PROJECT_ROOT`, `METHOD_ROOT`, `INPUT_ROOT`, `RESULT_ROOT`, and the methodology version bound to a run. First test with an explicit development mapping to today's repository; later point the same contract to a versioned local copy, for example `.mapurito/versions/<version>/methodology/`. Do not automatically change an in-progress run's version. If the bound version or integrity evidence is missing, stop. Rerun the integration tests after relocation.

## 5. Integrated discrepancy-resolution plan

### 5.1 D1 — Approved versus frozen ctx00 handoff

**Evidence:** `AGENTS.md` section 5 requests `CONTEXT-ctx00.md` with `Status: approved`; `define-problem/references/record-schema.md` and `dp-freeze-handoff` specify handoff `Status: frozen`, while ctx00 `state.json` uses `approved`. These are different fields, not evidence that an unapproved frozen state is intended.

**Desired invariant:** a baseline may be frozen only after explicit human approval, all questions that block that freeze are closed, and the applicable checks pass. `frozen` must never mean “not approved.” A failed or stopped stage is not frozen. A closure marked forced must retain its existing stage-specific evidence; do not treat an unanswered open question as closed.

**Proposed minimal normalization:** preserve the existing handoff value `frozen` and the execution-state value `approved`, and correct admission instructions so they require both the appropriate values and corroborating approval, question-closure, baseline and hash evidence. Do not relabel a baseline as approved without evidence. Confirm the exact fields of the baseline schema and `CONTEXT` before editing; preserve schema compatibility.

**Implementation tasks:**
1. Inventory freeze, approval and question checks at all stage boundaries; distinguish full-stage freeze from V1 hardware locking.
2. Correct the ctx00/ctx01 admission mismatch in `AGENTS.md` and any affected entry/handoff descriptions; keep the existing `state.json` and handoff semantics explicit.
3. Ensure each stage's own freeze path blocks when the relevant explicit approval, question closure or required gate is absent. Preserve ctx01's existing O3 forced-closure rule unless separately changed.
4. Document partial-freeze recovery without claiming that a partially written baseline is complete.

**Acceptance:** no approval, an open blocking question, a failing mandatory check, or a missing/invalid hash prevents freeze or downstream admission; valid `state: approved` plus `CONTEXT: frozen` and consistent evidence permits admission. `not_approved` is never accepted as frozen. Test each case without overwriting existing runs.

### 5.2 D2 — Approval with controlled deferrals in ctx01

**Evidence:** `specify-requirements/references/item-schema.md` defines `DFR` as a controlled deferral that survives the gate, distinct from an open question (`OQ`). A `DFR` records a governing requirement, responsible future stage, closure criterion, bracket or `sin cota`, materiality and state. `sr-gate-check` currently computes `APROBAR_CON_APLAZAMIENTO` when gates pass and a `DFR` remains open; the orchestrator freezes only on human sign-off. Ctx02 records a deferral as closed or `travels-intact`.

**Analysis:** an approved, frozen baseline can carry a documented future technical deferral; that is not an unapproved baseline. The separate decision label may be redundant, but removing it must not silently delete deferrals or hide their consequences.

**Implemented direction following approval to implement:** use one explicit human
`APROBAR` for a clean gate; visibly present and record any open `DFR`, its
responsible stage, closure criterion and the `not_acceptable_until_closure` set.
The computed verdict is `SEGUIR` or `AJUSTAR`, never a human decision; the existing
DFR metadata remains separate. Preserve all DFR propagation/closure checks.

**Implementation tasks:**
1. Inventory `APROBAR_CON_APLAZAMIENTO`, `SEGUIR`, `APROBAR`, `AJUSTAR`, `DETENER`, deferral handling, templates, state fields, event payloads and consumers across ctx01 and downstream handoffs, without reading evaluation or legacy material.
2. Separate human decisions, computed gate verdicts and deferral metadata into explicitly documented fields or codes; choose exact schema and migration rules only after review.
3. If approved, align ctx01 orchestrator, feedback, gate, schemas, templates, handoff, downstream readers, `AGENTS.md` and user documentation. Preserve the stage process, traceability and open DFR obligations.
4. Define explicit read-only compatibility or a controlled migration for existing records containing `APROBAR_CON_APLAZAMIENTO`; never silently rewrite frozen baselines or hashes.

**Acceptance:** all gates pass and a human approves before freeze; no open blocking OQ remains; open DFRs are visible and carried with their obligations. A denied/absent approval or failed gate blocks freeze. Legacy decisions are interpreted only according to the approved compatibility rule. Whether DFRs themselves should ever block advancement is a separate human decision, not implied by the current proposal.

### 5.3 D3 — ctx01 admission and `record.json` initialization

**Evidence:** `specify-requirements/SKILL.md` lists upstream admission checks and checks that read `results/ctx01/record.json`, while `references/records.md` specifies the record fields. The exact creation order for a new run is not explicitly established by the entry skill and record reference alone. Do not infer it from a missing file.

**Proposed resolution:** separate upstream-only admission from new-record initialization and record-dependent integrity checks. Check the upstream context, baseline, hashes and source prerequisites first. For a genuinely new run, create the record/state according to the declared schema and capture the upstream and guardrail hashes before checks that need them. On resume, validate existing records rather than overwrite them. Run seeded-item completeness checks at the documented point after the seeded items actually exist; do not weaken the final gate. The implementation must verify the actual detailed sequence and reconcile events before selecting the exact step.

**Acceptance:** a valid new run succeeds without assuming a pre-existing record; a resumed run preserves its records; invalid upstream evidence stops before initialization or advancement; missing or mismatched record/guardrail evidence blocks the relevant later check. Repeated execution does not silently truncate records or duplicate completed events.

### 5.4 D4 — Partial state, evidence and recovery

**Approved direction:** the harness compares state, events, recorded human decision, artifacts, baseline and hash as applicable to the stage; contradictory evidence stops advancement and is reconciled under that stage's rules.

**Implementation tasks:**
1. Specify stage-specific evidence and completion predicates; do not assume all schemas have a common `status` or `next_action` field.
2. Detect incomplete file/event sequences, absent handoffs, failed hashes, inconsistent decisions, interrupted freezes and stopped/returned states.
3. Report the conflicting evidence and the safe permitted next action; consult the person when evidence cannot determine the original decision.
4. Preserve append-only history and existing artifacts. Do not manufacture events, approvals or missing hashes, overwrite a frozen result, or start the next stage merely because a baseline file exists.
5. Document recovery checkpoints and repeatability for each stage. Older records and missing logs require a separately documented compatibility decision, never fabricated history.

**Acceptance:** interruption at each freeze checkpoint never grants downstream admission until complete consistent evidence exists; a valid completed freeze is recognized; a human decision is neither duplicated nor inferred. Verify ctx03's final document is byte-identical to the approved candidate.

## 6. Implementation phases and dependencies

### Phase A — Resolve the stage contracts first

- [x] Inventory inputs, outputs, states, events, questions, decisions, gates and handoffs.
- [x] Review and agree the D1 status mapping and cross-stage freeze invariants.
- [x] Implement the approved single approval label while preserving DFR metadata; specify read-only historical compatibility.
- [x] Verify and specify D3 initialization and record-dependent check order.
- [x] Specify D4 stage-specific reconciliation and recovery.
- [x] Align only the affected contracts, entry instructions and references; preserve the substantive internal stage workflows.

**Exit:** no harness admission relies on an invented state mapping or an ambiguous decision code.

### Phase B — Common harness contracts

- [x] Write compact execution, routing, permissions and handoff contracts under `.agents/mapurito/`.
- [x] Define reading order, state decision tree, human stops, full-run context isolation and status output.
- [x] Specify that detailed gates are evaluated by their own stage skills, with the harness checking their recorded evidence.

**Exit:** a fresh agent can determine the permitted next action without reading all stages or inferring approval.

### Phase C — Agent entry skills

- [x] Create the canonical `.agents/skills/mapurito/` skill with concise activation and hard rules.
- [x] Create a minimal `.claude/skills/` adapter to the canonical contract.
- [ ] Test discovery, explicit invocation, natural-language activation, identifier precedence and coexistence on named agent versions.
- [x] Preserve existing project instructions and configurations; do not overwrite conflicts.

**Exit:** both agents reach the same common instructions in a clean session.

### Phase D — Basic protection

- [x] Map the permission matrix to each agent's actual supported settings and document the native-tool isolation boundary.
- [ ] Protect the methodology and harness from edits; assess protection of prior stages and active-stage writes.
- [ ] Exercise direct file tools, shell, subagents and any enabled MCP/hooks/plugins separately.
- [x] Record exact enforcement scope, unsupported paths and limitations; do not claim complete isolation without evidence.

**Exit:** negative tests demonstrate the protections actually enforced for each supported agent/version.

### Phase E — Routing, gates and recovery verification

- [ ] Test missing input, existing results, valid stage start and resume within all four stages.
- [ ] Test waiting for human feedback, failed gates, open questions, O3 behavior, frozen baselines and controlled deferrals.
- [ ] Test wrong/missing hashes, incomplete artifacts, interrupted freeze, inconsistent state/events, `stopped` and `returned_upstream`.
- [ ] Test single-stage stop and full-run fresh-context handoff.
- [ ] Test ctx03 module progress and final-candidate identity.
- [ ] Use controlled fixtures for admission and recovery and at least one human-gated integrated run; do not read or imitate repository evaluation material.

**Exit:** the router stops on contradictory or incomplete evidence and never invents a human decision.

### Phase F — Prepare, but do not perform, `.mapurito/` relocation

- [x] Define project/method roots and the future version-binding boundary; implement only the explicit development mapping.
- [x] Inventory relocation surfaces in `.agents/mapurito/path-migration.md`; exact affected-file enumeration remains part of relocation.
- [x] Reject unsupported mappings now; specify future fail-closed behavior for missing or changed versions and defer migration/update mechanisms.
- [ ] Reuse all discovery, permissions and execution tests after the separate relocation phase.

**Exit:** the base harness has a documented integration contract for the later `.mapurito/` work.

## 7. Review and completion criteria

- [x] The user's implementation request authorizes the discrepancy plan, including single approval with visible DFR and read-only historical compatibility.
- [ ] Stage freeze requires the correct human approval, closed blocking questions, passing gates and valid evidence.
- [ ] Both agents discover their entry and follow the same stage-routing contract.
- [ ] Handoffs, interrupted sessions, hashes and human decisions are verified using stage-specific records.
- [ ] Full-run stage isolation is real, not an inferred chat summary.
- [ ] Technical protections are tested per access path and their limitations are disclosed.
- [ ] Existing stage internals, project configuration and earlier results are preserved except for explicitly approved contract/path corrections.
- [ ] The next phase can organize the versioned `.mapurito/` copy without redesigning the harness.

## 8. Source references

- `AGENTS.md` — entry, stage order, human gates, progress detection and context isolation.
- `pipeline-layout/SKILL.md` — result paths, handoffs and baseline hashes.
- `define-problem/SKILL.md`, `define-problem/references/record-schema.md`, `define-problem/skills/dp-freeze-handoff/SKILL.md` — ctx00 state and freeze.
- `specify-requirements/SKILL.md`, `specify-requirements/references/records.md`, `specify-requirements/references/item-schema.md`, `specify-requirements/skills/sr-gate-check/SKILL.md`, `specify-requirements/skills/sr-feedback-cycle/SKILL.md` — ctx01 admission, decisions, gates and deferrals.
- `resolve-architecture-v2/SKILL.md`, `resolve-architecture-v2/references/records.md` — ctx02 contract.
- `compile-build-package-v2/SKILL.md`, `compile-build-package-v2/references/records.md` — ctx03 contract.
- OpenCode documentation: https://opencode.ai/docs/skills/ and https://opencode.ai/docs/permissions/.
- Claude Code documentation: https://code.claude.com/docs/en/skills and https://code.claude.com/docs/en/permissions.

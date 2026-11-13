# Execution contract

## Start each session

1. Read `.agents/mapurito/layout.json` from the project root, then the mapped
   `AGENTS.md`, this contract, `stage-routing.md`, `handoff.md` and `permissions.md`.
2. Resolve paths relative to the project root; `stage_entries` are relative to
   `method_root`. Reject missing, outside-project or symlink-escaping roots. Do
   not scan unrelated directories to find an alternative methodology.
3. The only supported mapping now is `mode: development`, `project_root: .`,
   `method_root: .`, `input_root: inputs`, `result_root: results`, with the four
   entries in the shipped mapping. `methodology_version: null` means an unversioned
   working tree, not a reproducible release. Reject a different mode/mapping until
   relocation, version binding, integrity inventory and path migration are implemented.
4. Determine inspect, single-stage, full-run or resume intent. A status question
   performs no writes, does not create `results/`, and does not alter counters.
5. Invoke the native Mapurito entry skill for execution; its hook activates this
   host session. Follow routing and `input-selection.md` for a new ctx00. The trusted runtime
   plugin/hooks re-read progress and select the current file-policy profile on
   each mutation; verify they are enabled. No per-stage launch flags are required.
   If the person chose an optional fixed-stage profile, it must also match.
   Read `pipeline-layout/SKILL.md`, then the selected stage entry and its record
   reference. Stage inputs begin with the upstream `CONTEXT` when applicable.

## Stage ownership

The stage orchestrator owns its steps, detailed gates, questions, counters, events
and artifact formats. The harness checks their evidence and enforces routing; it
does not reimplement judgement as a new gate or add event types. Record changes
through the owning skill. A router stop is reported in chat; do not invent
`status`/`next_action` fields where the stage schema has none.

Finish terminal artifacts, events and the final state/STATUS snapshot in the
owning stage's documented order. Once all closure evidence is complete the guard
selects the next scope; do not append optional summaries to an already closed
stage. A valid routing candidate does not prove fresh-context isolation or waive
any of the stage's detailed gates.

Run only from the root. Read one subskill's detail at a time; this is progressive
loading, not a guarantee that previous instructions disappear from context.
When context is insufficient, persist work and open a new session of the same stage.

## Human decisions

Use original messages/forms, never generated form placeholders, as evidence. Keep
decision, signer, target validation/round, reviewed document and gate results
consistent. `pass`, `SEGUIR`, a DFR or silence is not approval. ctx01 human decisions
are `APROBAR`, `AJUSTAR`, `DETENER`; controlled DFRs remain explicit obligations.
O3's existing forced-assumption rule remains ctx01-specific. ctx02/03 questions
close without answers only on the person's `CERRAR_FORZADO`; new needs from R3
follow the stage's visible `forced: by-limit` procedure, not an invented answer.

Stop at review, failed admission, unresolved gates, stopped/returned outcomes or
inconsistent evidence. Never weaken a check to complete a stage. Reopening an
upstream baseline is a human-controlled change with downstream invalidation.

## Context and review isolation

In full mode, stop after each verified closure and provide `Run ctx0N` in a fresh
session; the runtime selects its profile from the records. A chat summary, session fork or compaction
retaining previous-stage conversation is not isolated context. If a tool cannot
create an isolated interactive session, the person opens one. Single-stage mode
also stops after its stage; recommend a fresh session for the next one.

The stage's independent reviewers receive only their explicitly allowed input
pack, not drafts that would break blindness. Verify their own permissions; do
not assume inheritance. Native profiles initially deny delegation: use the
documented inline fallback, record it as less reliable, or stop if the person
requires independent review. Do not delegate human gates to a noninteractive task.

## Report

At stops report: stage and phase, state, evidence paths and hash results, blockers,
executor profile and limitations, next action, and the exact human decision or
fresh-session instruction required. Do not report unperformed checks as passing.

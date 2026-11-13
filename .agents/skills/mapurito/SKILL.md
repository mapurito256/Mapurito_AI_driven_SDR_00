---
name: mapurito
description: "Trigger: start/run methodology, start with inputs, run ctx00-ctx03, continue, iniciar metodologia. Inspect state, select inputs and activate stage policy."
license: LicenseRef-Unspecified
metadata:
  author: Mapurito
  version: "0.2"
---

# Mapurito entry

## Activation Contract

Use for explicit methodology execution, continuation or status requests in
English or Spanish. Repository maintenance does not start a methodology run.
For an execution request invoke this entry through the host skill tool; reading
it as a file alone does not activate session permissions. Claude uses its adapter.

## Hard Rules

- Read the common execution, routing, handoff and permissions contracts below.
- Never approve, infer human answers, bypass gates or edit upstream outputs.
- Load only the selected stage entry, then its subskills in their prescribed order.
- Keep evaluation and legacy material out of every executor/reviewer context.
- Always inspect state before execution/resume. Runtime hooks independently
  select and enforce the stage file policy; never edit settings to activate it.
- Without selected inputs, do not initialize results. Follow `input-selection.md`.

## Decision Gates

| Evidence | Action |
|---|---|
| New run | Explicit inputs first; otherwise zero files → request upload, one → select, many → ask and stop. |
| Existing work | Reconcile stage-specific records before resuming. |
| Human response awaited | Present the review paths and wait. |
| Contradiction, blocked, stopped or returned | Follow the owning stage's rule; do not skip forward. |
| Verified closure | Stop or request a fresh context according to run mode. |

## Execution Steps

1. Resolve the project root from `.agents/mapurito/layout.json`; read the mapped
   `AGENTS.md` and `pipeline-layout/SKILL.md` and validate the development mapping.
2. Apply `stage-routing.md` using on-disk evidence and the explicit user request.
3. For new ctx00, follow input selection. Confirm runtime stage-policy hooks are
   active; a read JSON is not an active permissions policy. A manually selected
   fixed-stage profile must also match; it is optional for normal startup.
4. Read its mapped `SKILL.md`, its record reference and the relevant stage inputs
   in the handoff order. Let that orchestrator perform admission and detailed gates.
5. Persist progress using only the stage's existing schema/events. On interruption
   or compaction, recover through `handoff.md` rather than conversation memory.

## Output Contract

Report stage, status, evidence paths, blockers, next permitted action and human
decision awaited. Report profile limitations accurately. Never claim a freeze
from a baseline file alone.

## References

- [Execution](../../mapurito/contracts/execution.md)
- [Routing](../../mapurito/contracts/stage-routing.md)
- [Handoff and recovery](../../mapurito/contracts/handoff.md)
- [Permissions](../../mapurito/contracts/permissions.md)
- [Input selection](../../mapurito/contracts/input-selection.md)

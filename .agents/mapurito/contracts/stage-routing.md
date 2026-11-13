# Routing contract

Read `execution.md` and `handoff.md` first. Route on evidence, never a filename
alone. Existing state field names differ by stage; do not normalize by rewriting.

## Inspect without loading future stage content

List candidate directories and read only their routing metadata (`state.json`,
handoff status and closing events). This is not permission to read later-stage
drafts, baselines or sources. If the selected profile blocks needed inspection,
report that limitation and request an appropriate session; never bypass it.

Find the earliest stage that is not verifiably closed, checking prior closures
as needed. Later artifacts do not override an earlier unfinished, stopped,
returned, corrupt or ambiguous stage. Conflicting multiple active stages stop
routing. An explicit request for a later stage does not waive upstream admission.

| Evidence / intent | Permitted action |
|---|---|
| No results | Apply `input-selection.md`: use explicit inputs, otherwise select the sole discovered file, ask for a choice if multiple, or request upload if empty; admit ctx00 only after format checks. |
| Existing work, incomplete evidence | Report and reconcile under `handoff.md`; do not initialize over it. |
| Human decision pending | Present the current document/form and wait; process a new response only through the owning feedback skill. |
| `blocked` with failures | Resume only correction/checks permitted by the stage; no approval or downstream advance. |
| `blocked` awaiting human response | Wait; no repeated rounds without human input. |
| `not_approved`, `stopped` or `DETENER` | Halt. A restart needs explicit confirmation, input review and downstream invalidation notice. |
| `returned_upstream` / escalation | Halt and request controlled reopening; do not edit an earlier stage. |
| Running stage | Resume its owning entry with evidence and the matching profile. |
| Verified stage closure | Next stage is eligible, subject to its admission, user intent and context isolation. |
| Verified ctx03 closure | Report final products and stop. |

## Stage-specific routing evidence

| Stage | Resume evidence | Closure evidence (all must agree) |
|---|---|---|
| ctx00 | `state`, events, document sections 10/11, `current_step`, `next_action`, counters | execution `approved`, handoff and baseline `frozen`, human `APROBAR` + name, closed questions, GREEN reports, `STAGE_APPROVED`, baseline/document/intake/source hashes |
| ctx01 | state `round`, decision/counters, `record`, events, DEE/response/improvement plan | baseline `frozen`, human `APROBAR` + signer/date (older forms: handoff compatibility), no open OQ, passing seven gate rows, `baseline_frozen`, hash, readable copy and handoff; preserve open DFR obligations |
| ctx02 | state `status`, phase, V1/V2 counters, questions/items, completed substages and integration | `status: approved`, recorded V1/V2 approvals, V1 locked hash, passing applicable G02 gates, no open blocking questions, `STAGE_APPROVED`, baseline/hash, readable baseline, final design and handoff |
| ctx03 | state + `STATUS.md`, register order/dependencies/progress, current SPEC, events and validations | `status: approved`, V1/V2 approvals, applicable G03 gates, no blocking questions, completed required register entries, final/candidate byte identity, baseline and manifest hashes, `STAGE_APPROVED` and handoff |

ctx01 has no generic `status` or `next_action` field. Infer the permitted next
procedure from its documented round/events and response, not from a fabricated
field. V1 locking in ctx02/03 is not a full-stage freeze. Open technical points
or DFRs travel only as their stage contracts permit; never silently drop them.

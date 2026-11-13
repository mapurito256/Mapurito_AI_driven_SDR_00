# Handoff, compatibility and recovery

## Admission and closure

Read the prior stage's `CONTEXT` before its baseline and supporting files, in the
order fixed by `pipeline-layout` and the selected stage entry. Verify all required
hashes from the project root. Human approval and closed blocking questions are
necessary but not sufficient: gates, artifacts, event and state must also agree.

Current ctx00 uses baseline/handoff `frozen` and execution state `approved`.
ctx01 baseline uses `frozen`; ctx02/03 use `approved` for baseline/execution state.
These are stage-specific codes for completed approval, not interchangeable fields.
Never label any unapproved baseline frozen. Approval with an unresolved blocking
question, failed or unevaluable required check cannot complete closure.

## Interruptions

| Checkpoint | Recovery |
|---|---|
| File exists without closing event | Treat action as incomplete; inspect owning step evidence before finishing it. |
| Human response recorded before application | Reuse the original response and integrate only unfinished changes; do not recount or duplicate it. |
| Baseline exists without hash/event/context | Partial freeze, no downstream admission. Verify original approval and content, then resume the owning freeze step only if evidence is unambiguous. |
| Hash fails or frozen content differs | Stop and report; do not recompute a hash to bless altered content. |
| State claims closure but event/document disagrees | Stop; reconcile against original artifacts and human evidence. |
| ctx03 candidate differs from final | Approval of the candidate is not approval of the new bytes. Follow `cb-feedback-cycle` and ask for review again. |
| Context is compacted/exhausted | Resume from records and original sources; summaries and persistent memory are navigation aids, not project evidence. |

Preserve append-only events. Finishing a genuinely incomplete owning step may
append its real event after actual checks; never backfill a fictitious history or
pretend a check happened earlier. Do not edit a frozen upstream result as recovery.
If the original decision or exact reviewed artifact cannot be established, ask
the person before further writes. Do not silently delete partial artifacts.

## Older runs: read-only compatibility

Missing old logs do not justify fabricated events or an automatic new freeze.
Compare all available signed original responses, reviewed documents, gate reports,
handoff, status, baseline and hashes. Report which modern evidence is absent and
request explicit human confirmation of read-only compatibility before admission.
Record that confirmation in the receiving stage's existing admission evidence/event
payload; leave upstream bytes unchanged. If required approval, closed questions,
gate or artifact integrity cannot be established, stop for controlled reopening.

For existing ctx01 `APROBAR_CON_APLAZAMIENTO`, accept as a historical signed approval
only when original approval, passing gates, closed OQ, DFR obligations, frozen hash
and other available closure evidence agree. `SEGUIR` alone is never approval. Keep
old decision strings unchanged; emit only `APROBAR` for new human approvals.

Automatic file-scope selection requires the documented execution records. If an
older run lacks modern state/events or uses `SEGUIR` as its state decision, a
human compatibility conversation alone does not change the runtime guard.
Stop for a separately approved compatibility/recovery integration; do not invent
upstream files or disable the guard to force downstream entry. Fully recorded
historical signed `APROBAR_CON_APLAZAMIENTO` remains readable without rewriting.

## Completion report

Show artifacts and checked hashes, original human decision source, blockers or
missing evidence, and the next permitted action. In full mode provide a fresh
session command; never carry project conclusions through conversation alone.

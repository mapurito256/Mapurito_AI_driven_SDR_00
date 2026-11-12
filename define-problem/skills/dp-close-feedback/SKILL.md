---
name: dp-close-feedback
description: Consolidates the document, checks its structure, leads the human feedback to zero open questions, and keeps the feedback log; loaded by define-problem, not invoked directly.
---

# dp-close-feedback

## Purpose

Consolidate the sections into one readable document, confirm it is structurally
complete, lead the human feedback until no open question remains, and produce
the stage's output. This is the only human review of the base flow.

## Inputs

- Sections 1 to 8 of `results/ctx00/problem-definition.md`, and the person's answers during feedback.
- `../../references/record-schema.md` for the **Final document layout**, **Item lines**, the **Open-question block**, **Provenance marks** and the **CONTEXT template**.
- `../dp-gap-search/SKILL.md`, `../dp-verify-citations/SKILL.md`, `../dp-verify-consistency/SKILL.md`.

## Procedure

1. Write section 9: each assumption as the next `ASM-nn` line (from 01, no gaps, no reuse) with its `owner` and `closure criterion`. If you cannot name both, it is not an assumption yet: raise a question instead. Then consolidate sections 1 to 9 into `results/ctx00/problem-definition.md` in the order of the **Final document layout**.
2. Run `dp-gap-search` in full mode (initial pass) to compile section 8 from the candidate lists.
3. Run `dp-verify-citations` and `dp-verify-consistency` (parts A, B and C) over the whole document.
4. Run the **Structural checklist** below.
5. Write section 11 in its pending form (`Decision: <pending>`, name and date pending), ask the person to write `APROBAR` with their name, or to request adjustments, and present the document.
6. If the person gives feedback, run one **Feedback round** (below) and present again. Repeat up to three rounds.

## Structural checklist

Before every presentation, confirm:

- The eleven sections are present and in the order of the **Final document layout**.
- Each open question has the four fields of the **Open-question block** and a state.
- Each objective has its success measure, and no measure carries a threshold.
- The exclusion list is not empty and each exclusion has a reason.
- Neither the problem nor any objective names a solution.
- The two counters in section 10 are present as `- Feedback rounds used: n of 3` and `- Gap search re-runs used: n of 2`, consistent with the log entries.
- Every element of sections 3 to 7 and 9 has its identifier and mark.
- Section 11 is in pending form.

A failing item is fixed before the document is presented.

## Feedback round

The person answers every open question, each with a **content answer** (the
missing information or the clarification) or a **forced closure** (the person
judges the gap unfounded). Both count as closed; a question with neither stays
open, and the document cannot be approved with any open question.

In each round, in this order:

1. Incorporate each answer. A content answer goes into its section marked `[D]` with a citation `[cite: FB-n/OQ-nn]`; its question becomes `closed (answered)`. A forced closure changes no content; its question becomes `closed (forced)` and is never reformulated.
2. Run `dp-gap-search` in full mode **only in rounds 1 and 2**; never in round 3.
3. Run `dp-verify-citations` and `dp-verify-consistency` (A, B, C) over the whole document.
4. Update section 10 (below).
5. Run the **Structural checklist** and present the document again.

**Direct approval** is possible only when the initial document has zero open
questions and the person requests no modification. Approval is only the
person's literal `APROBAR` with their name; the agent never approves, never
infers it, and never writes the decision into section 11 itself (that is
`dp-freeze-handoff`).

**Limits.** At most three feedback rounds; gap search re-runs at most twice
(after rounds 1 and 2) and never after round 3. If after round 3 the document
is not clean — the person still requests modifications or a new contradiction
remains — the stage is declared not approved and is restarted with a corrected
input.

## Not approved

If round 3 ends without a clean document, or the person stops the stage: do not
load `dp-freeze-handoff` or write the baseline JSON or its `.sha256`. Write
`results/ctx00/CONTEXT-ctx00.md` with the **CONTEXT template**, `Status: not_approved`,
the `Reason`, the paths and hashes (`sha256sum`) of the `.md` and `intake.md`, and
the open questions and assumptions as they stand. Preserve the working files;
the orchestrator records `STAGE_STOPPED` and updates execution state. Then stop.

## Feedback log (section 10)

Section 10 holds one detailed entry per round and two counters. The orchestrator
also records feedback events and current counters in the execution files defined
in `record-schema.md`; those records do not replace the detailed log. Each entry records:

- the round number (1, 2 or 3);
- the questions presented (`OQ-nn`);
- each answer with its identifier `FB-n/OQ-nn`, its type (`content` or `forced`) and its text;
- modifications the person requested outside the questions;
- the gap search outcome: which re-run ran, or that it did not run because the limit was reached, and the new questions it produced or `No new gaps`;
- the results of citation verification and contradiction detection.

The two counters, always visible, in the form `- Feedback rounds used: n of 3`
and `- Gap search re-runs used: n of 2`. Section 10 also receives the verdicts of
the verification skills; the freeze checks are added later by `dp-freeze-handoff`.

## Output

`results/ctx00/problem-definition.md` with all eleven sections, every open question
closed, and section 10 holding the feedback log and counters; or, in the not
approved case, `results/ctx00/CONTEXT-ctx00.md` without a baseline.

## Exit condition

All eleven sections are present and in order, every citation is verifiable, no
contradiction is unresolved, every open question has its four fields, and the
approved version has zero open questions (each either answered or force-closed).
Only then, and only with the person's explicit `APROBAR`, load
`../dp-freeze-handoff/SKILL.md`; without it the stage waits.

## If it fails

If a verification fails, correct the document and re-run it before presenting.
If the document is not clean after round 3, do not approve it: declare it not
approved (see **Not approved**) and restart the stage with a corrected input.
Never approve with an open question.

## Do not

- Do not approve, or write the decision, name or date of approval: only the person decides.
- Do not load `dp-freeze-handoff` without the person's explicit `APROBAR`.
- Do not generate JSON or `.sha256` when the stage is not approved.
- Do not reformulate a question closed by force, nor run gap search after round 3.

---
name: sr-gap-questions
description: Decides which absences in the Ctx 01 input are real gaps that become open questions, applying three anti-bias tests so no gap is invented; loaded by specify-requirements at 01.1 and 01.6, not invoked directly.
---

# sr-gap-questions

## Purpose

Turn absences in the material into open questions — only the real ones. This
skill holds the three tests that a candidate must pass, so the pass can run again
after feedback without inventing questions. "No gap" is a correct, expected
result; there is no question quota.

## Inputs

- `results/ctx00/problem-baseline.json` (objectives, scope, stakeholders, environment,
  sources and their snapshots, obligations, statements) and `results/ctx00/intake.md`.
- `results/ctx01/record.json` for what has already been drafted (used only in the 01.6 pass).
- `references/item-schema.md` for the `OQ` fields and the question discard codes.

## The three tests (a candidate failing any one is discarded with a code)

1. **Negative evidence.** Before declaring a gap, search the whole input for the
   claim with at least two wordings and record the search. If a source states it
   in other words, it is not a gap: discard `already-stated`, citing where.
2. **Impact.** The absence must change or block at least one REQ, LIM, AC, DFR,
   scope item or obligation. If it blocks nothing, discard `no-impact`.
3. **Not decidable by the agent.** If a reasonable reading of the source answers
   the doubt, cite that reading and discard `derivable`; the datum is then drafted
   by `sr-draft-items`, not asked. Only what needs a human value or judgement
   survives as a question.

## Procedure

1. Enumerate candidate absences by category: objective without a measure, limit
   without a source, figure without a citation, obligation without a source,
   conflict between two statements, in-scope element with no requirement.
2. Apply the three tests to each candidate, in order. Record the verdict for
   every candidate: survived, or discarded with one code and its evidence.
3. Rank survivors by impact. Raise at most 8 as `OQ` this run; record the rest in
   `not_asked` with their rank and evidence (not discarded, just deferred).
4. Each raised `OQ` carries its four descriptive fields and `estado: abierta`.
5. In the 01.6 re-run, respect the round rules of `sr-feedback-cycle`: never
   re-ask a force-closed or answered question, and raise a new one only if its
   origin is in what the feedback introduced. Conclude `No new gaps` when none.
6. Emit `questions_raised` with the asked ids and the `not_asked` count.

## Output format

In `results/ctx01/record.json`: `items` gains the raised `OQ` objects; `not_asked` gains the
deferred candidates; each discarded candidate is logged with its code and the
cited evidence. A per-category line reads `No gap in <category>` when empty.

## Do not

- Do not propose an answer to your own question; if you can answer it, it is
  `derivable` and is drafted, not asked.
- Do not pad to a count or invent an origin to justify a question.
- Do not raise more than 8 questions in a run, and do not raise any new question
  in O3–O6.
- Do not load any fixture or example dataset.

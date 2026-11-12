---
name: ra-gap-questions
description: Decides which absences in the Ctx 02 input and which important choices are real questions for the human, applying three anti-bias tests so none is invented; loaded by resolve-architecture-v2 at 02.1, 02.4 and 02.7, not invoked directly.
---

# ra-gap-questions

## Objective

Turn real absences and important human-owned choices into open questions, and
only those. "No gap" is a correct, expected result; there is no quota. The same
three tests run again after feedback without inventing questions.

## Inputs

The admitted inputs (Ctx 01 baseline, `results/ctx01/CONTEXT-ctx01.md`, Ctx 00 document and
sources), `results/ctx02/substages/02.1.md`, and in `design` mode the current `results/ctx02/items.json`.
Fields and codes: `references/item-schema.md`. Decision rule:
`references/mvp-criteria.md`.

## The three tests (a candidate failing any one is discarded with a code)

1. **Negative evidence.** Search the whole input for the claim with at least two
   wordings and record the search. If a source states it in other words, discard
   `already-stated`, citing where.
2. **Impact.** The absence must change or block a decision, a component, the
   hardware selection, or an assigned `REQ`/`LIM`. If it blocks nothing, discard
   `no-impact`.
3. **Not decidable by the agent.** If the MVP criterion resolves it, the agent
   decides, marks the result `propuesto`, and discards `derivable`. Only what
   needs a human value or judgement survives.

## Kinds, categories and gate

- `kind`: `gap` (a datum is missing) or `decision` (an important choice that is
  the human's, such as between two architecture variants with different
  costs).
- `category`: one of `G-FLOW`, `G-RF`, `G-HW`, `G-INTERFACE`, `G-ENV`, `G-PERF`,
  `G-PROCESS`, `G-CONFLICT`.
- `gate`: `V1` if the answer could change the flow, the RF path or the hardware
  selection; otherwise `V2`. All open questions show in the next validation;
  only those of that gate block its approval.

## Procedure

1. Choose the mode. `input` (02.1): absences in the admitted input. `design`
   (02.4, 02.7): absences and decisions found while designing.
2. **Independent pass.** Launch a subagent with the Agent tool and a fresh
   context that sees only the admitted inputs, never the design or earlier
   answers; it returns candidates with a quote each. If the tool is unavailable,
   run `inline` and record `independent_pass: inline`.
3. Add the candidates you found yourself. Apply the three tests, in order, to
   every candidate; record `survived` or the discard code with its evidence in
   `candidates` of `results/ctx02/questions.json`.
4. Rank survivors by impact. Raise at most 8 per run (all passes that produce one
   presentation count together); record the rest in `not_asked` with rank and
   evidence.
5. Write each raised question with all its fields and `state: open`.
6. Respect the round table of `ra-feedback-cycle`: no new question in
   presentations R3 and R4; never re-ask an answered or force-closed question; a
   new question needs an origin in what the last feedback introduced. Conclude
   `No new gaps` when none.
7. Emit `QUESTION_RUN` with the mode, the ids raised, the `not_asked` count and
   the pass mode.

## Output format

`results/ctx02/questions.json` gains the raised questions, the candidate log and `not_asked`;
a line `No gap in <category>` for each empty category.

## Do not

- Do not answer your own question; if you can, it is `derivable`.
- Do not pad to a count or invent an origin to justify a question.
- Do not raise more than 8 in a run, and none in presentations R3 or R4.
- Do not let the independent pass see the design.
- Do not load any fixture or example dataset.

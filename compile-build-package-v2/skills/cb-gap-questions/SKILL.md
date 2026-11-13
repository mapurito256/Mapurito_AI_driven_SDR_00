---
name: cb-gap-questions
description: Decides which absences in the Ctx 03 input and which important design choices are real questions for the human, applying three anti-bias tests so none is invented, and stores them for the V1 and V2 documents; loaded by compile-build-package-v2 at 03.1, 03.2 and 03.5, not invoked directly.
---

# cb-gap-questions

## Objective

Turn real absences and important human-owned choices into stored, open questions,
and only those. "No gap" is a correct, expected result; there is no quota. The
same three tests run again after feedback without inventing questions. Every
question shows in the next validation document; the human closes each one with an
answer or with `CERRAR_FORZADO`.

## Inputs

The admitted inputs, `results/ctx03/substages/03.1.md`, the register, and in
`design` mode the current `results/ctx03/items.json` and the `candidates` logged
by `cb-spec-module` (each with its provisional value). Fields and codes:
`references/item-schema.md`. Decision rule: `references/mvp-criteria.md`.

## The three tests (a candidate failing any one is discarded with a code)

1. **Negative evidence.** Search the whole input for the claim with at least two
   wordings and record the search. If a source states it in other words, discard
   `already-stated`, citing where.
2. **Impact.** The absence or choice must change or block a hardware choice, a
   parameter that affects an `AC`, a budget verdict, a module or a test. If it
   blocks nothing, discard `no-impact`.
3. **Not decidable by the agent.** If `references/mvp-criteria.md` or
   `references/parameter-rules.md` resolves it, the agent decides, marks the result
   `propuesto`, and discards `derivable`. Only what needs a human value or
   judgement survives.

## Which choices are important enough (kind `decision`)

A `decision` question is raised only when at least two options both meet every
`AC` and fit the hardware, and the choice trades something the human owns:
detection sensitivity versus time, cost or power versus margin, retention versus
storage, one reference instrument versus another. Each option is written with its
effect on quality, compute and resources in one unit. Routine choices stay with
the agent as `propuesto` and are listed, not asked.

## Kinds, categories and gate

- `kind`: `gap` (a datum is missing) or `decision`.
- `category`: one of `G-INPUT`, `G-HW`, `G-ALGO`, `G-PARAM`, `G-PROC`,
  `G-SCHEMA`, `G-TEST`, `G-RESOURCE`, `G-CONFLICT`.
- `gate`: `V1` if the answer could change a hardware choice, the provisional
  budget or the register; otherwise `V2`. All open questions show in the next
  validation; only those of that gate block its approval.

## Procedure

1. Choose the mode. `input` (03.1): absences in the admitted input. `design`
   (03.2 and, after 03.6, the V2 presentation): absences and decisions found while
   designing; for V2 also every logged candidate with a provisional value and every
   design-decision gap of the consumer test on the implementation document.
2. **Independent pass.** Launch a subagent with the Agent tool and a fresh context
   that sees only the admitted inputs, never the design or earlier answers; it
   returns candidates with a quote each. If the tool is unavailable, run `inline`
   and record `independent_pass: inline`.
3. Add the candidates you found yourself. Apply the three tests, in order, to every
   candidate; record `survived` or the discard code with its evidence in
   `candidates` of `results/ctx03/questions.json`.
4. Rank survivors by impact. Raise at most 8 per run (all passes that produce one
   presentation count together; at V1 the `input` and the 03.2 `design` pass share
   the cap); record the rest in `not_asked` with rank and evidence.
5. Write each raised question with all its fields and `state: open`; for a choice
   already used in a module set `provisional` with the `SPEC` ids that use it.
6. Respect the round table of `cb-feedback-cycle`: no new question in
   presentations R3 and R4; never re-ask an answered or force-closed question; a
   new question needs an origin in what the last feedback introduced. Conclude
   `No new gaps` when none.
7. Increment `question_runs_used` of the validation. Emit `QUESTION_RUN` with the
   mode, the ids raised, the `not_asked` count and the pass mode.

## Output format

`results/ctx03/questions.json` gains the raised questions, the candidate log and
`not_asked`; a line `No gap in <category>` for each empty category.

## Do not

- Do not answer your own question; if you can, it is `derivable`.
- Do not pad to a count or invent an origin to justify a question.
- Do not raise more than 8 in a run, and none in presentations R3 or R4.
- Do not let the independent pass see the design.
- Do not ask about a value the agent owns just to avoid deciding it.
- Do not load any fixture or example dataset.

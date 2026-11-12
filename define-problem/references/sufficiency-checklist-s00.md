---
name: sufficiency-checklist-s00
description: Ten intention dimensions the Ctx 00 document should cover; an empty one becomes an open question, never an invented item. Advisory, read by the dp-* skills.
---

# sufficiency-checklist-s00 — ten intention dimensions

## Objective

An advisory checklist that detects omissions cheaply by comparing the document
with a fixed list. It never blocks. Per `elicitation-guide.md`, an empty
dimension becomes an `OQ` (if it meets the criteria of `dp-gap-search`), not an
invented item. Ctx 00 has no upstream baseline to measure coverage against,
which is why this list exists.

## Dimensions

| # | Intention dimension | Covered when |
|---|---|---|
| 1 | Problem stated | section 2 holds the problem sentence |
| 2 | Objectives | at least one `OBJ` |
| 3 | Success measures | every `OBJ` has a measure |
| 4 | Users | an `STK` of type `user` |
| 5 | Affected non-users | an `STK` of type `affected` |
| 6 | Operating environment | at least one `ENV` |
| 7 | Boundary | at least one `EXT` or one `SCP` |
| 8 | Scope in | an `SCP` with `side: in` |
| 9 | Scope out | an `SCP` with `side: out` |
| 10 | Authoritative sources | at least one `SRC`, or the explicit statement that none applies |

Also check **stakeholder-category completeness**: each type of
`record-schema.md` is either present with a citation or consciously left out.

## Steps

1. Walk the table against the document after step 6 of the flow.
2. For each uncovered dimension, decide with `dp-gap-search` whether it is a real gap; if so write the `OQ`.
3. Record nothing else: the result is the section 8 questions.

## Known limit

None of this catches what the person never said and no list contemplates; that
residual omission appears later, in Ctx 01. The list lowers the loss; it does
not remove it.

## Do not

- Do not block the document because a dimension is empty.
- Do not invent an item to cover a dimension.
- Do not ask about a dimension whose absence causes no concrete problem.

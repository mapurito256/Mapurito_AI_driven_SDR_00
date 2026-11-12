---
name: elicitation-guide
description: Guidance for turning an empty category into an open question, keeping nothing invented, and applying provenance discipline; read by the dp-* skills.
---

# elicitation-guide — empty category ⇒ OQ; nothing is invented

## Objective

Elicitation is guidance for the agent, not a gate. The one rule that matters:
**nothing is invented.** Where the intake does not reach, the agent opens an
open question (`OQ`); it never fills the gap from its own knowledge.

## The loop

1. The agent drafts typed items from the intake, each with a citation.
2. For every empty category (a missing stakeholder type, an unresolved
   applicability trigger, an objective with no measure), the agent writes an
   `OQ` instead of guessing, subject to the criteria of `dp-gap-search`.
3. The person answers. The answer is recorded in section 10 as `FB-n/OQ-nn`
   (never in `results/ctx00/intake.md`) and cited from the section it changes.
4. At approval every `OQ` is `closed (answered)` or `closed (forced)`. An
   assumption, with owner and closure criterion, may record what stays unknown.

## What becomes an OQ, not an item

| Situation | Do | Not |
|---|---|---|
| A stakeholder category is empty | `OQ`: "who is the …?" | invent a plausible stakeholder |
| An objective has no success measure | `OQ` about that `OBJ-nn` | assign a unit from domain memory |
| An applicability trigger fires but no governing source is available | `OQ`, or an `ASM` with owner and criterion | cite a regulation from memory |
| The intake names a solution | `SOL-nn` in section 7, with its citation | write it into the problem or an objective |
| A number is needed but the intake gives none | `OQ` | write a `[P]` number as if it were `[D]` |

## Provenance discipline

- `[D]` — the value is in a cited quote, verbatim.
- `[R]` — the agent computed it from cited material, choosing nothing.
- `[P]` — the agent chose it because nothing determined it. It is marked, and the person must approve it before the document is approved.

A value, unit or sense absent from the quote is never `[D]`, whoever said it.

## Do not

- Do not fill a gap from the agent's own knowledge.
- Do not write an answer into `results/ctx00/intake.md`.
- Do not leave a `[P]` element unmarked or unapproved at approval.

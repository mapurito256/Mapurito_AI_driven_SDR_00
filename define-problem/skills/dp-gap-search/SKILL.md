---
name: dp-gap-search
description: Decides which real gaps in the material become open questions and which are not, as a re-runnable pass; loaded by define-problem, not invoked directly.
---

# dp-gap-search

## Purpose

Turn the gaps in the input material into open questions — only the real ones.
This skill holds the criteria that decide whether an absence deserves a
question, and runs as a repeatable pass so it can run again after feedback
without reintroducing fabricated questions.

## Inputs

- The current `results/ctx00/problem-definition.md` (the sections written so far, or all of them).
- `results/ctx00/intake.md` for the statements.
- In a re-run, the feedback log in section 10.
- `../../references/record-schema.md` for the **Open-question block**.

## Gap criteria

A gap becomes an open question only when it meets every point below. These are
the only rules for raising a question; no other skill restates them.

1. **Four fields.** The question has the four fields of the **Open-question block** in `record-schema.md`. A question that cannot fill all four is not a real gap and is not written.
2. **Evidence, not suspicion.** The `Origin` field names the `STM-nn` that motivated the question, or states the explicit absence (`absence: no statements about X`). A question with no origin is fabricated.
3. **Materiality.** The `Impact` field names what the next stage cannot produce without the answer. If the absence changes no design decision and no next-stage requirement, it is not an operative gap and is not raised.
4. **No self-answers.** Do not propose an answer to your own question. If you could answer it, it is derivable from the material: derive it and write it into the document instead. The one exception is a `normative` gap resolvable by a public source — see **Client gap vs source-resolvable gap**.
5. **Type.** The `Type` field is `information` (the datum is absent), `precision` (present but ambiguous wording) or `normative` (a source not provided is needed). A `contradiction` is raised by the consistency skill, not here.

### No quota

There is no minimum. Generate exactly the questions the material needs — not
one more, not one less. Zero open questions is a correct result when the
material is solid, never a failure or an omission.

### "No gaps" is a valid result

When a section is fully covered by the material, write, in that section's gap
notes: `No gaps identified in <section name>. The input material provides what
the next stage needs.` This is the right answer for complete material, not a
shortfall on your part.

### Client gap vs source-resolvable gap

- **Client gap** — the answer depends on a client decision (what they want, how far it goes, who it is for). Only the person can answer it. Write the open question with its four fields.
- **Source-resolvable gap** — the answer is in a public normative or technical source. Find it, verify it, and write it into the document as a statement marked `[R]` (derived from a verified source) with its citation. Do not raise an open question for it.

## Procedure

Two modes.

1. **Section mode** — run when a sub-stage finishes its section. Review that section against the gap criteria above and record each candidate question in a working list (not yet in the document). Record `No gaps identified…` when the section is complete.
2. **Full mode, at closure** — consolidate the working list: remove duplicates, drop any candidate that fails the four fields, and write the survivors as **Open-question block**s in section 8 of the document, numbered `OQ-nn` in order from 01.
3. **Full mode, re-run** — run only after feedback round 1 and after round 2 (never after round 3), on the updated document and the feedback log. A re-run:
   a. never re-asks a question the person closed by force, nor a materially equivalent one;
   b. never re-asks what the person already answered;
   c. adds a new question only if it meets the four fields **and** its origin is in what the feedback introduced (an answer that opens a new gap or conflicts with another section);
   d. may conclude `No new gaps`, which is a valid result.
4. In a re-run, read the gap-search re-run counter in section 10, and increment it: this is re-run 1 of 2 after round 1, re-run 2 of 2 after round 2.

## Output

Section mode: a working list of candidate questions, or `No gaps identified…`
per section. Full mode: section 8 populated with valid **Open-question
block**s, or `No new gaps` on a re-run.

## Exit condition

Every candidate either meets the four fields and appears in section 8, or is
dropped with none of the four fields missing left unexamined. No question
violates the re-run rules.

## If it fails

If a candidate cannot fill all four fields, it is not a gap: drop it. If you
cannot name the next-stage impact, the question is speculative: drop it. Never
pad the list to reach a count, and never invent an origin to justify a
question.

## Do not

- Do not raise a question without all four fields, an origin and a named impact.
- Do not answer your own question, nor re-ask one closed by force.
- Do not number a question out of sequence: `OQ-nn` runs in order, with no gaps and no reuse.
- Do not fill a quota.

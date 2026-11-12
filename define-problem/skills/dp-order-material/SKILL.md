---
name: dp-order-material
description: Flattens, numbers and classifies the input material into immutable numbered statements and section 1 of the document; loaded by define-problem, not invoked directly.
---

# dp-order-material

## Purpose

Turn the input material into one numbered statement per line, each citable by a
stable identifier, and classify every statement. Nothing in the material is
lost: each statement is classified or discarded with a reason. Every later
citation depends on this numbering, so it is written once and never changed.

## Inputs

- The input material in any format, converted to plain text or Markdown.
- `../../references/record-schema.md` for **Identifiers**, **Item lines**, **Classification categories (section 1)** and **Provenance marks**.

## Procedure

1. Flatten the material without interpreting it: one statement per line. Split only at sentence boundaries or at independent assertions. Do not reword, translate, summarize or correct — the literal text is the basis of every citation.
2. For a long input, work in chunks that follow the natural sections of the source, keeping a running counter. Write each chunk to `results/ctx00/intake.md` as soon as it is finished. Copy the source's headings as unnumbered context lines; they are not statements.
3. Number each statement and write the number into the file as `- STM-nn · <literal text>`. Numbers are sequential, in order of appearance, with no gaps. Past 99, use three digits.
4. Write the first line of `results/ctx00/intake.md` as `Total statements: N`, where N is the count of numbered statements.
5. Immutability: once numbering is finished, never edit `results/ctx00/intake.md`. Do not renumber, insert or correct anything. Anything the person says later goes to the feedback log with its own identifier, never into the intake. If the client delivers a corrected input, restart the stage on the new material.
6. Recount: read the file a second time and confirm the identifiers are consecutive, have no duplicates, and the last equals N. Then, for each section of the source, confirm its last sentence appears in a statement — a cheap check that nothing was dropped.
7. Classify each `STM-nn` in section 1 of `results/ctx00/problem-definition.md`: one category, or a discard with a reason, exactly once. Write each as a section 1 line of **Item lines**. A statement that names a solution is discarded as `discard: solution` and copied to section 7 as the next `SOL-nn` line (from 01, no gaps, no reuse) with its citation. A contiguous block with no substantive content may be discarded as a range on one line: `STM-nn to STM-nn · discard: noise`.

This sub-stage does not search for gaps. It raises an open question only for
material so ambiguous it cannot be classified without interpreting it; it never
invents structure the material does not have.

## Output

A numbered, immutable `results/ctx00/intake.md` with its `Total statements: N` line,
and section 1 of `results/ctx00/problem-definition.md` with every statement classified
or discarded.

## Exit condition

The number of statements in section 1 (expanding any range discard) equals N,
and `dp-verify-consistency` part A over section 1 is `GREEN`.

## If it fails

If the recount finds a gap, duplicate or a missing last sentence, the numbering
is wrong: rebuild `results/ctx00/intake.md` from the material before any other work
uses it. If a statement cannot be classified, raise one open question for it
rather than guessing a category. Never renumber a file that later sections have
already cited.

## Do not

- Do not reword, translate, summarize or correct a statement.
- Do not edit, renumber or insert into `results/ctx00/intake.md` once numbered.
- Do not drop a statement for not fitting a category.

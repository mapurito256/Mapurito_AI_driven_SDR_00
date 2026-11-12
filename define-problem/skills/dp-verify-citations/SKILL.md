---
name: dp-verify-citations
description: Verifies that every citation in the document is literal against the statement or source it points to; loaded by define-problem, not invoked directly.
---

# dp-verify-citations

## Purpose

Confirm that every citation in the document quotes exactly what it points to,
in the exact place it points to. This is the control that stops a reworded or
misplaced quote from passing as faithful.

## Inputs

- The part of `results/ctx00/problem-definition.md` in the verification scope (the sections just written, or the whole document at closure and in each feedback round).
- `results/ctx00/intake.md` for `STM-nn` statements.
- `results/ctx00/sources/SRC-nn.md` for `SRC-nn` quotes.
- Section 10 of the document for `FB-n/OQ-nn` answers.
- `../../references/record-schema.md` for **Citation grammar** and **Matching rule**.

## Procedure

1. Run this verification in a context independent from the one that wrote the sections when the environment offers subagents; otherwise run it in the same context, using the evidence table below, which forces re-reading instead of recalling.
2. List every citation inside the verification scope, in each of the four forms of **Citation grammar**.
3. For a quote of a statement (`"..." [cite: STM-nn]`): **copy** the full text of `STM-nn` from `results/ctx00/intake.md` into an evidence table — do not recall it — mark the quoted fragment inside the copied text, and apply the **Matching rule**. Record the verdict: literal, not literal, or nonexistent identifier. The quote must be inside the statement it cites, not merely somewhere in the intake.
4. For an anchor (`[cite: STM-nn]` with no text): check the identifier exists.
5. For a quote of a source (`"..." [cite: SRC-nn]`): copy the relevant text from `results/ctx00/sources/SRC-nn.md`, mark the fragment, and apply the **Matching rule**. The quote must be in that source's own file, not any other.
6. For a quote of an answer (`[cite: FB-n/OQ-nn]`): check the identifier exists in section 10 and the quoted text is in that answer.
7. Warning, does not block: list any line marked `[D]` that carries no citation at all.
8. Report `GREEN` or `FAIL` with the list of failed citations. One failed citation is `FAIL`; there is no partial green.

The evidence table lives in your working notes, never in the document. Only
the verdict enters the document, in section 10.

## Output

A `GREEN` or `FAIL` verdict recorded in section 10, with the failing citations
listed when `FAIL`, and the `[D]`-without-citation warnings.

## Exit condition

Every citation in scope has a verdict and the overall verdict is `GREEN`.

## If it fails

Correct the document: replace the quote with the literal text, change the
location to the statement or source that actually contains it, or withdraw the
assertion and re-mark it `[R]` or `[P]`. Never edit `results/ctx00/intake.md` and
never relax the **Matching rule** to make a citation pass. Re-run the same
verification. The orchestrator allows three correction attempts; if it still
fails, the document is presented with the failure stated at the top and the
person decides.

## Do not

- Do not recall a quote: copy it from the file into the evidence table.
- Do not edit `results/ctx00/intake.md` or relax the **Matching rule**.
- Do not report a partial `GREEN`.

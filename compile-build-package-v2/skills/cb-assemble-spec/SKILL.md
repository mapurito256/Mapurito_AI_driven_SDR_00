---
name: cb-assemble-spec
description: Runs 03.6 — assembles the implementation document (final-spec.md) from the Ctx 01 requirements, the Ctx 02 design and the Ctx 03 specification, with no new information, checks its fidelity to the sources by shell and runs the consumer test on the document alone; loaded by compile-build-package-v2 after 03.5 and at every reopening that changes an item, not invoked directly.
---

# cb-assemble-spec

## Objective

Give the builder one document to implement from: the requirements (Ctx 01), the
design solutions (Ctx 02) and the specification of the solutions, procedures and
parameters (Ctx 03), organised as `references/implementation-doc.md` fixes. The
document is assembled from the existing files; nothing is invented, interpreted or
rewritten. The problem, the scope and the objectives of Ctx 00 are not part of it.

## Inputs

`references/implementation-doc.md` (structure, exclusions, commands, fidelity
checks), `results/ctx01/requirements-baseline.json`,
`results/ctx02/architecture-baseline.json`, `results/ctx03/items.json`,
`results/ctx03/spec-register.json`, `results/ctx03/specs/`,
`results/ctx03/sources/` (only the header of a snapshot, for the datasheet line).

## Steps

1. **Preconditions.** Every `SPEC` is `done`, the locked-hardware hash equals
   `v1_locked_sha256`, and the budget has no `exceeds` row. Otherwise do not
   assemble; return to 03.5.
   ```
   jq -r '.specs[]|select(.status!="done")|.id' results/ctx03/spec-register.json
   jq -r '.budget[]|select(.mode=="final" and .verdict=="exceeds")|.id' results/ctx03/items.json
   ```
2. **Assemble the candidate** at `results/ctx03/validations/V2/R<n>/final-spec.md`
   (`R<n>` is the presentation of `state.json`), section by section in the order of
   `references/implementation-doc.md`: truncate the file, then append each section
   with the commands there. Write by hand only the headings, the front matter and the
   datasheet line of each `HW`. A requirement, limit, criterion, decision, parameter,
   module text or test is never retyped: it comes from a command. A reopened
   assembly rewrites the whole file, never patches it.
3. **Fidelity checks.** Run the checks of `references/implementation-doc.md`. Each
   line printed is a defect: correct the cause (the section command, or the source
   module if it carries process material in sections 1 to 8), rebuild the file and
   recheck once. A defect that remains is shown as a `FAIL` of G03-12, never hidden.
4. **Exclusion check (judgement).** Read the headings and the first lines of each
   section and confirm that it holds no problem statement, scope, objective,
   discarded alternative, criteria matrix, process id or "what the agent decided".
   Record any finding with its line.
5. **Consumer test.** Launch a subagent with a fresh context. It sees only the
   candidate file, not `results/ctx03/` or any other stage file, and is asked to list
   every question it would need answered to implement and verify the system from
   this document, marking each as one that needs a design decision or a mere
   clarification. Write each into `consumer_test` of `results/ctx03/items.json`. Each
   design-decision question is a gap: re-enter the owning module, then repeat steps 2
   and 3, or log it as a candidate question (`cb-gap-questions`). If the tool is
   unavailable, run `inline` and record `independent_pass: inline`, which is weaker.
6. **Record.** Write `results/ctx03/substages/03.6.md`: the candidate path and its
   `sha256sum`, the fidelity output (empty or the defects), the exclusion findings, the
   consumer-test table and the pass mode. The orchestrator emits `SUBSTAGE_END`.

## At approval and at every change

`cb-feedback-cycle` re-runs steps 2 and 3 on `APROBAR`. If the regenerated file is not
byte-identical (`cmp`) to the candidate the person reviewed, the approval is not
accepted: the new candidate is issued again under the same presentation and the
difference is listed in `integration.md`. Any module, item or `dispositions` change
after 03.6 requires re-running this skill from step 2.

## Output format

`results/ctx03/validations/V2/R<n>/final-spec.md`, `consumer_test` in
`results/ctx03/items.json`, `results/ctx03/substages/03.6.md`. The result is the
evidence of G03-11 and G03-12 in `cb-gate-check`.

## Do not

- Do not add, reword, summarise, reorder or "improve" any source text or value; fix
  a defect in its source, never in the document.
- Do not include the problem, scope, objectives, discarded alternatives, criteria
  matrices, questions, gates, rounds or forced-closure commentary.
- Do not write a script file; run each command as a shell one-liner appended to the
  candidate.
- Do not let the consumer test read anything but the candidate.
- Do not load any fixture or example dataset.

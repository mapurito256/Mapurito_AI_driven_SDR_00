---
name: cb-admit-analyze
description: Reads the Ctx 02, Ctx 01 and Ctx 00 outputs in order, runs the mechanical admission checks with shell commands, analyses what must be specified, writes a disposition for every REQ, LIM, AC and DFR, and builds the specification register that orders the modules; loaded by compile-build-package-v2 at 03.1, not invoked directly.
---

# cb-admit-analyze

## Objective

Admit the upstream results read-only, prove with shell that they are the approved
ones, and turn them into a written, ordered list of everything Ctx 03 must
specify, so the work proceeds one module at a time and related procedures are
known before any is written. Nothing upstream is modified (invariant 4) or
dropped silently (invariant 5).

## Steps

1. **Read in this order**: `results/ctx02/CONTEXT-ctx02.md`;
   `results/ctx02/architecture-baseline.json`; `results/ctx02/final-design.md`;
   `results/ctx01/CONTEXT-ctx01.md`; `results/ctx01/requirements-baseline.json`
   (text, limits, acceptance criteria and deferrals: Ctx 02 cites them by id only);
   `results/ctx01/record.json` (provenance, consultation only);
   `results/ctx00/problem-definition.md` (scope section 5, environment section 4,
   registered solution suggestions section 7, assumptions section 9);
   `results/ctx02/sources/SRC-02-nn.md` for the SDR and board snapshots.
2. **Shell checks** (record each result; no script):
   ```
   jq 'keys' results/ctx02/architecture-baseline.json            # learn the shape first
   jq 'keys' results/ctx01/requirements-baseline.json
   jq -r '.status' results/ctx02/architecture-baseline.json
   jq -r '.status' results/ctx01/requirements-baseline.json
   sha256sum -c results/ctx02/architecture-baseline.sha256
   sha256sum -c results/ctx01/requirements-baseline.sha256
   test -s results/ctx00/problem-definition.md && sha256sum results/ctx00/problem-definition.md
   grep -n -i 'open question' results/ctx00/problem-definition.md   # read section 8 by eye
   jq -r '.items[] | select(.type=="REQ" or .type=="LIM" or .type=="AC" or .type=="DFR") | .id' results/ctx01/requirements-baseline.json
   jq -r '.items[] | select(.type=="DEC" or .type=="CMP" or .type=="DEP") | "\(.type) \(.id)"' results/ctx02/architecture-baseline.json
   ```
   If a baseline shape differs from `.items[]`, adapt the `jq` path and record the
   shape found. Both statuses must be `frozen` or `approved`; both `sha256sum -c`
   must say `OK`; section 8 of the Ctx 00 document must hold no open question. A
   check that cannot be evaluated is `NOT_EVALUABLE`, never a pass.
3. **On failure** do not start. A Ctx 02 baseline that is not approved or whose
   hash differs: `ESCALATION` `R2`. The same for Ctx 01: `R1`. An open question in
   Ctx 00: `R0`. Set `status: returned_upstream` and hand to `cb-feedback-cycle`
   for `results/ctx03/CONTEXT-ctx03.md`.
4. **On success** create `results/ctx03/` as in `references/records.md`, write
   `results/ctx03/state.json` with the input hashes, `status: running`,
   `phase: A`, `V1`/`V2` counters at zero, and emit `STAGE_START`.
5. **Inventory.** Write down, from the files read: every `REQ` (functional,
   non-functional, restriction) with its `AC`; every `LIM`; every `DFR` with its
   `etapa_responsable`; every Ctx 02 `DEC` by class, every `CMP` by `realization`,
   every `CMP` with `range: TBD-Ctx03` and its `closure_criterion`; the Ctx 02
   "travels open" list and forced closures; every `unverified` cell or statement
   in Ctx 02 (for example the board's maximum operating temperature, the board's
   compute load). Each unverified point becomes `OP-nn` in `open_points` of
   `results/ctx03/items.json`.
6. **Disposition.** For each `REQ`, `LIM`, `AC` and `DFR` write into
   `dispositions` one code from `item-schema.md` (`specify`, `hardware`,
   `already-closed`, `not-applicable`) and a one-line reason that quotes the
   statement. `specify` means a value, procedure, schema or test must be written;
   `hardware` means it is met by a reference chosen in 03.2; `already-closed`
   means Ctx 02 already fixed it fully and no Ctx 03 value remains;
   `not-applicable` needs a reason and, if it touches a mandatory item, a question.
7. **Group into modules.** Using `references/spec-classes.md`, create one `SPEC`
   per solution: one per Ctx 02 decision instance of a class, one per software
   `CMP`, one per group of non-functional `REQ`, one `hardware` spec per component
   group, and exactly one `test` spec. Merge two candidates only if they share
   parameters; write the reason in `grouping_notes`. A class no input touches is
   `not-applicable`. Each `SPEC` records `closes` (never empty), `ctx02_refs`.
8. **Relate the modules.** For each `SPEC` list in `depends_on` the specs whose
   output it consumes, with a reason in `dep_reasons` (for example a procedure
   that verifies another procedure's result; an estimator whose frame period a
   detector uses; every spec feeds the `test` spec). Phase `A` for `hardware`,
   `B` for the rest. Compute the order and write `order`:
   ```
   jq -r '.specs[]|.id as $i|(.depends_on[]?|"\(.) \($i)"), "\($i) \($i)"' results/ctx03/spec-register.json | tsort
   ```
   A `tsort` error means a cycle: merge the specs that form it into one and record
   the reason. Set every `status` to `pending`.
9. **Candidates.** List each solution named in Ctx 00 section 7 as a candidate
   alternative of its matching `SPEC`, never as a decision.
10. Write `results/ctx03/substages/03.1.md`: input summary, check results, the
    inventory, the disposition table, the register as a table (id, title, kind,
    phase, closes, depends on, order), the open points, the candidates. Emit
    `REGISTER_ISSUED`. Then hand to `cb-gap-questions` (`input`).

## Output format

`results/ctx03/state.json`, `results/ctx03/items.json` (`dispositions`,
`open_points`, `dfr`), `results/ctx03/spec-register.json`,
`results/ctx03/substages/03.1.md`, events `STAGE_START`, `REGISTER_ISSUED` (or
`ESCALATION`).

## Do not

- Do not modify any Ctx 00, Ctx 01 or Ctx 02 file or item.
- Do not judge whether the frozen content is complete; a content defect returns
  upstream with the right code.
- Do not leave a `REQ`, `LIM`, `AC` or `DFR` without a disposition, or a
  `specify` item outside every `SPEC`.
- Do not specify anything here: this step only analyses and orders.
- Do not treat a Ctx 00 suggested solution as decided.
- Do not load any fixture or example dataset.

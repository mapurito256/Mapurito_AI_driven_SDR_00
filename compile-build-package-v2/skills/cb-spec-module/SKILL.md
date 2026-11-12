---
name: cb-spec-module
description: Drives the 03.3 module loop — takes the next specification from the register, builds its input pack, routes it to the kind skill, runs the self-check, records the module and moves on only when it is done; loaded by compile-build-package-v2 after V1 approval and at every reopening, not invoked directly.
---

# cb-spec-module

## Objective

Specify the solutions one at a time. A module is finished, self-checked and
recorded before the next one starts, so the agent never works from context memory:
each module starts from files and ends in files.

## Inputs

`results/ctx03/spec-register.json` (`order`, `status`), `results/ctx03/items.json`,
`results/ctx03/state.json`, the admitted Ctx 01 and Ctx 02 files, and
`references/module-template.md`, `references/parameter-rules.md`,
`references/spec-classes.md`, `references/item-schema.md`.

## Loop (repeat until no module of phase B kinds `algorithm`, `procedure`, `interface`, `nfr` is pending or reopened)

1. **Pick the module.** The first `SPEC` in `order` whose `status` is `pending` or
   `reopened` and whose `depends_on` are all `done`:
   ```
   jq -r '.order[]' results/ctx03/spec-register.json
   jq -r '.specs[] | select(.status!="done") | "\(.id) \(.status) \(.depends_on|join(","))"' results/ctx03/spec-register.json
   ```
   Set `status: in-progress`, `current_spec` in `results/ctx03/state.json`, and
   emit `SPEC_START`. If no module qualifies while one is pending, a dependency is
   missing: fix the register (record it) before going on.
2. **Input pack.** Read only: the `closes` items with their literal text from the
   Ctx 01 baseline (`jq` by id); the `ctx02_refs` items; section 10 (digest) of each
   dependency's file; the `PAR`, `SCH` and `HW` items the module uses (`jq` by id);
   the budget rows that apply; the candidates of Ctx 00 section 7. Do not re-read
   modules that are not dependencies.
3. **Route by kind**, loading one skill: `algorithm` → `cb-spec-algorithm`,
   `procedure` → `cb-spec-procedure`, `interface` → `cb-spec-interface`,
   `nfr` → `cb-spec-nfr`. The kind skill fills `results/ctx03/specs/SPEC-nn.md`
   from `references/module-template.md` and adds its items to `results/ctx03/items.json`.
   A reopened module keeps its ids and edits by id.
4. **Alternatives and questions.** A choice with two plausible alternatives uses the
   comparison method of `cb-hardware-options` (criteria file saved first, at most
   two alternatives or a dominance statement) and becomes a `DEC` of class
   `design-choice`. A choice that belongs to the human is logged as a candidate in
   `candidates` of `results/ctx03/questions.json` with its `provisional` value (the
   cheapest option by `references/parameter-rules.md`); the module proceeds with it.
   Do not stop the loop to ask.
5. **Self-check.** All must hold, or correct once and recheck:
   ```
   # every id the module closes appears in its file
   for i in $(jq -r --arg s SPEC-nn '.specs[]|select(.id==$s)|.closes[]' results/ctx03/spec-register.json); do grep -q "$i" results/ctx03/specs/SPEC-nn.md || echo "missing $i"; done
   # its parameters are complete
   jq -r --arg s SPEC-nn '.items[]|select(.type=="PAR" and .spec==$s)|select(.value==null or .unit==null or .range==null or .rationale==null or .sensitivity==null or ((.reqs|length)==0))|.id' results/ctx03/items.json
   # no placeholder text
   grep -nwiE 'TBD|TODO|to be defined' results/ctx03/specs/SPEC-nn.md
   # no executable code block
   grep -nE '^[`]{3}(python|bash|sh|c|cpp|rust|js|javascript)' results/ctx03/specs/SPEC-nn.md
   ```
   (replace `SPEC-nn` by the module id; each command should print nothing.) By
   reading: requirement text and values are copied in, not referenced; every
   parameter that uses compute, memory, storage, throughput, thermal, power, RF level
   or time has a budget row; units agree with the dependencies' digests; the digest
   (section 10) is written and at most 15 lines; the module decided nothing outside
   its `closes`. A need that belongs to another module or to Ctx 02 is a question
   or an escalation, not a silent change.
6. **Record.** Set `status: done`, `file` in the register; update
   `register_progress` and clear `current_spec` in `results/ctx03/state.json`; emit
   `SPEC_DONE` with the ids written and the provisional questions. Write the file
   first, then the event.
7. **Go back to step 1.** Do not start the next module before step 6 of this one.
8. When none remains, return to the orchestrator, which emits `SUBSTAGE_END` for
   `03.3`.

## Reopening

After feedback, `cb-feedback-cycle` sets the affected modules to `reopened`, and
their dependants (reverse `depends_on`) as well when an exported parameter or
schema changed. Run the loop again in `order`; a dependant whose inputs did not
change is closed with a one-line `no-op-confirmed` note in section 9.

## Output format

`results/ctx03/specs/SPEC-nn.md`, updates to `results/ctx03/items.json`,
`results/ctx03/spec-register.json`, `results/ctx03/state.json`, `candidates` in
`results/ctx03/questions.json`, events `SPEC_START`, `SPEC_DONE`.

## Do not

- Do not start a module before the previous one is `done`, or skip one.
- Do not leave a module half-written: complete it with a `provisional` value or
  escalate.
- Do not change the architecture, a requirement or an approved hardware item; that
  is `escalate:R2`, `R1` or `V1`.
- Do not load more than one kind skill at a time or modules that are not
  dependencies.
- Do not load any fixture or example dataset.

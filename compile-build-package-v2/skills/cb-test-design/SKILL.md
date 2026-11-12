---
name: cb-test-design
description: Designs the tests of 03.4 starting from the acceptance criteria — one test per criterion with identical threshold, operator and unit, three cases, vectors and a stated failure — plus hardware-qualification tests for unverified budgets and open points, and procedure tests; loaded by compile-build-package-v2 after the module loop, not invoked directly.
---

# cb-test-design

## Objective

Make every requirement verifiable by a builder who has the package alone. Tests
start from the acceptance criteria and never relax or harden them. This module is
the register entry of kind `test`; it works through the criteria one at a time and
records progress in its file, so it can resume after an interruption.

## Inputs

All `AC` of `results/ctx01/requirements-baseline.json`, the `PAR`, `PRC`, `SCH`,
`ERR` items, the digests of the modules, the budget rows and open points,
`references/item-schema.md` (the `TST` shape), `references/module-template.md`.

## Steps

1. **List the work.** Write at the top of the module file one checklist line per
   `AC` and per `unverified` budget row or open point, then clear them one by one.
   ```
   jq -r '.items[]|select(.type=="AC")|.id' results/ctx01/requirements-baseline.json
   jq -r '.budget[]|select(.verdict=="unverified")|.id' results/ctx03/items.json
   jq -r '.open_points[]|select(.state=="open")|.id' results/ctx03/items.json
   ```
2. **Acceptance test per criterion.** For each `AC` write exactly one `TST` of level
   `acceptance`: `for_ac`, `for_req`, and `metrica`, `operador`, `umbral`, `unidad`,
   `condicion`, `method` identical to the `AC`. If the `AC` threshold is deferred
   (`{dfr, horquilla}`), the test carries the closed `PAR` value, cites the `DFR`
   and the `PAR` id, and the value must lie inside `horquilla`. A `TST` never
   changes the operator, the number or the unit.
3. **Cases.** Each acceptance test has three cases: `nominal` (inside the normal
   operating condition), `error` (a defined failure from an `ERR`, expected response
   and code), `edge` (at or next to the threshold or a range end of a `PAR`). Input
   and expected result have units.
4. **Vectors.** Define each stimulus precisely enough to reproduce it (signal
   definition, level, frequency, duration, noise condition) from the module
   parameters. Give the expected output by written arithmetic when it is derivable;
   otherwise give a generation rule and a tolerance derived from the `AC` error
   budget. Never write a measured result.
5. **`fails_if`.** One line per test: the defect this test would catch (for
   example a wrong window length, a threshold applied in the wrong unit, a retry
   count off by one). A test that could pass whatever the defect is rejected.
6. **Procedure.** When a procedure of a module executes the test, set `procedure`
   to its `PRC`; the test does not restate its steps.
7. **Additional tests, with `for_ac: null`** and `for_req` set:
   - `hardware-qualification`: one for each `unverified` budget row and each open
     point (for example sustained compute load and board temperature under the
     longest sweep and the highest frame rate): the measurement, the threshold taken
     from the budget or the cited limit with its margin, the duration and the
     condition.
   - `procedure`: one for each calibration, verification or reproducibility
     procedure: the acceptance rule of the `PRC` as a pass rule.
   - `unit` and `integration`: for each `SCH` boundary, the check that a
     conforming record is accepted and a non-conforming one produces the `ERR`
     code, and for each module a unit case from its worked check.
8. **Trace.** Every `TST` cites a `REQ` or `LIM`. Every `REQ` and `LIM` marked
   `specify` ends covered by at least one `TST` or by a recorded reason
   (`inspection`, `analysis`) in section 9.
9. Write items into `results/ctx03/items.json`, the module file
   `results/ctx03/specs/SPEC-nn.md` (checklist cleared, test table, digest), and
   mark it `done` through `cb-spec-module` steps 5 and 6.

## Output format

`TST` items, the test module file. Evidence for G03-8.

## Do not

- Do not relax or harden an `AC`; do not change its operator, number or unit.
- Do not write more than one acceptance `TST` for an `AC` or none.
- Do not include measured results or executable test code.
- Do not leave a test without its three cases (acceptance) and its `fails_if`.
- Do not load any fixture or example dataset.

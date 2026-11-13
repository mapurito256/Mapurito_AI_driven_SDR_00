# implementation-doc.md — the implementation document (`final-spec.md`)

The product of Ctx 03 is one document the builder uses as the reference to
implement the system. It is **assembled, not written**: every sentence, table row
and value comes from the Ctx 01 requirements baseline, the Ctx 02 architecture
baseline or the Ctx 03 items and modules. The assembly adds no information, no
reinterpretation and no new id. Empty template only; no worked example and no case
value appears here.

## What the document is, and is not

It is the implementation contract: requirements (what must be met), design (the
solution decided), hardware and resources, the specification of each solution
(methods, parameters, procedures, schemas, errors), the tests that verify it, and
the trace between them.

It never contains:

- the problem, the scope, the objectives or the statements of Ctx 00 (the scope is
  already carried by the requirements and their solutions);
- discarded alternatives, criteria matrices (`criteria`, `cells`, `dominance`,
  `alternatives` other than the chosen one) or datasheet comparison tables;
- process material: questions (`Q-`), themes (`T-`), gates (`G0`), rounds,
  presentations, feedback, forced closures, "what the agent decided", `cita`
  fields, `SRC-` ids, `STM-` ids, events, `STATUS`;
- the module digest (section 10 of a module) and the module section 9 (decisions,
  provisional values and questions);
- executable code, measured results, `TBD`, or a remission ("see the decision")
  instead of a value.

Provenance (`declarado`, `derivado`, `propuesto`) stays only as a column of the
parameter tables, because the builder needs to know which values are fixed by a
source and which were chosen.

## Language and conventions

English. Ids are kept exactly (`REQ-`, `LIM-`, `AC-`, `DFR-`, `CMP-`, `DEC-`,
`DEP-`, `HW-`, `SPEC-`, `PAR-`, `PRC-`, `SCH-`, `ERR-`, `TST-`, `RB-`, `OP-`) so
the builder can trace across sections. Every value carries its unit. A table cell
never contains a raw `|` or a line break: pass every text field through the filter
`e` below.

```
def e: (. // "") | tostring | gsub("\\|"; "\\|") | gsub("\n"; " ");
```

Put that definition at the start of each `jq` program that writes a table. Append
every section with `>>` to the candidate file, in order. Only the headings, the
front matter and the datasheet line of each `HW` are written by the agent; the
rest is produced by the commands here. `C` is the candidate path
`results/ctx03/validations/V2/R<n>/final-spec.md`.

## Section map

Sections and their order are fixed. An empty list reads `none`.

### 0. Front matter (agent-written, from files)

Title; a line with the requirements baseline hash and the architecture baseline
hash (`cut -d' ' -f1 results/ctx01/requirements-baseline.sha256`, same for Ctx 02);
the id families and which stage each comes from (requirements, design,
specification); the section list. The Ctx 03 baseline hash is not written here (it
would be circular); it is in `results/ctx03/CONTEXT-ctx03.md`.

### 1. Requirements — source `results/ctx01/requirements-baseline.json`

1.1 Functional requirements, 1.2 non-functional requirements, 1.3 restrictions:
`REQ` by `subtype` (`funcional`, `no-funcional`, `restriction`), literal `text`,
with `valor`, `unidad`, `operador` when present.

```
jq -r 'def e: (. // "")|tostring|gsub("\\|";"\\|")|gsub("\n";" "); .items[]|select(.type=="REQ" and .subtype=="funcional")|"- **\(.id)** — \(.text|e)\(if .valor then " [\(.operador) \(.valor) \(.unidad)]" else "" end)"' results/ctx01/requirements-baseline.json
```

(change `funcional` to `no-funcional` and `restriction` for 1.2 and 1.3).

1.4 Limits: `LIM` as `magnitud operador valor unidad`.

```
jq -r 'def e: (. // "")|tostring|gsub("\\|";"\\|"); .items[]|select(.type=="LIM")|"| \(.id) | \(.subtype) | \(.magnitud|e) | \(.operador) | \(.valor) | \(.unidad) |"' results/ctx01/requirements-baseline.json
```

1.5 Acceptance criteria: `AC` with metric, operator, threshold, unit, method and
condition. A threshold deferred by a `DFR` (`{dfr, horquilla}`) is written as the
**closed value** of its `PAR` (from `dfr` and the items of `results/ctx03/items.json`),
with the `DFR` and `PAR` ids; a `DFR` that travels intact keeps its window.

```
jq -r --slurpfile t results/ctx03/items.json 'def e: (. // "")|tostring|gsub("\\|";"\\|")|gsub("\n";" "); ($t[0].dfr|map({(.dfr_id):.action})|add) as $cl | ($t[0].items|map({(.id):.})|add) as $it | .items[]|select(.type=="AC")|(if (.umbral|type)=="object" then (.umbral.dfr as $d | if (($cl[$d]//"")|startswith("PAR")) then "\($it[$cl[$d]].value) (\($d) closed by \($cl[$d]))" else "deferred to implementation, window \(.umbral.horquilla|e) (\($d))" end) else (.umbral|tostring) end) as $th | "| \(.id) | \(.for_req) | \(.metrica|e) | \(.operador) | \($th) | \(.unidad) | \(.metodo) | \(.condicion|e) |"' results/ctx01/requirements-baseline.json
```

1.6 Deferrals: every `DFR` with governing requirement, responsible stage, closure
criterion, window and state; those closed in Ctx 02 or Ctx 03 name the closing
`DEC` or `PAR` (`dfr` list of `results/ctx03/items.json`).

### 2. Design — source `results/ctx02/architecture-baseline.json` and `design-choice` `DEC` of `results/ctx03/items.json`

2.1 Components: `CMP` with `name`, `function`, `chain_position`, `realization`,
`reqs`, `characteristics`, `range` (a `TBD-Ctx03` range is replaced by the closing
`PAR` or `HW` of `tbd_closure`) and `integration_note`.
2.2 Dependencies and implementation order: each `DEP` as `from → to` with its
reason, then the implementation order (the `plan` of Ctx 02; the `order` of the
register for the specifications, section 4).
2.3 Design decisions: each `DEC` of Ctx 02 and each `design-choice` `DEC` of
Ctx 03, one block: `question`, the **chosen option** (its `summary`), `reqs`, and
the basis: `needed_reason` when present, otherwise the `reason` of the cells of the
chosen alternative joined. Never the other alternatives, `criteria`, `dominance`
or `robustness`.

```
jq -r 'def e: (. // "")|tostring|gsub("\\|";"\\|")|gsub("\n";" "); .items[]|select(.type=="DEC")|.chosen as $c | "- **\(.id)** — \(.question|e) → **\((.alternatives // [])|map(select(.id==$c))|.[0].summary // $c|e)**; serves \(.reqs|join(", ")); basis: \(.needed_reason // ([.cells[]?|select(.alternative==$c)|.reason]|join("; "))|e)"' results/ctx02/architecture-baseline.json
```

(run again on `results/ctx03/items.json` filtering `.class=="design-choice"`).

### 3. Hardware and resources — source `results/ctx03/items.json`

3.1 Hardware by component: each `HW` with `cmp`, `category`, manufacturer and
model, `characteristics` (name, value, unit) and `interfaces`. The reference of a
`HW` cites a snapshot `SRC-03-nn`: replace it with the datasheet URL and access
date read from the header of `results/ctx03/sources/SRC-03-nn.md` (the one line the
agent writes by hand; no `SRC-` id remains in the document).
3.2 Compatibility between neighbours: the `interfaces` of each pair, from the `HW`
items.
3.3 Resource budget: the final `budget` rows (`RB`), resource, demand with its
formula, capacity with its unit, margin, verdict.

```
jq -r 'def e: (. // "")|tostring|gsub("\\|";"\\|")|gsub("\n";" "); .budget[]|select(.mode=="final")|"| \(.id) | \(.resource) | \(.demand.formula|e) = \(.demand.value) \(.demand.unit) | \(.capacity.value) \(.capacity.unit) | \(.margin_rule|e) | \(.margin_actual)% | \(.verdict) |"' results/ctx03/items.json
```

3.4 Open points `OP` still open, each with its hardware-qualification test.

### 4. Specification of the solutions — source `results/ctx03/specs/SPEC-nn.md`

4.0 Index: each `SPEC` in `order` of `results/ctx03/spec-register.json` with title,
kind and the ids it closes. 4.k one subsection per `SPEC`, in `order`. Each takes
the module file from the `Kind:` line down to the end of its section 8, drops the
status text, drops sections 9 and 10, and demotes the headings:

```
printf '### 4.%s %s\n' <k> "$(sed -n '1s/^# //p' results/ctx03/specs/SPEC-nn.md)" >> C
sed -n '2,3p' results/ctx03/specs/SPEC-nn.md | sed 's/ · Status: [a-z-]*//; s/$/  /' >> C; echo >> C
sed -n '/^## 1\. /,/^## 9\. /p' results/ctx03/specs/SPEC-nn.md | sed '$d' | sed 's/^## /#### /' >> C
```

This is why questions and provisional markers may appear only in sections 9 and 10
of a module (`module-template.md`): sections 1 to 8 are copied verbatim.

### 5. Catalogs — source `results/ctx03/items.json`

For lookup, rendered from the items so they equal the modules: 5.1 parameters (all
`PAR`: id, spec, name, value, unit, range, critical, provenance), 5.2 schemas (each
`SCH`: name, version, producer, consumer, format, fields with type, unit, range,
required and meaning, compatibility rule, limits, retention), 5.3 procedures (each
`PRC`: purpose, executor, trigger, preconditions, ordered steps with `pars` and
expected result, duration, acceptance, outputs, failure exits, reproducibility),
5.4 error codes (each `ERR`: code, condition, detection, response, retries, limits,
final state, report schema).

```
jq -r 'def e: (. // "")|tostring|gsub("\\|";"\\|")|gsub("\n";" "); .items[]|select(.type=="PAR")|"| \(.id) | \(.spec) | \(.name|e) | \(.value) | \(.unit) | \(.range.min)–\(.range.max) \(.range.unit) | \(.critical) | \(.procedencia) |"' results/ctx03/items.json
```

### 6. Verification — source `results/ctx03/items.json`

6.1 Acceptance tests: one `TST` per `AC`, with the threshold written side by side
with the `AC` (operator, value, unit), condition, method, the three cases
(nominal, error, edge) with input and expected result, vectors, `fails_if` and the
executing `PRC`. 6.2 Hardware-qualification and procedure tests (`for_ac: null`)
with `for_req`.

### 7. Traceability — source `items.json` lists and the register

7.1 Matrix `REQ`/`LIM` → `AC` → `SPEC` → `PAR`/`PRC`/`SCH`/`ERR` → `TST`: one row
per upstream id, from `dispositions`, `closes`, `reqs`, `for_req` and `for_ac`.
7.2 Closure of the `TBD-Ctx03` ranges (`tbd_closure`). 7.3 Closure of the
deferrals (`dfr`): the closing `PAR` and its value, and those that travel to
implementation.

### 8. Contract with the implementer — source `items.json` lists

8.1 Left to the implementer: `defer:build` items of the approved integrations
(coding details only), `DFR` of stage `implementation` with their window and
closure criterion, `OP` still open. 8.2 Not to be built: `beyond_mvp` entries.

## Fidelity checks (G03-12, shell)

Run on the candidate `C`; every command must print nothing.

```
# every id of the source families appears in the document
for i in $(jq -r '.items[]|select(.type=="REQ" or .type=="LIM" or .type=="AC" or .type=="DFR")|.id' results/ctx01/requirements-baseline.json) $(jq -r '.items[]|select(.type=="CMP" or .type=="DEC" or .type=="DEP")|.id' results/ctx02/architecture-baseline.json) $(jq -r '.items[]|select(.type=="HW" or .type=="PAR" or .type=="PRC" or .type=="SCH" or .type=="ERR" or .type=="TST")|.id' results/ctx03/items.json) $(jq -r '.order[]' results/ctx03/spec-register.json); do grep -q "$i" C || echo "missing $i"; done
# every PAR value written in its table row equals the item
jq -r '.items[]|select(.type=="PAR")|"| \(.id) | \(.spec) | \(.name) | \(.value) | \(.unit) |"' results/ctx03/items.json | while IFS= read -r l; do grep -qF -- "${l% |}" C || echo "differs: ${l:0:40}"; done
# no process material, placeholders or code
grep -nE '(Q|T)-0?[0-9]+|G0[0-9]-[0-9]+|SRC-[0-9]|STM-[0-9]|APROBAR|AJUSTAR|CERRAR_FORZADO' C
grep -nwiE 'TBD|TODO|to be defined' C
grep -nE '^[`]{3}(python|bash|sh|c|cpp|rust|js|javascript)' C
# no problem or scope section
grep -nE '^#+ .*(Problem|Scope|Objectives)' C
```

A line printed by the id loop or the `PAR` loop is a `FAIL` (the document differs
from its source). A line printed by the `grep` checks is judged: an id-shaped token
inside a copied requirement or module text is a false positive only if it is not a
process id. The judgement part (consumer test by a subagent, and the check that no
problem, scope or discarded alternative was written in) is in `cb-assemble-spec`.

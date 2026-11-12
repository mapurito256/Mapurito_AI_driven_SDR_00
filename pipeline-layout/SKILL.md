---
name: pipeline-layout
description: Single reference for where the four stage skills (define-problem, specify-requirements, resolve-architecture-v2, compile-build-package-v2) write and read results — the results/ tree, the path mapping and the path and hash rules.
---

# pipeline-layout — result paths

All results live under `results/` at the root, flat, with no `output` subfolder.
The method's own catalog lives beside this skill: `pipeline-layout/guardrails.md`.

```
results/ctx00/  state.json, events.jsonl, intake.md, sources/SRC-nn.md, problem-definition.md,
                problem-baseline.json, problem-baseline.sha256, CONTEXT-ctx00.md
results/ctx01/  record.json, state.json, events.jsonl, rounds/O<n>/…,
                requirements-baseline.json, requirements-baseline.sha256, CONTEXT-ctx01.md
results/ctx02/  state.json, events.jsonl, questions.json, items.json, sources/SRC-02-nn.md,
                substages/, validations/, architecture-baseline.json,
                architecture-baseline.sha256, final-design.md, CONTEXT-ctx02.md
results/ctx03/  state.json, STATUS.md, events.jsonl, questions.json, items.json, spec-register.json,
                sources/SRC-03-nn.md, substages/, specs/SPEC-nn.md, validations/,
                build-package-baseline.json, build-package-baseline.sha256,
                build-package-baseline.md, final-spec.md, CONTEXT-ctx03.md
```

Ctx03 is the skill `compile-build-package-v2`. The older `compile-build-package/` folder
(code-driven, "decides nothing") is superseded and is not used by the pipeline.

## Mapping (old → new)

| Stage | Old location | New |
|---|---|---|
| Ctx00 | any file in the old `output` folder (`X`) | `results/ctx00/X` |
| Ctx01 | the `upstream` copy of `problem-baseline.json` (no copy any more; `upstream` removed) | `results/ctx00/problem-baseline.json` |
| Ctx01 | bare `record.json`, `state.json`, `events.jsonl`, `rounds` | `results/ctx01/…` |
| Ctx01 | `requirements-baseline.json`, `CONTEXT-ctx01.md` in the old `output` folder | `results/ctx01/…` |
| Ctx02 | the old `stages` run folder of Ctx02 and bare `items.json`, `state.json`, `substages`, `validations`, `sources` | `results/ctx02/…` |
| Ctx02 | `architecture-baseline.json`, `final-design.md` in the old `output` folder | `results/ctx02/…` |
| Ctx02 reads Ctx01 | `requirements-baseline.json` in the old Ctx01 `baseline` folder | `results/ctx01/requirements-baseline.json` |
| Ctx02 reads Ctx01 | old Ctx01 `items.json`, `questions.json` | `results/ctx01/record.json` |
| Ctx02 reads Ctx01 | `CONTEXT-ctx01.md` (root) | `results/ctx01/CONTEXT-ctx01.md` |
| Ctx02 reads Ctx00 | `problem-definition.md`, `sources` in the old `output` folder | `results/ctx00/…` |
| Ctx03 reads Ctx02 | `architecture-baseline.json`, `final-design.md`, `CONTEXT-ctx02.md`, `sources/SRC-02-nn.md` | `results/ctx02/…` |
| Ctx03 reads Ctx01 | `requirements-baseline.json`, `record.json`, `CONTEXT-ctx01.md` (text, limits, `AC`, `DFR` cited by id from Ctx02) | `results/ctx01/…` |
| Ctx03 reads Ctx00 | `problem-definition.md`, `sources` | `results/ctx00/…` |

## Rules

1. Every result path is written in full from the root (`results/ctxNN/…`), including in
   `jq`, `sha256sum`, `grep` and `tsort` commands. Commands run from the root.
2. Each stage writes only to its own `results/ctxNN/`; everything from earlier stages is
   read-only.
3. Each admission reads `results/ctx<NN-1>/CONTEXT-ctx<NN-1>.md` first, then the other
   files in the order it already had. Ctx01 follows the reading order of
   `CONTEXT-ctx00.md` (context, JSON, `intake.md`, `sources/`) and verifies `cita`
   against `results/ctx00/intake.md` and `results/ctx00/sources/`. Each CONTEXT file
   lists the path and sha256 of what it hands over.
4. Hash = `sha256sum` of the whole file, stored in a sibling `.sha256` file; no JSON
   carries its own hash.
   - Ctx01 admits with `sha256sum -c results/ctx00/problem-baseline.sha256`;
     `record.json.upstream_baseline_hash` is that hash; on freeze it writes
     `results/ctx01/requirements-baseline.sha256`.
   - Ctx02 admits and checks G02-1 with `sha256sum -c results/ctx01/requirements-baseline.sha256`;
     on approval it writes `results/ctx02/architecture-baseline.sha256`.
   - Ctx03 admits and checks G03-1 with `sha256sum -c results/ctx02/architecture-baseline.sha256`
     and `sha256sum -c results/ctx01/requirements-baseline.sha256`; on approval it writes
     `results/ctx03/build-package-baseline.sha256`.
5. Path fields inside schemas and templates (`document.path`, `intake.path`,
   `snapshot_file`, `snapshot:`, CONTEXT templates) use these paths.
6. Guardrails: `pipeline-layout/guardrails.md` is read by Ctx01 only; Ctx02 inherits them through its
   upstream-immutability invariant.

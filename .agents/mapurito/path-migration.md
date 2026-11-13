# Next-phase path and version inventory

The current `layout.json` only supports the development same-root layout. This
inventory prepares relocation; it does not activate another mapping or create a
versioned installation. Do not make an in-progress run follow a changed mapping.

| Surface | Current root assumption | Required before a versioned copy works |
|---|---|---|
| Entry and common contracts | `.agents/` at project root; method `AGENTS.md` at root | Resolve the selected version's method root and keep common-contract location explicit. |
| `AGENTS.md` stage entry links | `define-problem/`, `specify-requirements/`, `resolve-architecture-v2/`, `compile-build-package-v2/` | Route each entry under the selected method root without changing stage internals. |
| `pipeline-layout/SKILL.md` and guardrails | Method files next to stage folders | Preserve local method-relative guardrails; output paths remain project-relative. |
| Stage `skills/` and `references/` | Relative to stage entry or subskill | Preserve the entire internal tree and resolve relative to the file, not the project cwd. |
| ctx01 guardrail reads/hash/citations | Literal `pipeline-layout/guardrails.md` in orchestrator, drafting/gap/gate skills and record/templates | Inventory exact runtime references, adapt the method-owned prefix, and preserve the actual catalog hash. |
| Handoff/schema source paths | Literal project-relative `results/ctxNN/...` and source snapshot fields | Keep paths resolvable from project root; no copying frozen outputs into method directories. |
| `.sha256` lines | Result paths interpreted from project root | Preserve the verified base directory or explicitly migrate with human-controlled provenance; never just rehash to hide a mismatch. |
| Native protection profiles | Current stage source directories are named; future `.mapurito/` is also protected | Protect the entire selected version and adapter contracts; regenerate/test exact profile paths after relocation. |
| Run identity/version | No release version; only stage input hashes are recorded | Define a run-binding record without violating stage ownership or adding closed event types. Pin the entry adapter and methodology together. |

Before implementing the relocation, enumerate exact affected files from the four
stage entry/reference trees while excluding evaluation and legacy material.
Validate local references, commands, schemas, hashes, permissions and both agent
entries again against a disposable copied project without access to this repo.

Version contract for that future implementation: a new run chooses an explicit
local version plus its inventory digest; every resume must find and verify the
same copy. A missing version or changed digest blocks execution. A newer available
version does not change an existing run. Migration, parallel runs, global caches,
CLI installation and curl distribution need their own design and tests.

# Harness verification and acceptance

## Scope

This change includes a shared mechanical file-policy runtime, not a methodology
CLI or semantic gate engine. Automated structural and effective-rule checks do not demonstrate that
an LLM executes all stages correctly. Never mark the human-gated scenarios below
as passed based on configuration loading or a prose walkthrough.

## Local evidence

Environment: Linux; OpenCode **1.19.5**; Claude Code **2.1.323**.

| Check | Evidence / status |
|---|---|
| OpenCode schema | Config validated against the published JSON schema retrieved through the documentation fetcher. |
| OpenCode profile loading | `opencode debug agent mapurito-ctx00` through `mapurito-ctx03` load all four primary agents on 1.19.5. |
| Claude settings schema | All four supplemental settings files validate against the SchemaStore Claude Code settings schema. Obsolete `Task` delegation rule removed; `Agent` is the supported name. |
| OpenCode skill discovery | `opencode debug skill` discovers both project skill paths; canonical entry is allowed and Claude adapter denied by executor skill rules. Captured through a PTY because this CLI truncated piped large output. |
| Skill frontmatter, local links and mapping | Passed: both skill names/frontmatter/section order, development mapping and all four stage entry files; local links resolve (including the next-phase inventory). |
| ctx01 gate definitions | Passed: seven gate rows remain identical in template and gate skill; substantive criteria unchanged. |
| Effective OpenCode rule cases | Passed: 152 cases against rules returned by the installed runtime for all four profiles, including relative/absolute source paths, four-stage writes, shell prompts, push denial, delegation, skill selection, forbidden reads and external directory. This evaluates documented wildcard matching, not live mutation tools. |
| Claude profile matrices | Passed: each of the four profiles denies other stage output trees while leaving its own out of the deny list, requests Bash permission and denies Agent delegation. No incorrectly source-anchored `Edit(/...)` rules remain. |
| Approval command | Passed: the ctx00 admission jq expression accepts a synthetic frozen/APROBAR/signer case and rejects missing approval, non-frozen state and empty signer. This is a command test, not a full gate evaluation. |
| Native interactive Claude discovery | Pending: `/mapurito-claude` menu, `/permissions` and loaded settings inspection in a fresh session. |
| Full methodology run | Pending: an explicit input and the person's real gate decisions. No run was started or approved during maintenance. |
| Whole-process isolation | Not implemented or claimed. Native tool settings do not contain all shell/MCP/hook/plugin processes. |

## Automatic-activation revision

The project now loads an OpenCode plugin and Claude `UserPromptSubmit` /
`PreToolUse` hooks on normal startup. They inspect records and enforce the current
stage's file policy without editing settings or requiring profile arguments.
Activation is session-bound through the native entry-skill hook; direct Claude
slash invocations use `UserPromptExpansion`. The ignored activation receipt
does not initialize stage results or cache a stage.
The baseline checks above predate this revision; the following tests cover the
new runtime and adapters:

```bash
node --test .agents/mapurito/tests/runtime.test.mjs
```

Result: **17 passed, 0 failed** on Node **22.23.4**. The exported OpenCode callback,
Claude stdin/stdout adapter and the exact configured Claude shell command are
exercised, including paths with spaces and missing-Node failure. These are
adapter/runtime tests; they do not claim an end-to-end live model campaign.

Fixtures are synthetic, isolated under `/tmp/opencode/`, and removed by the tests.
They are not actual human approvals or project artifacts. The suite covers
zero/one/several input candidates, stage transitions on closure evidence,
unfinished closure without deadlock, stopped/returned states, corruption/open
questions, immutable intake, patch renames/deletes, traversal/symlinks, custom
profile denies, historical deferrals, ctx03 final-candidate identity, OpenCode
pre-tool rejection/context injection and Claude native deny/error outputs.

`opencode debug config` discovers the local Mapurito plugin on 1.19.5. Claude
project settings and all optional stage profiles validate against their schema.
Live interactive host behavior and a complete human-gated run still require
their acceptance sessions; callback/subprocess tests do not replace those.

Node 20+ is a prerequisite for Claude's command hook. Its shell wrapper exits 2
on runtime failure or missing Node. Pure/safe modes, disabled hooks or disabled
project config invalidate automatic protection and must not be used for execution.
The runtime's historical compatibility requires recorded state/events; records
needing a compatibility exception stop for a separately approved recovery path.

For OpenCode, public docs now describe V2 too. This configuration intentionally
uses the installed V1 interface (`agent` / `permission` / `bash` / `task`) and does
not claim arbitrary version compatibility. Repeat checks before upgrading agents.
The OpenCode permission diagnostic includes a tool-output-directory exception;
it is not correct to claim a universal external-directory denial.

## Reproduce structural checks

From the project root, use the installed JSON/YAML validators to validate the
project/optional JSON configurations against their schemas and both new skills' frontmatter.
Resolve their relative Markdown links, every layout entry and adapter settings
path. Confirm the gate rows of ctx01 `templates.md` and `sr-gate-check` are equal.
Run `git diff --check`. No validation scripts are installed or required by the
stage execution; checked-in harness infrastructure/tests are separate. The local skill registry can be refreshed with
`gentle-ai skill-registry refresh --force` when that optional developer tool exists.

## Interactive acceptance protocol

Use disposable projects/controlled records, not this project's user inputs or
repository `evals/` or `legacy/` material. Copy only the runtime files explicitly
needed. Do not invent human approvals as actual project evidence. Mark a scenario
passed only with the agent/version, profile, expected action, observed action and
evidence location recorded by the tester. Tool permission approval and stage
approval are distinct decisions.

| ID | Scenario | Expected result |
|---|---|---|
| R01 | No reference / no results | Zero files: request upload. One: select and validate. Several: ask which ones and stop. Do not create a baseline before clear selection. |
| R02 | Valid ctx00 start | Execute ctx00 only and stop at human review; no automatic approval. |
| R03 | Existing ctx00 work | Resume from state/events; do not overwrite intake or duplicate feedback. |
| R04 | ctx00 partial freeze | A baseline alone never admits ctx01; check original decision, closed questions, reports, event, state, handoff and hashes. |
| R05 | Open OQ or failed gate with human approval | Refuse freeze, preserve evidence and explain blockers. |
| R06 | Valid new ctx01 | Upstream-only checks precede initialization; record links exist before checks; seeded completeness waits until 01.2 then remains mandatory in G01-1. |
| R07 | Resume ctx01 / altered guardrail hash | Preserve counters and records; mismatched links block continuation rather than silently reset. |
| R08 | ctx01 O3 / controlled DFR | Apply only the existing O3 forced-assumption rule. Human `APROBAR` is still required. DFRs remain visible and travel to the responsible stage. |
| R09 | Historical decision / missing old logs | Read-only compatibility review; missing evidence requires human reconciliation, no rewritten baseline/hash or fabricated events. |
| R10 | ctx02 V1 only approved | Phase B may start; ctx03 remains inadmissible until ctx02 V2 closure. |
| R11 | Open ctx02/03 question without answer | Wait; never automatically force-close the question. |
| R12 | `stopped`, `not_approved`, `returned_upstream` with later artifacts | Halt routing; later filenames cannot override failed or returned state. |
| R13 | Hash corruption or state/event contradiction | Stop and report exact conflict; never recompute hashes to bless changed content. |
| R14 | Full-run stage boundary / context exhaustion | Fresh interactive context between stages; resume same-stage work from files after interruption or compaction. |
| R15 | ctx03 unfinished SPEC / dependency | Resume owning module in register order; do not skip to next or claim it done. |
| R16 | ctx03 reviewed candidate differs from final | Fail candidate identity and request review again; no final freeze. |
| R17 | Normal startup / unavailable runtime / optional wrong fixed profile | Auto-select the file scope when hooks are active. Missing runtime blocks writes; optional native fixed-stage denies remain in force. |

## Native negative permission probes (pending interactive validation)

For each stage and agent, try file tools against disposable source, harness,
configuration, input, prior-stage, next-stage and active-stage paths. Protected
edits must be denied; active-stage writes must ask. Probe shell redirection,
interpreter writes, symlinks, traversal and enabled MCP/hooks/plugins separately.
Reject unsafe command prompts; do not confuse an `ask` with a technical denial.
Where native profiles cannot enforce the target, record the gap and require an
outer sandbox before claiming that guarantee. An independent reviewer must have
its own tested permissions before enabling delegation; current profiles use
the stage's documented inline fallback.

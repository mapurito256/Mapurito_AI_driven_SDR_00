# Mapurito agent harness

This is the development-tree integration for OpenCode and Claude Code. It adds
entry skills, routing/recovery contracts and automatically selected file policies while
leaving stage directories and `inputs/` / `results/` where they are.

## Start

Run from the repository root with Node 20+ available for the Claude hook:

| Agent | New interactive session | Request inside the session |
|---|---|---|
| OpenCode | `opencode` | `Start methodology` or `Start with @inputs/<document>.md` |
| Claude Code | `claude` | `Start methodology` or `Start with @inputs/<document>.md` |

The project skill recognizes equivalent English/Spanish requests. The plugin
and Claude hooks inspect on-disk state and apply the appropriate file profile
without the person typing `--agent` or `--settings`. Existing work is resumed
rather than overwritten. `Run ctx01` still needs upstream closure. `Continue`
never replaces the admitted input set.

The model invokes the entry skill in response to the request, which activates a
session-bound guard. Before that, ordinary application edits use native
permissions, while methodology/config/input paths are always protected and
`results/` writes are refused. The private activation receipt is ignored by Git
and contains neither input text nor a cached stage choice.

For a new ctx00, explicit references take priority. Without references: zero
visible files in `inputs/` means request upload; one means select it and proceed
after validation; more than one means ask which file(s), then stop. Multiple text
documents form one ordered intake with source hashes. PDFs still need a
Markdown/text copy under the existing contract. See [input selection](contracts/input-selection.md).

Between full-run stages, open a fresh normal session. Records determine the new
scope; previous-stage conversation is not carried forward.

Restart after changing skills/config. In Claude Code confirm loaded permissions
with `/permissions`. In OpenCode inspect `opencode debug agent mapurito-ctx00`.
The runtime, not a JSON read or skill invocation alone, enforces file scope.
Verify plugin/hooks are enabled. Optional fixed-stage profiles remain available
in the adapter guides; native denies cannot be relaxed by the router.

## Architecture and reading order

- [Canonical skill](../skills/mapurito/SKILL.md): explicit execution/status trigger.
- [Execution contract](contracts/execution.md): session startup and human stops.
- [Routing](contracts/stage-routing.md): select the permitted next procedure.
- [Recovery](contracts/handoff.md): evidence, partial freezes and older records.
- [Permissions](contracts/permissions.md): target restrictions and actual limits.
- [OpenCode adapter](adapters/opencode/README.md) and
  [Claude adapter](adapters/claude-code/README.md): launch and settings details.
- [Verification](verification.md): performed checks and pending interactive tests.
- [Next-phase path inventory](path-migration.md): relocation boundary for `.mapurito/`.

The router does not replace detailed stage gates. Stages keep their entry skills,
schemas, event names, human validations and progressive subskill loading. Closed
blocking questions, passing gates and explicit human approval precede a verified
freeze. Controlled DFR obligations remain visible under ctx01's single `APROBAR`.
Older signed `APROBAR_CON_APLAZAMIENTO` records are handled read-only, not rewritten.

## What is protected

The shared runtime denies mutations outside the active stage and protects
methodology/harness/configuration paths and inputs. Permitted writes still pass
through native prompts. Commands and web
reads ask in both. Delegated reviews are initially disabled; the stage's inline
fallback must be recorded as less independent.

The runtime and profiles are not a full-process sandbox. Shell, inherited MCP/hooks/plugins,
alternate tools and symlinks need explicit native tests. The contracts prohibit
bypasses; they do not create OS enforcement. Do not call a documented policy a
tested technical guarantee. A complete human-gated run and native negative probes
are listed separately from the checks already performed. The guard protects this
checkout even during maintenance conversations: source maintenance needs a
human-managed developer environment without the executor guard. The executor
must not disable its own protection.

## Next deployment boundary

`layout.json` deliberately declares `development` mode and no release version.
Only the current same-root mapping is supported. A later change must relocate
resources into a versioned `.mapurito/` copy, bind runs to that version, adapt
method-owned paths inside stage references/commands, and rerun the checks. No
global install, CLI or automatic update is introduced here.

The new skills follow the bundled skill authoring guide (concise bodies and local
supporting references). `LicenseRef-Unspecified` records that this change does
not introduce or grant a repository license.

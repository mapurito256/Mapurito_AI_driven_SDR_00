# Execution permissions

## Target policy

The executor reads methodology/harness resources but never edits them. Source
inputs and prior-stage results are read-only. Writes belong only to the current
`results/ctxNN/`, using its schema; `intake.md` is immutable after numbering.
Protect agent settings, `.git/`, `.agents/`, `.claude/`, `.opencode/`, future
`.mapurito/`, and the stage source directories. Do not read `evals/` or `legacy/`.
Inspect other stage metadata only for routing; do not read ahead into content.
Use only the reads and web access authorized by the selected stage (ctx03 web
reads are limited to 03.2 datasheets without project/user details).

## Automatic activation

Open the normal agent (`opencode` or `claude`) from the project root. Both project
adapters start automatically after the host accepts the project configuration.
The agent inspects state through the canonical skill before execution. A trusted
local runtime independently rechecks the records before each supported file
mutation and loads the selected stage's existing profile. It does not mutate
agent settings, execute another CLI instance or approve any human gate.

Scope restriction activates for the host session when the model invokes the
entry skill. Claude's direct `/mapurito-claude` invocation is covered separately
by `UserPromptExpansion`. The receipt under ignored, protected
`.agents/mapurito/session-state/` contains only an activation flag, keyed by a
hash of the host identity; it contains no input material, stage verdict or cached
stage choice. Another session does not inherit it. Protected methodology/input
paths remain read-only at all times; before activation, unrelated application
edits retain native permissions and `results/` writes are refused.

- OpenCode discovers `.opencode/plugins/mapurito.js`. Its pre-tool hook rejects
  forbidden file operations; its system-context hook reports the routing candidate.
- Claude loads `.claude/settings.json`; `UserPromptSubmit` reports current scope,
  and `PreToolUse` calls the same runtime to return a native deny when necessary.
  The command fails with exit 2 on runtime errors, including a missing Node
  executable. Node 20+ is a prerequisite for the Claude adapter.

The runtime authorizes only the current stage's file scope, including all old and
new paths in a patch/rename. It denies protected sources, traversal, symlink
escapes, unknown mutation paths, malformed state, invalid closure evidence and
later-stage writes. Incomplete closure stays in its owning scope so its final
records can be completed; it does not admit the next stage. A stopped/returned
run requires human-controlled reopening. Completed runs have no writable scope.

The runtime is mechanical routing/write-scope protection. The selected stage
still performs its complete admission, semantic checks and human validation.
Its in-memory status is not a new field in `state.json` and does not rewrite logs.
This is not a general hot-reload of arbitrary agent JSON: the shipped profiles
differ in file scope, while shell/web/delegation/skill policies are shared and
loaded natively at startup. Profiles with divergent non-file permissions
are rejected rather than silently claimed active. Model/provider options are
not switched by this mechanism.

## Shipped profiles (also available for explicit launches)

- OpenCode: named `mapurito-ctx00` ... `mapurito-ctx03` primary agents, configured
  in `.opencode/opencode.json`, read by the automatic runtime. In an explicit
  `--agent` launch, default file mutations are denied; matching
  active-stage paths ask the person for permission. Shell and web ask; other tools
  retain inherited settings and must be reviewed. Task delegation is denied
  (inline review fallback). Outside-directory tools are denied by the profile,
  but the observed runtime adds a tool-output-directory exception afterward.
  Review the effective profile before execution; do not claim a universal deny.
- Claude Code: the runtime loads `.agents/mapurito/adapters/claude-code/ctxNN.json`
  for the detected scope. Optional `--settings` launches additionally apply its
  native fixed-stage rules. Edit denials protect named method/harness/config paths and other
  stages. New active-stage writes still use the normal permission prompt.
  Bash and web calls ask; Agent is denied for the initial inline-review mode.
  These supplemental settings do not silently replace user settings.

Never grant an execution permission to edit a source/configuration file in order
to fix a denied operation. A manually selected fixed-stage profile must match
the detected stage; automatic hooks cannot relax a native deny. Do not use
bypass/accept-all modes or persist broad approvals to get around a restriction.
Between stages use a new session; normal startup will select the new policy.
Do not disable hooks, run pure/safe modes or assume a JSON read activates policy.

## Enforcement limits

These are file-tool hooks and native permissions, not an OS sandbox. Shell approval does not
limit every child process to the active stage. No command prefix allowlist is
claimed safe against arbitrary redirects/interpreters. Review each shell command
as a one-time approval; reject protected writes. MCP, hooks, plugins and services
may operate outside file permissions. Do not use them as file-write bypasses;
disable unnecessary integrations for an executor. A prompt or hash is not write
protection. Arbitrary filesystem access needs a separately tested outer sandbox.

The runtime tests include absolute/relative paths, rename/delete patches,
traversal, symlinks, interrupted closure, corrupt hashes and native hook outputs.
Live host integration and alternate mutation tools must still be tested before
claiming full coverage. Unknown tools require inspection, not presumed containment.
Optional Claude profiles list other stages explicitly because deny rules take
precedence over allows. Native prompts do not override a runtime denial.

The guard protects this methodology checkout even during maintenance conversations.
Source maintenance requires a human-managed developer environment without the
executor guard; the agent must never disable its own guard to make a task pass.
Permission checks are not substitutes for human gate
decisions. The person may grant a tool call without approving a stage, or approve
a stage without authorizing broader filesystem access.

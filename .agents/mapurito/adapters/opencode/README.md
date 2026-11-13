# OpenCode executor adapter

From the project root, start the normal agent:

```bash
opencode
```

Request `Start methodology`, `Start with @inputs/<document>.md`, `Run ctx00` or
`Continue`. The skill verifies progress and selects inputs; the project plugin
independently rechecks state before mutations and reads the corresponding
`mapurito-ctxNN` file policy. No profile argument is required. A fresh normal
session is still required between full-run stages.

`.opencode/plugins/mapurito.js` uses the shared trusted runtime in
`.agents/mapurito/runtime/`. It rejects protected file operations before execution;
it does not edit configuration or spawn another CLI. Shell/web calls still ask.
Do not disable plugins or project configuration for methodology execution.

Optional explicit launch: `opencode --agent mapurito-ctx00` (and ctx01–ctx03).
Those native fixed-stage limits remain in force alongside the dynamic guard.

The project config is `.opencode/opencode.json`; it uses the V1 `agent`,
`permission`, `bash`, and `task` interface supported by installed OpenCode 1.19.5.
The published schema also describes newer V2 fields: do not mix V2 `agents` and
`permissions` syntax into these profiles without testing that version.

After edits to skills or config, quit and restart OpenCode. Do not change the
profile mid-stage or use a different agent as a permission bypass. The config
does not change the default agent, provider or model; it adds a global file guard.

Local diagnostics (no model call) are `opencode debug skill` and
`opencode debug agent mapurito-ctx00`. Inspect only the Mapurito entries; resolved
configuration may include unrelated personal settings. Check the effective
edit rules, task denial and shell prompts rather than assuming merges are safe.

Only the canonical `mapurito` skill is permitted by the project rules. The
Claude adapter may also be discovered, but it is not a second workflow. Stage
subskills are explicitly read by the stage orchestrator, not independently invoked.

Shell remains interactive and unsandboxed. File-tool permissions are not a
process/filesystem isolation boundary. Follow [permissions](../../contracts/permissions.md)
and [verification](../../verification.md) before declaring native runtime coverage.

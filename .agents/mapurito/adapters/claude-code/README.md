# Claude Code executor adapter

From the project root, with Node 20+ available, launch the normal interactive agent:

```bash
claude
```

Project `.claude/settings.json` registers the runtime hooks. After trusting the
project, inspect `/status`, `/permissions` and `/hooks` to confirm they loaded.
Request execution in ordinary chat:

```text
Start with @inputs/<document>.md
```

`Start methodology`, `Run ctx00` and `Continue` are routing triggers; the skill
applies the explicit/zero/one/multiple input rule. `/mapurito-claude` remains an
explicit fallback if natural-language skill discovery is unavailable.

On each user prompt the runtime reports stage metadata. Before supported file
mutations it rechecks progress and reads `ctxNN.json`, returning a native deny
for prohibited paths. Reading the JSON as ordinary text is not this activation.
A hook failure exits 2; do not continue with hooks disabled or ignored.

For the next full-run stage, quit and start another normal session. Optional
fixed-stage launch remains `claude --settings .agents/mapurito/adapters/claude-code/ctx00.json`
(or ctx01–ctx03); it adds native denies the dynamic router cannot relax.

The adapter skill lives in `.claude/skills/` and reads the canonical `.agents/`
entry. Existing `CLAUDE.md` imports `AGENTS.md`; neither reads all stage details
at startup. Read-only status requests do not require creating execution files.

The optional profiles use Edit rules, which also cover Write file mutations. Paths
beginning `./` resolve from the current directory; always launch and remain at
the project root. A single `/` in a `--settings` file would anchor at the file's
directory, not the project, so it is deliberately not used here. Verify the
effective rules via `/permissions`. Edit deny rules win
over inherited allow rules. Bash and web requests ask; the delegated Agent tool
is denied, so record the existing inline review fallback. Do not use bypass,
accept-all modes or approve protected writes. These profiles neither change
credentials nor enable a sandbox or introduce MCP servers. The project hooks are
checked-in infrastructure, not scripts generated as stage artifacts.

The native Bash sandbox does not by itself contain file tools, MCP or hooks;
these settings are not whole-process isolation. Commands, existing integrations
and inherited settings need review. Use a separate human-managed developer
environment for source maintenance; do not let the executor disable its own guard.

Tested installation version and remaining interactive scenarios are in
[verification](../../verification.md). Do not infer live model behavior from a
static JSON check. See [permissions](../../contracts/permissions.md).

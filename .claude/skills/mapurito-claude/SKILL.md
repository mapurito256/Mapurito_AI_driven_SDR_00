---
name: mapurito-claude
description: "Trigger: start/run methodology, start with inputs, run ctx00-ctx03 or continue in Claude Code. Use common state and input routing."
license: LicenseRef-Unspecified
metadata:
  author: Mapurito
  version: "0.2"
---

# Claude Code adapter

## Activation Contract

Use for explicit methodology execution, resume or inspection in Claude Code.
For OpenCode, use the canonical `mapurito` skill instead. Do not launch a second
workflow if the canonical entry is already active.

## Hard Rules

- Read the canonical entry by filesystem path; it need not be registered as a
  Claude skill. Do not recursively invoke this adapter.
- Never duplicate stage rules, infer approval or treat skill activation as
  activation of a permissions profile.

## Decision Gates

| Request | Action |
|---|---|
| Inspect | Read-only routing is allowed. |
| Execute | Project hooks select the current stage's policy; no launch arguments are required. |
| Missing/contradictory runtime hook or contract | Stop and report the missing prerequisite; never claim activation from reading JSON. |

## Execution Steps

1. Read [the canonical skill](../../../.agents/skills/mapurito/SKILL.md).
2. Read the [Claude integration](../../../.agents/mapurito/adapters/claude-code/README.md).
3. Follow the canonical protocol and stage-specific instructions; let the main
   interactive session handle every human gate. Reopen a fresh session between
   full-run stages.

## Output Contract

Return canonical status, input selection and evidence. If project hooks are
disabled, report that setup issue; do not execute unprotected or auto-approve.

## References

- Project root: `.agents/skills/mapurito/SKILL.md`.
- Project root: `.agents/mapurito/adapters/claude-code/README.md`.

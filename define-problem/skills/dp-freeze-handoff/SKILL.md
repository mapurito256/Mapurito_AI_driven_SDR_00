---
name: dp-freeze-handoff
description: After the person's explicit APROBAR, records the decision, writes the frozen problem-baseline.json with its hash, checks it is equivalent to the document and writes CONTEXT-ctx00.md; loaded by define-problem, not invoked directly.
---

# dp-freeze-handoff

## Objective

Turn the approved `results/ctx00/problem-definition.md` into the frozen
`results/ctx00/problem-baseline.json`, prove with shell checks that both carry the same
information, and leave `results/ctx00/CONTEXT-ctx00.md` for Ctx 01. The agent never
approves: this skill runs only after the person wrote `APROBAR`.

## Inputs

- `results/ctx00/problem-definition.md` (approved), `results/ctx00/intake.md`, `results/ctx00/sources/`.
- `../../references/baseline-schema.md` and `../../references/record-schema.md`.
- The person's decision, in their own message, with their name.

## Steps

All commands run from the root.

1. **Gate.** Do nothing more if any of these fails, and say which:
   - `grep -cE '^- \*\*State:\*\* open' results/ctx00/problem-definition.md` prints `0`.
   - `grep -E '^- Decision: ' results/ctx00/problem-definition.md` still shows `<pending>` (the agent has not filled it).
   - The person's message is the word `APROBAR` and gives a name. Nothing else counts as approval.
   - All required verification reports and the structural checklist are `GREEN`;
     an unresolved failure prevents freeze even if approval was requested.
   On recovery of an interrupted step 7, first reconcile original approval,
   section 11, events and existing artifacts using the harness handoff contract.
   The `pending` check applies to a new freeze; a recorded decision is not reset
   to pending and a verified original approval is not requested or counted twice.
   Resume only the incomplete operation, repeating its checks as necessary;
   ambiguous or altered approval evidence blocks further writes.
2. **Record the decision.** In section 11 write `Decision: APROBAR`, `Approved by:` the name as the person wrote it, and `Date:` from `date -I`.
3. **Draft the JSON.** Write `results/ctx00/problem-baseline.json` from the `.md`, item by item, following `baseline-schema.md`. Leave `document.sha256` and `intake.sha256` as empty strings for now. Read each `.md` line and copy it; do not summarize, merge or complete.
4. **Content checks** (they do not depend on any hash). Run each, and keep the command and its output:
   - IDs by prefix: for the `.md`, `grep -ohE '^(- |### )(OBJ|STK|ENV|SCP|EXT|SRC|OBL|SOL|OQ|ASM)-[0-9]+' results/ctx00/problem-definition.md | sed -E 's/^(- |### )//' | sort -u`; for the JSON, `jq -r '[.objectives,.stakeholders,.environment,.scope,.external_entities,.sources,.obligations,.solutions,.open_questions,.assumptions]|add|.[].id' results/ctx00/problem-baseline.json | sort -u`. The two lists must be identical (`diff`).
   - Answer IDs: `grep -ohE '^- FB-[0-9]+/OQ-[0-9]+' results/ctx00/problem-definition.md | sed 's/^- //' | sort -u` against `jq -r '.feedback_summary.answers[].id' … | sort -u`; identical.
   - Statement IDs: `grep -ohE '^- STM-[0-9]+' results/ctx00/intake.md | sed 's/^- //' | sort -u` against `jq -r '.statements[].id' … | sort -u`; identical. Section 1 coverage, with range lines, was already audited by `dp-verify-consistency` part A.
   - Statement total: `jq '.statements|length'` equals `jq '.intake.total_statements'` equals the number on the `Total statements:` line of `results/ctx00/intake.md`.
   - No threshold: `jq -e '[.objectives[].measure|keys[]]|unique-["what","definition","unit","reference_point","sense"]|length==0' results/ctx00/problem-baseline.json` prints `true`.
   - Counters: `jq '.feedback_summary.rounds_used, .feedback_summary.gap_search_reruns_used'` equals the two counters in section 10 of the `.md`.
   - Every question closed: `jq -e '[.open_questions[].state]|all(.=="closed (answered)" or .=="closed (forced)")'` prints `true`.
5. **Record the content checks.** Write each command and its output under a "Freeze checks" heading in section 10 of the `.md`. If any failed, fix the JSON (never the approved text) and repeat step 4 until all pass, then record only the final run.
6. **Hashes.** `sha256sum results/ctx00/problem-definition.md results/ctx00/intake.md` (the `.md` is now final). Put both values in the JSON. Then `sha256sum results/ctx00/problem-baseline.json > results/ctx00/problem-baseline.sha256`. Do not edit the `.md` or the JSON after this step.
7. **Hash checks.** Run and keep command and output:
   - `sha256sum -c results/ctx00/problem-baseline.sha256` says `OK`.
   - `jq -r '.document.sha256' results/ctx00/problem-baseline.json` equals the first field of `sha256sum results/ctx00/problem-definition.md`; same for `.intake.sha256` and `results/ctx00/intake.md`.
   - For each source, `jq -r '.sources[]|.snapshot_file+" "+.snapshot_sha256'` matches `sha256sum` of that file.
   If one fails, correct the JSON and redo steps 6 and 7. These outputs go to the CONTEXT file, not to the `.md`, because writing them into the `.md` would change its hash.
8. **Hand-off note.** Write `results/ctx00/CONTEXT-ctx00.md` with the **CONTEXT template** of `record-schema.md`: status `frozen`, paths and hashes, the hash checks of step 7, the questions closed by forced closure, the assumptions with their closure criterion, and the reading order.
9. **Record and stop.** Return the signer, baseline path and hash to the
   orchestrator, which records `STAGE_APPROVED`, updates execution state and
   closes step 7 per `record-schema.md`. Do not start Ctx 01. Tell the person the
   three hand-off files are written.

`CONTEXT` and baseline `status: frozen` imply approval and closed questions;
execution `state.json` uses `approved` only after successful freeze. On an
interruption, preserve partial artifacts and resume only from verifiable existing
evidence. Do not infer approval, regenerate an absent decision or hand off a
partially written baseline.

## Output

`results/ctx00/problem-baseline.json`, `results/ctx00/problem-baseline.sha256`,
`results/ctx00/CONTEXT-ctx00.md`, and section 11 and the "Freeze checks" of section 10
filled in the `.md`.

## Do not

- Do not run without the person's literal `APROBAR`; do not infer approval from silence or from "looks good".
- Do not change the approved text of the `.md` other than section 11 and the "Freeze checks" in step 2 and 5.
- Do not add, drop or reword any item in the JSON to make a check pass; correct the JSON to match the `.md`.
- Do not put a hash of the JSON inside the JSON.
- Do not start Ctx 01 or edit any file of it.

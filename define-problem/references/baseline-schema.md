---
name: baseline-schema
description: Shape of results/ctx00/problem-baseline.json, the frozen Ctx 00 baseline, and its mapping from the sections of problem-definition.md. Read by dp-freeze-handoff and by Ctx 01 admission.
---

# baseline-schema — the frozen baseline

## Objective

Fix the JSON that carries, item by item, the same information as the approved
`results/ctx00/problem-definition.md`. It adds nothing and removes nothing. Identifiers
and line forms come from `record-schema.md`.

## Section ↔ key

| Section of the `.md` | Key(s) in the JSON |
|---|---|
| 1 Input material | `statements` (and `intake`) |
| 2 Problem | `problem` |
| 3 Objectives and success measures | `objectives` |
| 4 Stakeholders and environment | `stakeholders`, `environment` |
| 5 Boundary and scope | `scope`, `external_entities` |
| 6 Normative sources and obligations | `sources`, `obligations` |
| 7 Registered solution suggestions | `solutions` |
| 8 Open questions | `open_questions` |
| 9 Assumptions | `assumptions` |
| 10 Feedback log | `feedback_summary` |
| 11 Decision | `approved` (and `status`) |

`stage`, `status` and `document` describe the file itself and have no section.

## Top-level keys

| Key | Value |
|---|---|
| `stage` | `Ctx00` |
| `status` | `frozen` |
| `approved` | `{ "by", "at", "decision" }` copied from section 11; `decision` is `APROBAR` |
| `document` | `{ "path", "sha256" }` of `results/ctx00/problem-definition.md` |
| `intake` | `{ "path", "sha256", "total_statements" }` of `results/ctx00/intake.md` |
| `statements` | one entry per `STM` |
| `problem` | one object (no `id`) |
| `objectives` · `stakeholders` · `environment` · `scope` · `external_entities` · `sources` · `obligations` · `solutions` · `open_questions` · `assumptions` | arrays of items |
| `feedback_summary` | `{ "rounds_used", "gap_search_reruns_used", "answers": [ … ] }` |

The JSON carries no hash of itself: that hash lives in
`results/ctx00/problem-baseline.sha256`.

## Item

Every item of every array, and `problem`, has:

```json
{ "id": "<ID>", "text": "<text>", "provenance": "D|R|P", "cite": ["<cite>", "…"], "section": 0 }
```

`cite` is a list of the cited identifiers (`STM-nn`, `SRC-nn`, `FB-n/OQ-nn`)
with the quoted text kept inside `text` when the line had one. `section` is the
number of the section of the `.md` that holds the item. The extras below are
added to the item.

## Extras by key

| Key | Extra fields |
|---|---|
| `statements` | Only `id`, `section` (1) and exactly one of `category` or `discard` (the reason). A range line is expanded to one entry per `STM`. No `text`: the literal text lives in `intake.md`. |
| `objectives` | `decision`; `measure` = `{ "what", "definition", "unit", "reference_point", "sense" }`. No threshold key, ever. |
| `stakeholders` | `type`; `use` (only for type `user`). |
| `environment` | `type`. |
| `scope` | `side` (`in`\|`out`); `traces_to` (list of `OBJ`, for `in`); `reason` (for `out`). |
| `external_entities` | `direction` (`in`\|`out`\|`both`). |
| `sources` | `issuer`, `identifier`, `version`, `snapshot_file`, `snapshot_sha256`, `status` (`verified`\|`unverified`). |
| `obligations` | `source` (an `SRC`), `status` (`verified`\|`suggested`), `active` (boolean). |
| `solutions` | none. |
| `open_questions` | `affected_section`, `origin`, `impact`, `type`, `state` (`closed (answered)` or `closed (forced)` only), `fb` (the `FB-n/OQ-nn` that closed it). `text` is the question. |
| `assumptions` | `owner`, `closure_criterion`. |
| `feedback_summary.answers[]` | `id` (`FB-n/OQ-nn`), `type` (`content`\|`forced`), `text`, `section` (10). |

## Shape skeleton

```json
{
  "stage": "Ctx00", "status": "frozen",
  "approved": { "by": "<name>", "at": "<date>", "decision": "APROBAR" },
  "document": { "path": "<path>", "sha256": "<hex>" },
  "intake": { "path": "<path>", "sha256": "<hex>", "total_statements": 0 },
  "statements": [ { "id": "STM-nn", "category": "<category>", "section": 1 } ],
  "problem": { "text": "<text>", "provenance": "D|R|P", "cite": [], "section": 2 },
  "objectives": [ { "id": "OBJ-nn", "text": "", "provenance": "D|R|P", "cite": [], "section": 3,
    "decision": "<text>",
    "measure": { "what": "", "definition": "", "unit": "", "reference_point": "", "sense": "" } } ]
}
```

The remaining arrays follow **Item** and **Extras by key**. Absent optional fields are
omitted, not set to `null`.

## Do not

- Do not add, merge, split or reword an item relative to the `.md`.
- Do not add a threshold, target or limit to any `measure`.
- Do not freeze with a question in any state other than a closed one.
- Do not store the JSON's own hash inside the JSON.
- Do not put a value of any case in this file; it holds forms only.

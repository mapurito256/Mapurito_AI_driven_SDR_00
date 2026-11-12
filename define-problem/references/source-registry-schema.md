---
name: source-registry-schema
description: What a normative source (SRC) needs to exist in Ctx 00 — resolvable identifier, local snapshot and its sha256 — and how to make the snapshot; read by dp-normative-sources and dp-verify-citations.
---

# source-registry-schema — an SRC needs an identifier and a local snapshot

## Objective

No authoritative source enters Ctx 00 from the agent's memory. An `SRC` exists
only with a **local snapshot** on disk and a **literal, verified citation**.
This is the most severe control of the stage: fabricated regulatory citations
are the likeliest error in chains of laws, regulations and resolutions. The
agent's confidence is never used as evidence.

## The `SRC` fields

Written as one `SRC-nn` line of section 6 (see **Item lines** in
`record-schema.md`):

| Field | Meaning |
|---|---|
| `id` | `SRC-nn`, in order, no gaps. Referenced by `OBL.source` and by citations. |
| text | What the source is, in one line. |
| `issuer` | Who issued it. |
| `identifier` | A resolvable id (document number or title slug). |
| `version` | Version, date or snapshot tag. |
| `snapshot` | `results/ctx00/sources/SRC-nn.md`. |
| `sha256` | SHA-256 of the snapshot's bytes, computed by the agent with `sha256sum`. |
| `status` | `verified` (snapshot exists and citations match it) or `unverified` (no snapshot, no hash). |

## Steps to make a snapshot

1. Find the source in the material or, if absent, on the web; confirm issuer and identifier.
2. Save the governing passage as plain text in `results/ctx00/sources/SRC-nn.md`.
3. Run `sha256sum results/ctx00/sources/SRC-nn.md` and write the hash on the `SRC-nn` line.
4. Every `"<text>" [cite: SRC-nn]` is checked literally against that file by `dp-verify-citations`, under the **Matching rule**.

A value that a person merely declares does not satisfy this: a source needs a
snapshot, not a spoken number. A declared value without a snapshot becomes an
`ASM` or an `OQ`, never a verified `SRC`.

## Do not

- Do not create an `SRC` without a snapshot file and a hash computed by `sha256sum`.
- Do not mark a source `verified` from memory.
- Do not edit a snapshot after its hash is written; make a new one and recompute.

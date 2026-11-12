---
name: dp-normative-sources
description: Catalogues and verifies the normative sources and obligations governing the project, searching the web when needed; loaded by define-problem, not invoked directly.
---

# dp-normative-sources

## Purpose

Catalogue the norms, regulations and technical sources that govern the project,
and confirm that every citation to a source is real and verifiable. No source
enters from memory.

## Inputs

- Sections 1 to 5 of `results/ctx00/problem-definition.md` and `results/ctx00/intake.md`.
- Web search, when the rules below call for it.
- `../../references/record-schema.md` for **Working files**, **Identifiers**, **Item lines**, **Citation grammar** and **Provenance marks**.

## Procedure

1. Identify the normative sources named in the material.
2. Verify each exists: first in the material provided; if it is not there, search the web.
3. For each verified source, take the next `SRC-nn` (from 01, no gaps, no reuse) and save its governing passage as `results/ctx00/sources/SRC-nn.md` — this exact name is mandatory, because citation verification reads it. Compute `sha256sum results/ctx00/sources/SRC-nn.md` and write the line in section 6 with issuer, identifier, version, snapshot file, that hash and `status: verified`. Then write each concrete obligation it imposes as the next `OBL-nn` line, `source: SRC-nn`, `status: verified`, and `active: true` only if it applies to the scope of section 5, otherwise `active: false`.
4. If a source named in the material cannot be verified (it does not exist, is miscited, or cannot be found), record it in section 6 as an `SRC-nn` line with `status: unverified` (no snapshot, no hash) and raise an open question of type `normative` through `dp-gap-search`. An obligation that depends on it is `active: false`.
5. If the scope implies applicable obligations the client did not mention, search the web and write each as an `OBL-nn` line with `status: suggested` and `active: false`, each with the reason you believe it applies — never as confirmed facts. It becomes `active: true` only when an answer `FB-n/OQ-nn` of the person confirms it and its source has a snapshot; ask it as an open question.
6. Where no source applies, record it explicitly in section 6: `No normative source identified for <topic>. If a regulation applies, include it.`
7. Run `dp-verify-citations` over section 6, against the source copies.
8. Run `dp-gap-search` in section mode over section 6.

Never cite a norm or regulation from memory. If you believe one applies, find
it on the web and confirm its issuer and identifier; if you cannot, do not cite
it — raise the question instead. An obligation whose answer is in a public
source is resolved by you and written as a `[R]` statement with its citation,
not as an open question.

## When to search the web

- The material names a norm and you need to confirm it exists and get its correct identifier.
- The scope covers a typically regulated domain (telecommunications, personal data, emissions, regulatory evidence) and the material does not mention the applicable regulations.
- An obligation in the material seems to derive from a norm it does not cite.

A valid source has an identifiable issuer (a regulator, standards body or
competent authority), a verifiable identifier, and content that was confirmed
on the web or provided by the client.

## Output

Section 6 written: `SRC-nn` lines, verified ones with a saved
`results/ctx00/sources/SRC-nn.md` and its hash, unverified ones each with a `normative`
open question, and `OBL-nn` lines with `status` and `active`.

## Exit condition

Every source named in the material is verified or marked unverified with an
open question, every saved source copy is named `results/ctx00/sources/SRC-nn.md`, and
`dp-verify-citations` over section 6 is `GREEN`.

## If it fails

If a source citation fails, correct it as `dp-verify-citations` directs; if the
source cannot be confirmed, mark it unverified and raise the `normative`
question rather than keeping an unconfirmed citation. Never present a
memory-cited norm as verified.

## Do not

- Do not cite or save a source from memory, nor write a snapshot hash you did not compute with `sha256sum`.
- Do not set `active: true` on an obligation whose source is unverified, or that is only suggested.
- Do not present a suggested obligation as a confirmed fact.

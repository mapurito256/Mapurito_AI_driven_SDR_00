---
name: ra-admit-inputs
description: Reads the Ctx 00 and Ctx 01 outputs in order, runs the mechanical admission checks with shell commands, and records a disposition for every REQ, LIM and DFR; loaded by resolve-architecture-v2 at 02.1, not invoked directly.
---

# ra-admit-inputs

## Objective

Admit the upstream results read-only, prove with shell that they are the approved
ones, and decide for every `REQ`, `LIM` and `DFR` what it means for architecture.
Nothing upstream is modified (invariant 4) or dropped silently (invariant 5).

## Steps

1. **Read in this order**: `results/ctx01/CONTEXT-ctx01.md`; `results/ctx01/requirements-baseline.json`;
   `results/ctx01/record.json` (provenance of values and the
   human answers; consultation only); `results/ctx00/problem-definition.md` of Ctx 00
   (scope section 5, environment section 4, registered solution suggestions
   section 7, assumptions section 9) and `results/ctx00/sources/SRC-nn.md`.
2. **Shell checks** (record each result; no script):
   ```
   jq 'keys' results/ctx01/requirements-baseline.json     # learn the shape first
   jq -r '.status' results/ctx01/requirements-baseline.json
   sha256sum -c results/ctx01/requirements-baseline.sha256
   test -s results/ctx00/problem-definition.md && sha256sum results/ctx00/problem-definition.md
   grep -n -i 'open question' results/ctx00/problem-definition.md        # read section 8 by eye
   jq -r '.items[] | select(.type=="REQ" or .type=="LIM" or .type=="DFR") | .id' results/ctx01/requirements-baseline.json
   ```
   If the baseline shape differs from `.items[]`, adapt the `jq` path and record
   the shape found. The baseline status must be `frozen` or `approved`; the
   `sha256sum -c` check must say `OK`; section 8 of the Ctx 00 document must hold no open
   question. A check that cannot be evaluated is `NOT_EVALUABLE`, never a pass.
3. **On failure** do not start. A Ctx 01 baseline that is not approved or whose
   hash differs is a defect upstream: emit `ESCALATION` `R1` with the reason. An
   open question in Ctx 00 is `ESCALATION` `R0`. Set `status: returned_upstream`
   and hand to `ra-feedback-cycle` for `results/ctx02/CONTEXT-ctx02.md`.
4. **On success** create `results/ctx02/` as in `references/records.md`, write
   `results/ctx02/state.json` with the input hashes, and emit `STAGE_START`.
5. **Disposition.** For each `REQ` and `LIM` write, into `dispositions` of
   `results/ctx02/items.json`, one code from `item-schema.md` (`architectural`,
   `detail-for-Ctx03`, `not-architectural`) and a one-line reason that quotes the
   statement. Read `relevante_arquitectura` of each `REQ` as the starting point (absent
   means true, its default). The disposition code is still decided here; if it
   differs from the mark, say so in the one-line reason. `architectural` means it changes a decision, a component or the
   hardware selection; `detail-for-Ctx03` means it fixes a value or procedure
   that Ctx 03 specifies.
6. **DFR.** For each `DFR` list its `etapa_responsable`. A `DFR` whose stage is
   `Ctx02` must be closed in this stage; leave `action` null until a `DEC`
   closes it, then write the `DEC` id. The others are `travels-intact`.
7. **Candidates.** List each solution named in Ctx 00 section 7 as a candidate
   alternative, not a decision, with its `SRC-nn`.
8. Write `results/ctx02/substages/02.1.md`: input summary, check results, the disposition table,
   the `DFR` table, the candidates. Then hand to `ra-gap-questions` (`input`).

## Output format

`results/ctx02/state.json`, `results/ctx02/items.json` (`dispositions`, `dfr`),
`results/ctx02/substages/02.1.md`, event `STAGE_START` (or `ESCALATION`).

## Do not

- Do not modify any Ctx 00 or Ctx 01 file or item.
- Do not judge whether the frozen content is complete; a content defect returns
  upstream.
- Do not leave a `REQ`, `LIM` or `DFR` without a disposition.
- Do not treat a Ctx 00 suggested solution as decided.
- Do not load any fixture or example dataset.

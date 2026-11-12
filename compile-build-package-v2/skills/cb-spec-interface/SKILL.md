---
name: cb-spec-interface
description: Specifies a module of kind interface — inter-block schemas with versions, error codes with detection, retries and limits, storage format and retention, and reporting layouts — so producers and consumers agree exactly; loaded by cb-spec-module for that kind, not invoked directly.
---

# cb-spec-interface

## Objective

Fix every boundary between blocks and between the node and the outside: the data
that crosses it, its structure and version, what failure looks like, what the
system does about it, and how long data is kept. Producers and consumers must
agree with no further negotiation.

## Inputs

The input pack of `cb-spec-module`, `references/parameter-rules.md`,
`references/module-template.md`, the class row of `references/spec-classes.md`,
and the `SCH`/`ERR` already in `results/ctx03/items.json`.

## Steps

1. **Boundaries.** From the Ctx 02 `DEC` of class `inter-block-representation` and
   the `DEP` list, list every boundary this module owns, each as producer →
   consumer (`CMP` or `SPEC` ids). A boundary with no consumer is dropped with a
   reason; a consumer with no producer is a defect to resolve.
2. **Schemas.** One `SCH` per boundary: serialization and encoding, byte order,
   fields with type, unit, valid range, required or not, and meaning; the level or
   time reference of every field; `version` as `MAJOR.MINOR`; the compatibility rule
   (additive optional field = minor; removing or re-typing = major); size and rate
   limits with units. Field names, types and units must equal those in the
   producing module's digest.
3. **Error handling.** From the Ctx 02 `error-handling` decision and from the edge
   cases of the other modules: a state table (state, event, action, next state) and
   one `ERR` per failure at each boundary with code `E-<AREA>-<nnn>` unique in the
   package, the detection check and its `PAR` ids, the response, retries
   (maximum, interval, backoff, units), the limit after which the response
   changes, the final state and the `SCH` of the record that reports it. Retry
   counts and intervals come from the time budgets (derived, written out).
4. **Storage** (when the class applies): what is stored at what level, record or
   file format, naming, rotation, sizing derived as rate times retention times
   record size, compared with the storage capacity of the `HW` with margin;
   retention value from the `REQ`/`DFR` window; integrity check; behaviour when
   free space falls below the floor.
5. **Reporting** (when the class applies): message layouts as `SCH`, report period
   and queue size derived from the `REQ`, behaviour when the destination is
   unreachable (buffer limits, drop policy, retry), and the clock or ordering
   guarantee.
6. **Choose values** by `references/parameter-rules.md`. Close the `DFR` windows
   with a value inside `horquilla` and write the closing criterion check. A choice
   that trades retention or reporting cost against something the human owns is a
   candidate question with a provisional value.
7. **Consistency before closing.** Every producer and consumer of the module's
   `SCH` exists in the register or the Ctx 02 components; every `ERR` code is
   unique:
   ```
   jq -r '.items[]|select(.type=="ERR")|.code' results/ctx03/items.json | sort | uniq -d
   jq -r '.items[]|select(.type=="SCH")|"\(.id) \(.producer) \(.consumer)"' results/ctx03/items.json
   ```
   (the first command prints nothing when codes are unique).
8. **Resource fit** (`io-throughput`, `storage`, `memory`, `time` rows, `final`),
   **worked check** (section 8), items and file with digest.

## Output format

`results/ctx03/specs/SPEC-nn.md` and `SCH`, `ERR`, `PAR` items. `cb-spec-module`
runs the self-check and records.

## Do not

- Do not leave a field without type, unit and range, or a schema without a version.
- Do not reuse an error code or leave a failure without a final state.
- Do not size storage or rates without the written derivation.
- Do not choose a format the producer or consumer cannot satisfy given their `HW`.
- Do not load any fixture or example dataset.

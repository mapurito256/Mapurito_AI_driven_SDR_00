# item-schema.md — fields, provenance and closed codes for Ctx 01

The single authority for the shape of every item and for every closed code the
stage uses. A skill names a code or a field by referring here; it does not
redefine one. If a skill and this file disagree, this file is correct. No skill
invents a code that is not in this file.

All artifacts are in English. Items live in `results/ctx01/record.json` (see `records.md`).

## Item types (closed)

`REQ` · `LIM` · `AC` · `DFR` · `OQ`. No other `type` value exists.

## Provenance (closed, three values)

Every `REQ`, `LIM` and `AC` carries exactly one `procedencia`:

- `declarado` — present in a source or upstream item and cited literally. A
  value, unit or operator **not** inside the literal `cita` is never `declarado`.
- `derivado` — computed from cited material with no free choice; carries a `cita`.
- `propuesto` — the agent chose it because nothing anchored it. Carries no
  `cita`; it is listed for explicit approval at the gate.

## REQ (requirement)

| Field | Values / rule |
|---|---|
| `id` | `REQ-nn` |
| `subtype` | `funcional` · `no-funcional` · `restriction` (closed) |
| `text` | one EARS form below; one `shall`; says *what*, never *how* |
| `procedencia` | the three values above |
| `cita`, `cita_ref` | literal quote and the `SRC`/upstream id it is found in (required when `declarado`/`derivado`) |
| `deriva_de` | list of upstream, `LIM` and `STM` ids this requirement serves |
| `valor`, `unidad`, `operador` | present together when quantitative (bounding ternary) |
| `cita_lim` | the `LIM` id when the bound comes from the envelope |
| `obligatorio`, `relevante_arquitectura`, `asignable` | booleans; default true, a downgrade is recorded in `downgrades` |
| `sembrado` | boolean; true for a requirement adopted from the guardrail catalog; a seeded requirement is never deleted |
| `guardrail_id` | `GRD-nn` of `pipeline-layout/guardrails.md`; required when `sembrado` is true |

### EARS forms (closed, five)

1. Ubiquitous — `The <system> shall <response>.`
2. Event-driven — `When <trigger>, the <system> shall <response>.`
3. State-driven — `While <state>, the <system> shall <response>.`
4. Unwanted — `If <condition>, then the <system> shall <response>.`
5. Optional — `Where <feature is included>, the <system> shall <response>.`

A requirement that fits no form is usually two requirements; split it.

## LIM (limit of SDR / platform / RF environment)

| Field | Values / rule |
|---|---|
| `id` | `LIM-nn` |
| `subtype` | `sdr` · `plataforma` · `rf-environment` (closed) |
| `magnitud`, `operador`, `valor`, `unidad`, `sentido` | all five required |
| `sentido` | `techo` (with `<=`/`<`) · `piso` (with `>=`/`>`) |
| `procedencia` | `declarado` or `derivado` only — **a LIM is never `propuesto`** |
| `cita`, `cita_ref` | literal quote and its source |

## AC (acceptance criterion)

The criterion, not the test. Five elements; the method is the only free choice.

| Field | Values / rule |
|---|---|
| `id` | `AC-nn` |
| `for_req` | the `REQ` id it accepts |
| `metrica` | the observed quantity |
| `operador`, `umbral` | the pass rule; `umbral` is a number, or `{dfr, horquilla}` when deferred |
| `unidad` | unit of the threshold |
| `metodo` | `test` · `analysis` · `inspection` · `demonstration` (closed) |
| `condicion` | the circumstance under which the threshold holds |
| `procedencia` | the three values above |

A threshold nobody can anchor is either `propuesto` (listed at the gate) or
deferred through a `DFR`; it is never invented as `declarado`.

## DFR (controlled deferral)

Survives the gate. Distinct from an `OQ`, which hangs on nothing and must close
in this stage. Four fields plus materiality:

| Field | Values / rule |
|---|---|
| `id` | `DFR-nn` |
| `requisito_gobernante` | an existing `REQ` id |
| `etapa_responsable` | `Ctx02` · `Ctx03` · `implementation` (closed) |
| `criterio_cierre` | an objective closure criterion |
| `horquilla` | `{cota_inferior, cota_superior, unidad}` **or** the string `sin cota` |
| `materialidad_declarada` | boolean |
| `estado` | `abierto` · `cerrado` |

## Transferred material

Transferred = `statements` of `results/ctx00/problem-baseline.json` with category
`constraints` or `expected results` (discarded statements have no category).
`objectives` and `scope` statements are not transferred: G01-5 (K1, K2) covers them.
`problem`, `environment` and `assumptions` statements are not transferred: they feed
LIM (01.3), questions and context.

## OQ (open question)

`id` `OQ-nn`; `estado` `abierta`/`cerrada`; a question raised by the anti-bias
tests in `sr-gap-questions`. Must close in this stage (answered or converted to
an assumption). A question recorded but not asked this run sits in `not_asked`.

## Closed code sets

| Set | Codes | Used by |
|---|---|---|
| Question discard | `already-stated` · `no-impact` · `derivable` | `sr-gap-questions` |
| Transfer discard | `not-a-requirement` · `out-of-scope` · `duplicate` · `incoherent-with-seeded` | `sr-draft-items` |
| Coverage exclusion | `out-of-scope-approved` · `not-applicable` · `covered-elsewhere` | `sr-draft-items`, `sr-gate-check` |
| Omission disposition | `already-covered` · `out-of-scope` · `not-a-gap` | `sr-coverage-contrast` |
| Obligation category | `OB-DATA` · `OB-RF` · `OB-REPORT` · `OB-SAFETY` | `sr-draft-items`, `sr-coverage-contrast` |
| Adjustment class | `R0` (escalate to Ctx 00, not applied) · `R1` · `R2` | `sr-improvement-plan` |
| Change mark | `relaxation` (relaxes a threshold or removes a requirement; needs explicit confirmation) | `sr-improvement-plan` |

## Units

Compare only like dimensions: frequency (Hz/kHz/MHz/GHz), time (s/ms), memory
(MB/GB), power (dBm), ratio (dB), dimensionless, count. No cross-dimension
comparison. A unit outside this list is flagged by `sr-gate-check`, not guessed.

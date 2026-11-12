# spec-classes.md — what Ctx 03 must specify

A checklist, not a catalogue of answers. 03.1 reads the Ctx 02 decisions and
components and creates one `SPEC` per solution that belongs to one of these
classes. A class that no `REQ`, `LIM` or Ctx 02 `DEC`/`CMP` touches is not
invented; it is recorded as `not-applicable` with that statement. A `SPEC`
`class` field takes one of the names below. Every class stops where the builder
begins: Ctx 03 fixes values, procedures, schemas and tests; it does not write code.

Minimum content is what the spec must contain so the builder makes no design
decision. Parameters are named without values; the values come from the inputs.

## Phase A — kind `hardware` (before V1)

| Class | Minimum content | Parameters to close |
|---|---|---|
| `hw-component` | for each Ctx 02 `CMP` with `realization: acquired-spec` (antenna, switch, protection, filter, amplifier, attenuator, cabling, power, enclosure, cooling, storage medium): a catalogue reference, characteristics cited from its snapshot, interfaces, and closure of its `TBD-Ctx03` range | every characteristic range of the card |
| `hw-fixed-reference` | the Ctx 02 SDR and board keep their reference; add the characteristics Ctx 03 needs (sample-rate limit, resolution, interface throughput, core count, memory, operating temperature) cited from snapshots | operating limits used by budgets |

## Phase B — kinds `algorithm`, `procedure`, `interface`, `nfr`, `test`

| Class | Kind | Minimum content | Typical parameters (no values here) |
|---|---|---|---|
| `spectral-estimator` | algorithm | model equations, window family and length, overlap, transform length, resolution bandwidth derived from them, averaging, output unit and reference, calibration-offset application, behaviour on lost or invalid samples, start-up transient, per-frame operation count | window length, overlap, transform length, averaging count, frame period |
| `detector` | algorithm | statistic, noise-floor estimation, threshold rule and the false-alarm target it derives from, hysteresis, minimum occupancy duration, tuning rule | threshold, false-alarm target, estimation window, hysteresis, minimum duration |
| `sweep-strategy` | algorithm | channel list and order, step, dwell, retune-settle time, revisit period, behaviour on retune failure | step, dwell, settle time, revisit period |
| `calibration` | procedure | what is calibrated, reference used (only what the architecture contains), ordered steps, duration, acceptance rule, validity period, stored result schema, failure exit | reference level, averaging time, tolerance, validity period |
| `verification` | procedure | periodic check that the calibration or measurement chain still holds: interval and its justification, reference, acceptance rule, action on failure | verification interval, tolerance, repeat count |
| `cross-site-reproducibility` | procedure | what must be identical across nodes (configuration, versions, references), what is compared, tolerance, evidence to collect, comparison rule | tolerance, number of nodes compared, comparison interval |
| `inter-block-representation` | interface | one `SCH` per boundary between blocks: format, fields with units and ranges, version, compatibility rule, limits | field ranges, message size, rate |
| `error-handling` | interface | state table (state, event, action, next state); one `ERR` per failure at each boundary: detection, response, retries, limits, final state, reported record | retry count, interval, backoff, limit |
| `storage` | interface | what is stored, file or record format, naming, rotation, sizing derived from rate and retention, retention, integrity check | retention period, rotation size, free-space floor |
| `reporting` | interface | message layouts, rates, destinations, behaviour when the destination is unreachable | report period, queue size, retry |
| `learned-model-need` | algorithm | conditional. Active only if Ctx 02 recorded it active. Then the spec imports the output of the `sdr-modelo-especificacion` and `sdr-dataset-especificacion` skills as a digest and ties its input and output to `SCH` ids; it does not redo their work. If Ctx 02 recorded it inactive, no spec | as those skills produce |
| `nfr-performance` | nfr | allocation of each time-bound `REQ` (latency, throughput, real-time deadline) across blocks, with a margin | per-block time budgets |
| `nfr-resources` | nfr | memory partition, storage sizing, thermal and power limits against the closed hardware limits | buffer sizes, thermal limit, power ceiling |
| `nfr-reliability` | nfr | availability, recovery and watchdog values for each `REQ` that demands them | timeout, restart limit, recovery time |
| `acceptance-tests` | test | one `TST` per `AC` plus hardware-qualification and procedure tests | thresholds copied from the `AC` |

## Also check

- Every `REQ` with disposition `specify` is closed by at least one `SPEC`.
- Every Ctx 01 `DFR` with `etapa_responsable` `Ctx03` is closed by a `PAR`; those
  of `implementation` travel intact with a check that their window is still open.
- Every Ctx 02 `CMP` with `range: TBD-Ctx03` has a `tbd_closure` row.
- Every Ctx 02 `unverified` point (for example the board's maximum operating
  temperature and its compute load) is an `OP-nn` closed by a snapshot, a derived
  budget or a hardware-qualification test.
- Solutions in the Ctx 00 "Registered solution suggestions" section enter as
  candidate alternatives of the matching spec, never as decisions made.
- Related procedures are linked: a procedure that consumes the output of another
  (for example verification after calibration) lists it in `depends_on`.

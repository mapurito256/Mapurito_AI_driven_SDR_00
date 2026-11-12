# mvp-criteria.md — the minimum-viable-product criterion and option rules

Used to decide when the agent may decide, and to close a question the human
forces (`CERRAR_FORZADO`). The criteria apply **in this order**; a later one
breaks a tie left by the earlier ones, never overrides them.

## Criterion in order

1. Meets every mandatory `REQ` and `LIM` with cited evidence.
2. Fewest components and interfaces.
3. A catalogue product before an adapted one.
4. Greatest reversibility: it can be changed later without redoing the rest.
5. Availability and cost, only if they are known from a cited source.

An option that fails criterion 1 is eliminated, not ranked. When criterion 1
leaves no option at all, the situation is not a design choice: escalate `R1` (a
mandatory `REQ`/`LIM` cannot be met by any purchasable combination) or `R0` (the
change touches the Ctx 00 scope). Nothing is invented to make an option pass.

## Forced closure

When the human writes `CERRAR_FORZADO: <Q-id>`, the agent picks the most viable
answer by the criterion above, records it `propuesto` with `forced: true`,
cites the criterion step that decided it, and shows it highlighted in the next
presentation. A need found from presentation R3 on is closed the same way with
`forced: by-limit`. The agent never closes a question on its own.

## beyond-MVP

Anything desirable but not required by a `REQ` goes to the `beyond_mvp` list of
the document, with a one-line reason. It never becomes a `DEC` or a `CMP`. A
component that cannot cite a `REQ` or `LIM` is a scope defect (G02-4).

## Number of hardware options

- An option is one coherent set: SDR reference + compute-board reference + the
  RF-path variant that this pair implies.
- Default: 2 or 3 options. Maximum 3.
- One option only is allowed with a dominance statement (`item-schema.md`):
  it passes every eliminatory criterion and is no worse than any plausible
  alternative on any ordinal criterion. The discarded alternatives are listed in
  a few lines with their cause. Options are never forced to reach two.
- Search cap: at most 6 references evaluated per category (SDR, board).
- More than 3 options is a warning, not a gate failure.

## Hardware is bought

Only the SDR and the compute board receive a reference. Everything else gets a
characteristic card. A component that would have to be manufactured is a scope
defect (G02-4).

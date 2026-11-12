# mvp-criteria.md — the minimum-viable-product criterion and option rules

Used to decide when the agent may decide, and to close a question the human
forces (`CERRAR_FORZADO`). The criteria apply **in this order**; a later one
breaks a tie left by the earlier ones, never overrides them.

## Criterion in order

1. Meets every mandatory `REQ` and `LIM` and every `AC` threshold, with cited
   evidence.
2. Fits the hardware with the planning margins of `references/parameter-rules.md`.
3. Fewest components, interfaces and parameters.
4. A catalogue product before an adapted one; a standard format before a custom one.
5. Greatest reversibility: it can be changed later without redoing the rest.
6. Availability and cost, only if known from a cited source.

An option that fails criterion 1 is eliminated, not ranked. When criterion 1
leaves no option at all, the situation is not a design choice: escalate `R1` (a
mandatory `REQ`/`LIM`/`AC` cannot be met), `R2` (the architecture or the Ctx 02
hardware must change) or `R0` (the Ctx 00 scope). Nothing is invented to make an
option pass.

## Forced closure

When the human writes `CERRAR_FORZADO: <Q-id>`, the agent picks the most viable
answer by the criterion above, records it `propuesto` with `forced: true`, cites
the criterion step that decided it, and shows it highlighted in the next
presentation. A need found from presentation R3 on is closed the same way with
`forced: by-limit`. The agent never closes a question on its own.

## beyond-MVP

Anything desirable but not required by a `REQ`, `LIM` or `AC` goes to the
`beyond_mvp` list with a one-line reason. It never becomes a `HW`, `PAR`, `PRC`
or `SPEC`.

## Number of hardware options (03.2)

- The unit is one component (one Ctx 02 `CMP`), not a whole bill of materials.
- **At most two options per component.** Offer a second only if it is a real
  alternative on at least one criterion.
- **One option only** when it is highly viable and far above the rest: it passes
  every eliminatory criterion and is no worse than any plausible alternative on
  any ordinal criterion. Write a dominance statement and list the discarded
  alternatives with their cause. A second option is never forced.
- Search cap: at most 6 references evaluated per component.
- More than two options is a warning, not a gate failure, and never allowed.

## Hardware is bought

Every `HW` is a catalogue product with a datasheet snapshot. Nothing is
manufactured or adapted. A component that would have to be manufactured is a
scope defect (G03-3) and, if no purchasable option exists, an escalation.

## Parameter choices

A choice among parameter candidates follows `references/parameter-rules.md`
section 2. At most two alternatives enter a `DEC` of class `design-choice`; a
third plausible one is a `decision` question with at most three options.

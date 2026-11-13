# module-template.md — shape of `results/ctx03/specs/SPEC-nn.md`

One file per specification module. The file is self-sufficient: it copies the
requirement text and every decided value in, and never says "see the decision".
Empty template only; no worked example and no case value appears here. Fields in
`<...>` are placeholders. Sections stay in this order; a section with nothing to
say reads `none` with the reason.

```markdown
# SPEC-<nn> — <title>
Kind: <hardware|algorithm|procedure|interface|nfr|test> · Class: <class> · Status: <pending|in-progress|done|reopened>
Depends on: <SPEC ids with reason> · Ctx 02 refs: <DEC/CMP ids>

## 1. What this module must satisfy
- <REQ/LIM/AC/DFR/CMP/OP id>: <literal text, value, unit, operator copied from the source>

## 2. Inputs, outputs and boundaries
- Inputs: <SCH ids and sources> · Outputs: <SCH ids and consumers>
- What this module does not do: <one line each>

## 3. Method
<equations in plain text with every symbol, unit and range defined; or the ordered
procedure steps; or the interface and state tables. No executable code; pseudocode
only inside a `text` block.>

## 4. Parameters
| PAR | Name | Value | Unit | Range | Provenance | Critical | Rationale and sensitivity |

## 5. Hardware and resource fit
| RB | Resource | Demand (operation written out) | Capacity (HW, SRC) | Margin | Verdict |

## 6. Behaviour on errors
| ERR | Code | Condition | Response | Retries and limits | Final state |

## 7. Verification hooks
- <AC id> verified by <TST id or "defined in the test spec"> · hardware-qualification: <TST id>

## 8. Worked check
<the arithmetic that shows the parameters of section 4 satisfy the thresholds of section 1
and the budgets of section 5, one line per step with units>

## 9. Decisions, provisional values and questions
- <DEC id or Q-03-nn>: <what was decided or assumed, provisional value, who uses it>

## 10. Digest (read by dependants; at most 15 lines)
- Published parameters: <PAR ids with values and units>
- Published schemas: <SCH ids with versions>
- Constraints the dependants must respect: <lines>
```

Sections 1 to 8 are copied verbatim into the implementation document
(`implementation-doc.md`): they never contain a question id (`Q-03-nn`), a
provisional marker, a gate, a datasheet snapshot id (`SRC-03-nn`) or a remark about
the process. Those belong only to sections 9 and 10, which are not copied. State a
value as the value, with its unit, never as "pending the answer to Q-03-nn".

Rules: every `PAR`, `PRC`, `SCH`, `ERR` named in the file exists in
`results/ctx03/items.json` with the same values; a value is written once in the
items and copied here, and the two must agree. Section 10 is the only part a
dependant module reads in full; everything else it takes with `jq` from the items.

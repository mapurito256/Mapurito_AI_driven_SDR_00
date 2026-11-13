# Input selection for new ctx00 runs

Apply only after checking methodology progress. Resume uses the admitted inputs
and immutable intake already recorded; never silently replace them using the
current contents of `inputs/`. A maintenance discussion or quoted command example
is not a request to execute the methodology.

## Selection before any stage writes

1. If the user explicitly identifies one or several files (with `@inputs/...`,
   plain paths, or equivalent wording), use that ordered set only. Check each is
   an existing regular file inside project `inputs/`, not a directory or a
   symlink escape. An invalid explicit reference is an error, not permission to
   substitute a discovered file. Repeated references select the same file once.
2. If no files are referenced, list visible regular files directly inside
   `inputs/` without reading their contents. Ignore dotfiles such as `.gitkeep`;
   do not guess semantic relevance or treat subdirectories as documents.

| Files found | Required action |
|---|---|
| None, or folder missing | Stop; ask the person to place the input document(s) in `inputs/`. |
| Exactly one | Select it automatically, announce the selected path and validate it; no selection confirmation is required. |
| More than one | Immediately ask which file or files to use (and order if relevant), then stop. Do not read their material, initialize results or choose all. |

Explicit selections override the discovery count. When the selected set and order
are unambiguous, continue with format checks and ctx00 admission. A generic
`Start methodology` / `Run methodology` with no existing run starts ctx00 only;
only an explicit full-run request enables the full-run mode. `Continue` with no
run uses the same input selection. `Start with ...` also triggers this entry.

## Format and provenance

The current stage contract accepts Markdown/plain text. Selecting a sole PDF or
other binary is still a valid selection, but not yet valid intake: stop and ask
for its Markdown/text copy. Do not silently choose another file or infer that a
successful PDF parser changed the format contract. Do not translate or summarize
source content to make it acceptable.

Multiple selected text files form one ordered intake for one ctx00 run, not
parallel runs. Preserve each original file, hash and input order in the existing
`STAGE_START` payload and in unnumbered input headings of `intake.md`; the first
line remains `Total statements: N`. Keep literal `STM` text unchanged and number
statements continuously across inputs. The frozen baseline still points to the
single immutable intake. Conflicting statements remain distinct and are handled
by the existing question/consistency procedure, not source-priority assumptions.

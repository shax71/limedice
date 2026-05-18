---
name: kb-postmortem
description: Capture a KB insight after fixing a bug — extract the root cause, dedupe against existing insights, and write a reusable prevention rule. Run after closing a bug ticket, merging a fix, or when Scott says a bug is fixed.
kb-modules:
  kb-postmortem/identify-fix: "2026-05-18T06:16:10.170Z"
  kb-postmortem/extract-pattern: "2026-05-18T06:16:10.180Z"
  kb-postmortem/dedupe-check: "2026-05-18T06:16:10.201Z"
  kb-postmortem/write-insight: "2026-05-18T06:16:10.209Z"
---

# KB Postmortem

Convert a bug fix into a reusable prevention rule, stored as a KB Insight so future Claude sessions catch the same class of mistake before it lands.

Work the four steps in order. Stop at any step if the fix is not postmortem-worthy.

## KB API

All writes go to `http://localhost:3012/api/v1/...`. Ticket ops use `KB_URL=http://localhost:3012 kb ticket <command>` with `--actor claude`.

## 1. Identify the Fix

<!-- kb:kb-postmortem/identify-fix:begin -->
Pick the fix to analyse. Default precedence:

1. **Active ticket** — if the session was working a KB ticket and it was just closed or moved to `done`/`testing`, use that ticket. Pull linked commit(s) via `git log --grep "#<ticket-id>"`.
2. **Latest commit** on the current branch: `git log -1 --stat`.
3. **Current uncommitted diff** if no recent commit: `git diff HEAD` — but ask Scott to commit first. Postmortems on uncommitted code drift before the insight is written.

Report:
- Commit short-sha + subject (or ticket id + title)
- Files touched (top 5)
- Project name (lowercased cwd basename, override with `--project <name>`)

Confirm with Scott: **"Postmortem on `<subject>`? (yes / different fix / skip)"** — if `skip`, stop here.
<!-- kb:kb-postmortem/identify-fix:end -->

## 2. Extract the Pattern

<!-- kb:kb-postmortem/extract-pattern:begin -->
Goal: distil a reusable **prevention rule**, not a diary entry. Ask Scott three questions (use a single `AskUserQuestion` with three sub-questions if available, otherwise sequential):

1. **Symptom** — what did the user / test / runtime observe? (one sentence)
2. **Root cause** — which line or decision actually caused it? Be specific: a missing null check, a wrong `as` cast, a race, a misread API contract, a missing migration step.
3. **Why it was missed** — pick the category that fits best:
   - `types` — type-system blind spot (`any`, `as`, missing discriminated union, weakened generic)
   - `tests` — test gap (untested branch, missing edge case, mocked the wrong layer)
   - `convention-drift` — an existing convention or insight already covered this and wasn't followed
   - `environment` — worked locally, broke under different conditions (LAN, Windows, sandbox, prod, container)
   - `spec-ambiguity` — the requirement was imprecise

Then **you** synthesise the prevention rule — **one imperative sentence** Claude can apply next time.
- Bad: "be careful with secure contexts"
- Good: "When using `crypto.randomUUID` or `navigator.clipboard`, provide a non-secure-context fallback because LAN access (`http://<lan-ip>`) is not a secure context."

If you cannot phrase a rule that would have prevented this bug, the fix is not postmortem-worthy — skip and tell Scott why (typically: cause was external, or the fix is a one-off cleanup).
<!-- kb:kb-postmortem/extract-pattern:end -->

## 3. Dedupe Check

<!-- kb:kb-postmortem/dedupe-check:begin -->
Avoid stamping a near-duplicate on top of an existing insight.

1. Derive search tags from:
   - File area (`ui`, `api`, `db`, `audio`, `hooks`, `migrations`, `dsp`, `auth`, `cli`, `tests`, …)
   - Bug category from `extract-pattern` (`types`, `tests`, `convention-drift`, `environment`, `spec-ambiguity`)
   - Project tag

2. Query for each topical tag:
   ```
   kb query insights --tags <tag>
   kb query insights --tags <tag> --project <project>
   ```

3. Read any candidate whose title looks adjacent. If one covers the same case:
   - **Update** it — bump `confidence` to the next tier (`low` → `medium` → `high`), bump `frequency` (`once` → `sometimes` → `often`), and append a `## Recurrence — <date>` block to `content` citing the new commit/ticket.
   - PATCH `/api/v1/insights/<id>` with the updated fields.
   - **Do not** write a new insight. Tell Scott which one was reinforced.

4. If nothing matches, proceed to `write-insight`.

**Promotion hint:** when an insight reaches `confidence: high` AND `frequency: often`, flag it to Scott as a candidate for promotion to a Convention (`promoted_to: convention`, `promoted_id: <new convention id>`).
<!-- kb:kb-postmortem/dedupe-check:end -->

## 4. Write the Insight

<!-- kb:kb-postmortem/write-insight:begin -->
POST to `http://localhost:3012/api/v1/insights`:

```json
{
  "name": "<imperative prevention rule, ≤80 chars>",
  "content": "## Symptom\n<one sentence>\n\n## Root cause\n<one to three sentences — cite file path + line where possible>\n\n## Prevention\n<the imperative rule from extract-pattern, expanded with a code example if useful>\n\n## Source\nCommit <short-sha>  •  Ticket #<id-if-any>  •  <ISO date>",
  "tags": ["<topical-tag>", "<bug-category>", "<project>"],
  "project": "<lowercased project>",
  "confidence": "low",
  "frequency": "once"
}
```

Rules:
- `name` IS the prevention rule in imperative form, not a description of the bug. Future Claude sessions search by `name` — make it match what someone *about to make the mistake* would type.
- Include the project tag in `tags` AND set the separate `project` field — they are queried independently.
- `confidence: "low"` + `frequency: "once"` are correct defaults for a first sighting; `dedupe-check` already handles recurrences via PATCH.
- If there is no commit yet, ask Scott to commit first. Insights without a commit reference rot fast.

After POSTing, report:
- New insight id
- The exact `name` field (so Scott sees what future Claude will match against)
- A note if any related Convention or ADR might want updating
<!-- kb:kb-postmortem/write-insight:end -->

<!-- kb:kb-postmortem/write-insight:append -->
For this project, always include `"limedice"` in `tags` and set `"project": "limedice"`.
<!-- kb:kb-postmortem/write-insight:append:end -->

## 5. Wrap Up

Report:
- Insight id (or the id of the updated existing insight)
- A one-line summary Scott can paste into the ticket journal
- If the bug was linked to a KB ticket, add a journal comment: `kb ticket comment <id> "Postmortem captured as insight #<insight-id>." --actor claude`

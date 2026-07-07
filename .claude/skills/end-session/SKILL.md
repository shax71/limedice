---
name: end-session
description: Limedice session cleanup — quality checks, ticket updates, knowledge capture
kb-modules:
  end-session/notify-chatterbox: "2026-06-18T16:40:17.414Z"
  end-session/record-session: "2026-07-06T20:01:12.640Z"
  end-session/session-report: "2026-07-06T20:01:35.219Z"
  end-session/code-quality: "2026-07-02T12:15:28.520Z"
  end-session/file-growth: "2026-07-06T20:01:16.712Z"
  end-session/testing: "2026-05-30T18:17:14.715Z"
  end-session/git-hygiene: "2026-05-30T18:17:14.716Z"
  end-session/ticket-update: "2026-05-30T18:17:14.717Z"
  end-session/capture-insights: "2026-05-30T18:17:14.719Z"
  end-session/system-models-drift: "2026-06-11T16:43:41.072Z"
---

# Session Stop

**Output discipline:** every step before the final Session Report prints one line — outcome only, plus anything that failed. Required prompts (file-growth ticket decisions and the success/push questions) are exempt: ask only the question, wait, then print the step's outcome line. All other detail defers to the Session Report, the single block Scott reads.

Work through each section. Do not skip steps.

## KB CLI

All ticket operations: `KB_URL=http://localhost:3012 kb ticket <command> [args]`
Always use `--actor claude` when Claude Code creates or modifies tickets.

## 0. Notify Chatterbox

<!-- kb:end-session/notify-chatterbox:begin -->
As the **first action** of this skill, announce that session-end was triggered. Best-effort and non-blocking — chatterbox is a separate LAN service; ignore any failure and never let it hold up the rest of the skill.

```bash
chatterbox post "Session End Triggered" --project "$(basename "$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")" | tr '[:upper:]' '[:lower:]')" --author claude 2>/dev/null || true
```

Print one line: `chatterbox: notified` on success, or `chatterbox: skipped (unreachable)` if the command failed. (Server defaults to `http://localhost:8765`; override with `CHATTERBOX_SERVER_URL`.)
<!-- kb:end-session/notify-chatterbox:end -->

## 1. Code Quality

No build step for this project. Manually verify:

- [ ] `index.html`, `styles.css`, `main.js` parse without errors (open in browser, check DevTools console)
- [ ] No raw hex colours outside `colors_and_type.css` — design tokens only
- [ ] No commented-out code left behind
- [ ] No `console.log` or debug output left in `main.js`
- [ ] No stock medical imagery introduced
- [ ] UK English throughout, sentence-case headings

Optional lint pass:
- `npx html-validate index.html`
- `npx stylelint "**/*.css"`

## 2. Testing

No automated tests. Verify in browser:

- [ ] Site renders at `http://localhost:8080/` without console errors
- [ ] Hero, services, pull-quote, writing, about, contact sections all display
- [ ] Mobile nav toggle works (drawer opens, closes on link click)
- [ ] Contact form validation fires on empty submit; mailto opens on valid submit
- [ ] Section highlight in top nav tracks scroll position
- [ ] Lucide icons render (no empty `<i>` tags)

## 3. File Size Check

Static site — file size bounds are lenient but still worth watching:
- `wc -l index.html styles.css main.js`
- `index.html` over 500 lines: consider extracting sections into partials (would require a build step)
- `styles.css` over 800 lines: consider splitting by concern (tokens, layout, components)

## 4. Project-Specific Checks

- [ ] Design tokens referenced via `var(--color-*)` not raw hex
- [ ] WCAG AA contrast honoured — no lime text on white/mint
- [ ] Focus rings present on all interactive elements (2px terracotta)
- [ ] `_design_extract/` unmodified
- [ ] No production copy uses emoji

## 5. Git Hygiene

- [ ] All changes committed with meaningful messages
- [ ] No accidental commits of `_design_extract/`, zip files, or `.DS_Store`-style junk
- [ ] `.gitignore` covers `node_modules/`, OS metadata, editor files

## 6. Ticket Update

If a ticket was being worked on:
- [ ] Status updated: `KB_URL=http://localhost:3012 kb ticket update <id> --status <status> --actor claude`
- [ ] Journal comment describing what was accomplished
- [ ] **If status set to `testing`:** Generate and POST a test plan

## 7. KB Reflection

Review the session for lessons, patterns, decisions, and gotchas worth preserving in KB. **Do NOT publish yet** — present a proposal table for Scott to review.

### 7a. Gather candidates

1. What went wrong and was fixed?
2. What worked well and should be repeated?
3. What decisions were made and why?
4. Are any existing Insights ready for promotion?
5. Do any existing Conventions or System Models need updating?

### 7b. Check for overlaps

For each candidate, query KB to confirm it doesn't already exist:
- `KB_URL=http://localhost:3012 kb query insights --tags <topic>`
- `KB_URL=http://localhost:3012 kb query conventions --tags <topic>`

### 7c. Present proposal table

| # | Type | Name | Tags | Action | Rationale |
|---|------|------|------|--------|-----------|
| 1 | Insight | "..." | tag1, tag2 | **New** | Why this matters |

Tag with `cross-project` if the lesson applies beyond this project.

### 7d. Publish approved entries

Only publish rows Scott approves.

## 8. Record Session


<!-- kb:end-session/record-session:begin -->
Ask Scott **one combined prompt** — this is the single interactive stop for session wrap-up (file-growth decisions, if this skill has that check, were already taken there):

**Was this session successful** (`success` / `partial` / `failure`; enter = `unknown`) **— and push to GitHub afterwards?** (yes/no)

If the reply does not clearly contain both answers, ask one clarifying question. Carry the push answer forward to the Export/Push step — do not re-ask there. The success answer determines both the recorded `session_result` and the Session Report `Result` line — they must agree.

Then record the session, trigger co-occurrence, and close the anchor in one call (non-blocking — if it fails, report the error and continue):

```bash
kb session end \
  --summary "<1-2 sentence summary>" \
  --decisions "<key decisions made>" \
  --outcome "<result>" \
  --follow-ups "<any follow-up items>" \
  --result <success|partial|failure|unknown>
```

(`--summary -` reads long text from stdin.) The command POSTs the session record (`files_modified` computed from the session anchor's `start_sha`, degrading to working-tree changes when the anchor is missing or foreign), fires the co-occurrence update with the anchor's live `session_id` (not the history entry's id), and stamps `ended_at` on the anchor so the next `/start-session` sees a clean close. It prints one line — `session recorded #<id> (<result>) · co-occurrence <✓|—> · anchor closed <✓|—>` — carry those facts into the Session Report's `session` line.
<!-- kb:end-session/record-session:end -->

## 9. Export DB and Push

1. `KB_URL=http://localhost:3012 kb export /Users/dev/source/repos/KnowledgeBench/kb-data.json`
2. Commit the export in the KnowledgeBench repo if changed.

Use the push answer from the combined success + push prompt (do not re-ask). Commit the export regardless of the push answer — never leave it staged or uncommitted. Push only on yes.

## 10. Session Report

<!-- kb:end-session/session-report:begin -->
Produce one fixed-shape **Session Report** block — same lines, same order, every session, so each fact is findable in the same place. The rendering lives in the CLI: build a JSON fact payload and pipe it through:

```bash
echo '<payload json>' | kb session report -
```

Paste the command's output verbatim into a ` ```diff `-fenced code block (the language tag is what colours it in the terminal).

**Terse-steps rule (applies to the whole skill):** while working the steps before this one, print one line per step — outcome only, plus anything that failed. Required prompts (file-growth ticket decisions and the success/push questions) are exempt: ask only the question, wait, then print the step's one outcome line. All other detail defers to this report — it is the only thing Scott should need to read.

**Facts only:** populate the payload exclusively from what the earlier steps actually observed. Omit a line's key when its step didn't run or found nothing — the CLI renders it as a red `—` line; never infer success. The step 5 success answer sets both the `result` line and the recorded session result — they must agree.

Payload keys (all optional): `result`, `qa`, `growth`, `git`, `tickets`, `insights`, `models`, `session`, `docs` — each `{"status": "good|bad|warn|neutral", "text": "<line content>"}`, where good renders green `+`, bad red `-`, warn orange `!`, neutral plain. A line mixing states takes the worst element's status (`good` only when everything on the line is healthy). Plus `followUps` (array — every unresolved item carried forward, one per entry, ticket # where one exists; the safety net for anything deferred with "later"), `efficiency` (array — top 1–2 findings from the session-reflection step), and `next` (string).

`git` and `next` are auto-derived when omitted (commits since the anchor's `start_sha` + tree state; the head of `kb ticket next`, which floats any `kb ticket sequence` override to the top). Supply `git` yourself to include the push outcome, and `next` when a deliberate next-session order was agreed — persist that first with `kb ticket sequence set <ids> --note "<why>"` so the pin survives the context reset.

Line content conventions: Result `<✔ success | ◐ partial | ✘ failure | ? unknown> — <one-line outcome vs the session goal>`; QA `build <✓|✗|—> · lint <✓|✗ (N errors)|—> · tests <passed>/<total>`; Tickets one entry per ticket touched (status transition where one happened, otherwise `commented`/`created`); Session `recorded #<id> (<result>) · co-occurrence <✓|—>` from the `kb session end` output line. Hard cap ~30 lines — compress a long line to counts (e.g. `5 tickets advanced (#1611 #1266 …)`) and put the detail in a ticket comment or KB entry, referenced by id.

## After the report — prompt to clear context

The Session Report is the final output of `/end-session`. Once it has printed and the session has actually closed, emit one closing line prompting the user to reset context before the next session:

> ✅ Session closed. Run `/clear` now to start the next session with a clean context.

`/clear` is a user-typed CLI command — Claude cannot run it itself, so this is a reminder for the user to type, not an action to perform. Print it exactly once, immediately after the report block, then stop. Skip it only if `/end-session` did not run to completion (e.g. the user aborted partway).
<!-- kb:end-session/session-report:end -->

<!-- kb:end-session/code-quality:begin -->
- [ ] All code builds without errors
- [ ] No commented-out code left behind (unless explicitly marked TODO)
- [ ] No raw debug output in production code (`console.*` in JS/TS, `println!`/`eprintln!`/`dbg!` in Rust, `print()` in Python) — use the structured logger
- [ ] Code follows existing architecture patterns
<!-- kb:end-session/code-quality:end -->

<!-- kb:end-session/file-growth:begin -->
Flag source files that grew large **this session** and may warrant a refactor ticket. Advisory only — Scott decides whether to raise the ticket. Skip silently if nothing crosses a threshold.

```bash
kb file-growth --session
```

`--session` scopes to this session's commits by reading `start_sha` from the session anchor written by `/start-session` (cwd-validated — a stale or foreign anchor is treated as absent and the command degrades to working-tree changes only, printing a note saying so).

The command lists each changed source file at or over its per-language line threshold, skipping generated/vendored paths and deletions, and annotates any file already covered by an open refactor ticket (deduped by filename stem). It scopes strictly to files this session touched, so it will not re-nag pre-existing large files. Add `--json` for structured output.

For each flagged file with **no** open refactor ticket, report one line and ask Scott: **"Raise a refactor ticket for <file>? (yes/no)"**. On yes:
`kb ticket new --project <project> --type task --title "Refactor: split <file> (<N> lines)" --actor claude`

Do not auto-create tickets.
<!-- kb:end-session/file-growth:end -->

<!-- kb:end-session/testing:begin -->
- [ ] All tests pass
- [ ] New breakable logic has unit tests
- [ ] Tests are meaningful and test actual behaviour (not just syntax)
- [ ] Edge cases identified and tested (or documented as known limitations)
<!-- kb:end-session/testing:end -->

<!-- kb:end-session/git-hygiene:begin -->
- [ ] All changes are committed with meaningful messages (what and why)
- [ ] Commits include related changes only (no unrelated fixes mixed in)
- [ ] No accidental commits of temp files, `node_modules/`, or `dist/`
<!-- kb:end-session/git-hygiene:end -->

<!-- kb:end-session/ticket-update:begin -->
If a ticket was being worked on, update it:
- [ ] Status updated via `kb ticket update <id> --status <status> --actor claude`
- [ ] Journal comment added describing what was accomplished
- [ ] Any discovered edge cases or limitations documented in journal comments
- [ ] **If status set to `testing`:** Run `/test-plan <id>` to generate and POST a test plan. Every ticket entering Testing must have a test plan.
<!-- kb:end-session/ticket-update:end -->

<!-- kb:end-session/capture-insights:begin -->
Review the session for patterns worth preserving. **All lessons learned are first captured as Insights**, not Conventions or ADRs.

For each pattern observed:
1. Check if it already exists: `kb query insights --tags <topic>`
2. If new, create via API: `POST /api/v1/insights` with name, content, tags

**Promotion criteria** — optionally promote an Insight if:
- **→ Convention**: observed multiple times, low context sensitivity, safe to enforce
- **→ ADR**: involves trade-offs, impacts architecture, committing to a direction

Update the Insight's `promoted_to` and `promoted_id` fields when promoted.

Not every observation is worth an Insight — only save patterns that are non-obvious and likely to recur.
<!-- kb:end-session/capture-insights:end -->

<!-- kb:end-session/system-models-drift:begin -->
Check whether KB system-models for this project have drifted from what the session actually changed. Goal: catch documentation drift, not generate noise. If no models overlap the session's scope, do nothing.

1. Identify what this session touched:
   - Files: `git diff --name-only <start_sha>..HEAD`, using `start_sha` from the session anchor (`~/.knowledgebench/session-current-<project>.json`, written by `/start-session`). If the anchor is missing, fall back to `git log --oneline --since=<session-start>`.
   - Skills: any edits under `.claude/skills/` — these are usually documented in a Claude Code or skills system-model.
   - MCP / CLI surface: edits to `src/mcp-server.ts`, `src/cli.ts`, top-level routing, or anything described in an integration system-model.
   - Schema / migrations: edits under `src/db/migrations/` — usually documented in deployment or data-model system-models.

2. List candidate system-models:
   `KB_URL=http://localhost:3012 kb query system-models --project <project> --fields id,name,tags,updated_at`

3. For each candidate whose tags or topic overlap the touched areas:
   - Read it: `kb get system-models <id>`
   - Decide: does the session's change contradict, extend, or supersede what the model documents?
     - If a documented behaviour changed (e.g. a flag, command, file path, tool list) → drift.
     - If the session only added a new behaviour the model doesn't mention but should → drift.
     - If the model is silent on the area touched → not drift.
   - On drift, either:
     a. Update the model in this session if the revision is small and self-evident (PUT /system-models/<id> with the corrected content), OR
     b. File a follow-up ticket with the specific drift identified (`kb ticket new --type task --title "Refresh system-model #<id>: <area>"`).

4. If the session shipped a substantial new surface (e.g. a new CLI command family, a new MCP tool family, a new domain) and no system-model documents it, consider creating one — but only if Scott has not asked you to defer.

This step is conditional: skip silently if step 3 finds no overlap. Do not run a blanket "check every model" scan — that produces false positives and burns tokens.
<!-- kb:end-session/system-models-drift:end -->

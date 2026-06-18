---
name: end-session
description: Limedice session cleanup — quality checks, ticket updates, knowledge capture
kb-modules:
  end-session/notify-chatterbox: "2026-06-18T16:40:17.414Z"
  end-session/record-session: "2026-06-11T16:56:39.287Z"
  end-session/session-report: "2026-06-12T13:18:46.112Z"
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

Record session summary via API:
```
POST /api/v1/sessions
{
  "project": "<project>",
  "summary": "<1-2 sentence summary>",
  "decisions": "<key decisions made>",
  "outcome": "<result>",
  "follow_ups": "<any follow-up items>",
  "files_modified": ["<from git diff --name-only <start_sha>..HEAD, using the session anchor's start_sha (cwd-validated); fall back to working-tree changes if no anchor>"],
  "tags": ["<project>"],
  "source_agent": "claude-code",
  "session_result": "<success|partial|failure|unknown>"
}
```

If KB is unreachable, skip — this is non-blocking.

After recording, trigger co-occurrence updates using the `session_id` from the session anchor if present (`~/.knowledgebench/session-current-<project>.json`), otherwise the session ID noted at `/start-session`. Use that id — not the id returned by the session-recording POST, which identifies the history entry, not this live session. If neither is available, skip co-occurrence and report it as `—` in the Session Report:
```
POST /api/v1/maintenance/cooccurrence
{"session_id": "<session-id>"}
```

Finally, mark the anchor closed so the next `/start-session` knows this session ended cleanly (best-effort):
```bash
python - <<'PY' 2>/dev/null
import json, datetime, pathlib
p = pathlib.Path.home() / ".knowledgebench" / f"session-current-{pathlib.Path.cwd().resolve().name.lower()}.json"
d = json.loads(p.read_text())
d["ended_at"] = datetime.datetime.now().astimezone().isoformat()
p.write_text(json.dumps(d, indent=2))
PY
```
<!-- kb:end-session/record-session:end -->

## 9. Export DB and Push

1. `KB_URL=http://localhost:3012 kb export /Users/dev/source/repos/KnowledgeBench/kb-data.json`
2. Commit the export in the KnowledgeBench repo if changed.

Use the push answer from the combined success + push prompt (do not re-ask). Commit the export regardless of the push answer — never leave it staged or uncommitted. Push only on yes.

## 10. Session Report

<!-- kb:end-session/session-report:begin -->
Produce one fixed-shape **Session Report** block. Same lines, same order, every session — each fact is findable in the same place without scrolling back through the earlier steps. Use `—` for a line with nothing to report; never omit a line.

**Terse-steps rule (applies to the whole skill):** while working the steps before this one, print one line per step — outcome only, plus anything that failed. Required prompts (file-growth ticket decisions and the success/push questions) are exempt and do not count against the one-line rule: ask only the question, wait for the answer, then print the step's one outcome line. All other detail defers to this report — it is the only thing Scott should need to read.

**Facts only:** populate the report exclusively from what the earlier steps actually observed. If a field was not run or a count is unavailable, write `—`; never infer success. The answer to "Was this session successful?" determines the `Result` status and the recorded session result — they must agree. The outcome text after the status comes only from observed work; if nothing concise was observed, end the line after the status.

Emit the report as a ` ```diff `-fenced code block — the language tag is what colours it in the terminal. Line-prefix semantics (first character of every report line):

- `+` — healthy/positive line (renders green): successful result, green QA, clean git, recorded session
- `-` — empty (`—`), declined, or failed line (renders red)
- `!` — needs-attention line (renders orange): partial/unknown result, mixed outcomes, the whole *Follow-ups* section
- two leading spaces — neutral line (plain): *Efficiency* and *Next session* sections
- `! ═══ … ═══` — the first and last lines are horizontal rules prefixed with `!` (render orange, matching the Follow-ups section); the title lives inside the opening one

A line that mixes states takes the worst element's prefix (`+` only when everything on the line is healthy, `-` only when entirely empty/negative, otherwise `!`).

```diff
! ═══ Session Report — <project> — <YYYY-MM-DD> ═══

+ Result      <✔ success | ◐ partial | ✘ failure | ? unknown> — <one-line outcome vs the session goal>
+ QA          build <✓|✗|—> · lint <✓|✗ (N errors)|—> · tests <passed>/<total> | —
- Growth      <file (N lines) → ticket #id; file (N lines) → declined | —>
+ Git         <N> commit(s) <short-shas> · tree <clean | dirty: N files> · push <✓ | declined | —>
+ Tickets     <#id old_status→new_status | #id commented | #id created — one entry per ticket touched | —>
+ Insights    <+N captured #ids · promoted → <domain> #id | —>
+ Models      <SM#id updated | drift ticket #id raised | —>
+ Session     recorded #<id> (<result>) · co-occurrence <✓ | —>
+ Docs        PROGRESS.md <✓|—> · memory <N added/updated | —>

! Follow-ups
!   - <every unresolved item carried forward, one line each, ticket # where one exists — or "none">

  Efficiency
    - <top 1–2 findings from the session-reflection step, one line each — `—` if this skill has no reflection step>

  Next session
    - <the single most likely starting point>

! ═══════════════════════════════════════════════════════
```

(The `+`/`-` prefixes shown on the labelled lines above are illustrative — assign each line's prefix from its actual content per the semantics list.)

Rules:

- Every labelled line appears every time — `—` beats absence; the fixed shape is the point. A line whose step doesn't exist in this skill (no file-growth check, no drift check) is simply `—`.
- One entry per ticket touched; status transition where one happened, otherwise `commented`/`created`.
- *Follow-ups* is the safety net: anything deferred with "later" during the session lands here or it is lost.
- Hard cap ~30 lines. If a line would push past the cap, compress it to counts (e.g. `5 tickets advanced (#1611 #1266 #1256 #1542 #1535)`) and put the detail in a ticket comment or KB entry, referenced by id.
<!-- kb:end-session/session-report:end -->

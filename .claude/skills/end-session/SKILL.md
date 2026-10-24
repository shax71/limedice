---
name: end-session
description: Limedice session cleanup — quality checks, ticket updates, knowledge capture
kb-modules:
  end-session/record-session: "2026-10-24T20:12:39.092Z"
  end-session/session-report: "2026-10-24T20:12:39.173Z"
  end-session/code-quality: "2026-07-02T12:15:28.520Z"
  end-session/testing: "2026-05-30T18:17:14.715Z"
  end-session/git-hygiene: "2026-10-21T08:26:55.920Z"
  end-session/ticket-update: "2026-10-24T20:12:39.008Z"
  end-session/capture-insights: "2026-05-30T18:17:14.719Z"
  end-session/system-models-drift: "2026-10-10T12:19:16.437Z"
---

# Session Stop

**Output discipline:** every step before the final Session Report prints one line — outcome only, plus anything that failed. The required prompt (the success/push question) is exempt: ask only the question, wait, then print the step's outcome line. All other detail defers to the Session Report, the single block Scott reads.

Work through each section. Do not skip steps.

## KB CLI

All ticket operations: `kb ticket <command> [args]`
Always use `--actor claude` when Claude Code creates or modifies tickets.

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
- [ ] Status updated: `kb ticket update <id> --status <status> --actor claude`
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
- `kb query insights --tags <topic>`
- `kb query conventions --tags <topic>`

### 7c. Present proposal table

| # | Type | Name | Tags | Action | Rationale |
|---|------|------|------|--------|-----------|
| 1 | Insight | "..." | tag1, tag2 | **New** | Why this matters |

Tag with `cross-project` if the lesson applies beyond this project.

### 7d. Publish approved entries

Only publish rows Scott approves.

## 8. Record Session


<!-- kb:end-session/record-session:begin -->
This step has two parts: the wrap-up question with a draft record, then the handover item dispositions. The final record (`kb session end --file`) runs later, in the Session Report step, after the export, commit and push step. Do not run it here.

### Wrap-up question

Ask Scott the wrap-up questions with the **`AskUserQuestion` multi-choice widget**. Never use a typed free-text prompt: typed replies to multi-part questions arrive incomplete (e.g. "success" answering only one of two) and cause clarifying round-trips. This is the single interactive stop for session wrap-up.

First run `kb ticket sequence show`. Then send **one `AskUserQuestion` call** with stable headers, so that a retry asks the same slot again:
1. **Was this session successful?** — options `success` / `partial` / `failure` / `unknown` (header `Result`).
2. **Push to GitHub afterwards?** — options `yes` / `no` (header `Push`).
3. **Only when `kb ticket sequence show` printed a `Sequence override`** (not `No sequence override set`): **Keep the Next Up pin?** — options `keep` / `replace` / `clear` (header `Pin`). The question names the pinned order and its state. The `replace` option names the new order you propose. With no pin, there is no third sub-question.

If an answer is missing or outside the listed options (widget dismissed, or an "Other" free-text reply), ask **only that sub-question** again with `AskUserQuestion`. Never fall back to a typed prompt. If `AskUserQuestion` is not available in the running agent, show the same options as a numbered inline prompt and wait for the selection.

Act on the answers:
- `Result` sets both the payload `result` and the Session Report `Result` line. They must agree.
- `Push` goes forward to the export/push step (or to the Session Report step when this skill has no push step). Do not ask again there.
- `Pin`: `keep` → nothing. `clear` → `kb ticket sequence clear`. `replace` → read `kb ticket sequence show`, then `kb ticket sequence set <id>,<id>,… --note "<why>"` (one comma list) with the order named in the option. KB never clears a pin automatically.

### Draft

Save the payload as a draft immediately after the wrap-up answers:

```bash
kb session end --draft --file - <<'JSON'
{ …payload… }
JSON
```

The command prints `draft saved <path>` and records nothing. If the session stops before the final record, the next `kb session start` on this machine replays the draft as an `unknown` session. Each time the payload changes, run the command again with the whole payload: each run replaces the draft.

Payload (one JSON object):
- `summary` — 1–2 sentences. `decisions` — the key decisions. `result` — the `Result` answer.
- `items` — the handover changes (next part). Never type `seen`: the CLI adds the ids that `kb session start` printed.
- `report` — the Session Report facts (Session Report step).

### Item dispositions

The handover holds stored reminders, each with a state. List the open ones with `kb session items` (`- [#id] <text> — carried N×`). The reminders that `kb session start` printed at the start of this session are this session's to mark (the anchor's `handover_seen`). The server refuses a mark on any other item (`not_seen`).

For new handover content, decide each candidate in this order:
1. It names an open ticket (a follow-up, a pending check, a caveat) → write it to that ticket's journal: `kb ticket comment <id> "…" --actor claude`. Do not open an item.
2. It is live state that KB or git already shows (commits not pushed, uncommitted files, kept worktrees, human checks pending, idle in-progress tickets, a stale pin, batch plans) → nothing. The resume pack computes these lines.
3. It is work with a clear owner and outcome → a ticket (`kb ticket new …`). A decision that Scott owes → a ticket with `--assignee user`.
4. Anything else → a reminder: one line in `items.open`. When an open item already says the same thing, mark that item and do not open a new one.

Mark each seen item from evidence in KB, git and this session:
- `done` — evidence shows that it happened. Add `{"id": 12, "note": "<the evidence: commit, ticket, answer>"}` to `items.done`.
- `ticketed` — it moved to a ticket. Add `{"id": 15, "ticket": 4107}` to `items.ticketed`.
- `dropped` — only when evidence shows that it is obsolete. Add `{"id": 14, "why": "<names a commit, ticket, file or answer>"}` to `items.dropped`. The server refuses an empty `why`.
- `carry` — every other case, including ambiguous evidence. Add the id to `items.carry`. When in doubt, carry. Never drop on a guess.

An item already carried twice (`carried 2×`) cannot be carried again. Mark it `done`, `dropped` or `ticketed`; a decision that Scott owes becomes a ticket with `--assignee user`. A seen item that you do not mark is carried automatically but shows as `unreviewed` (red), or as `overdue` (red) when it is at the limit. Put each id in one list only. Then save the draft again with the items.

To close or reopen one item at any time: `kb session item <id> --state done|dropped|ticketed [--note <t>] [--ticket <n>]`, or `kb session item <id> --reopen`.

### Final record

The Session Report step runs `kb session end --file -` with the same heredoc payload, completed with the push outcome. The command posts the session and its item changes in one transaction, runs the co-occurrence update, releases the lease, stamps `ended_at` on the anchor, and prints the record line `session recorded #<id> (<result>) · co-occurrence <✓|—> · anchor closed <✓|—>` and then the Session Report.

Act on its output:
- `session end refused: …` — nothing was recorded and the anchor is still open. Run the command again from the checkout where `kb session start` ran. When the folder name is not the project name, add `--project <name>`. Do not report the session as recorded.
- `session record failed: …` and `pending — replays at next kb session start on this machine` — the anchor closed and the payload is kept. Report this on the Session line. A `stored … · request …` hash line means that this session is already recorded with a different payload (`payload_mismatch`): report both hashes.
- `server predates handover items — sent legacy follow_ups` — the KB server is older than handover items, so the new reminders went as text. Report it.
- A usage error for `--file` (a `kb` CLI older than the payload form) — record with the flag form instead: `kb session end --summary "…" --decisions "…" --follow-ups "<the items.open texts, separated by ;>" --result <result>`, then render the report with `echo '<report json>' | kb session report -`.
<!-- kb:end-session/record-session:end -->

## 9. Export DB and Push

1. `kb export --commit --message "chore(kb): export after <short session descriptor>"` — path-free (#1635): writes the per-domain `kb-data/` folder (one JSON file per table) to the `git_backup_path` repo and commits only that folder.

Use the push answer from the combined success + push prompt (do not re-ask). Commit the export regardless of the push answer — never leave it staged or uncommitted. Push only on yes.

## 10. Session Report

<!-- kb:end-session/session-report:begin -->
Produce one fixed-shape **Session Report** block: the same lines in the same order every session, so that each fact is always in the same place. The final record prints it. Run the record now, after the export, commit and push step, so that the record includes the push outcome. If `Push` was `yes` and no earlier step of this skill pushed, push first (`git push origin $(git branch --show-current)`) and put the outcome in `report.git`. Then record:

```bash
kb session end --file - <<'JSON'
{ …the payload from the wrap-up step, with the report completed… }
JSON
```

Paste the command's output verbatim into a ` ```diff `-fenced code block (the language tag is what colours it in the terminal). Act on its record line as the wrap-up step says (a refusal, a pending file, the legacy warning).

**Terse-steps rule (applies to the whole skill):** while working the steps before this one, print one line per step — outcome only, plus anything that failed. The wrap-up question is exempt: ask only the question, wait, then print the step's one outcome line. All other detail defers to this report — it is the only thing Scott should need to read.

**Facts only:** fill the payload's `report` object only from what the earlier steps actually observed. Omit a line's key when its step did not run or found nothing — the CLI renders it as a red `—` line; never infer success. The wrap-up `Result` answer sets both `report.result` and the payload `result` — they must agree.

`report` keys (all optional): `result`, `qa`, `git`, `tickets`, `insights`, `models`, `docs` — each `{"status": "good|bad|warn|neutral", "text": "<line content>"}`, where good renders green `+`, bad red `-`, warn orange `!`, neutral plain. A line mixing states takes the worst element's status (`good` only when everything on the line is healthy). Plus `efficiency` (array — top 1–2 findings from the session-reflection step) and `next` (string). The CLI fills the `Session` line from the record, and builds the **Handover** section from the server's applied result (opened, closed with each state, carried, `unreviewed`, `overdue`, refusals, conflicts), never from the requested dispositions. There is no `followUps` key: anything carried forward is a handover item, a ticket or a ticket journal note (wrap-up step).

`git` and `next` are derived when omitted (commits since the anchor's `start_sha`, tree state and push state; the head of `kb ticket next`, which floats any `kb ticket sequence` pin to the top). Supply `git` yourself to include the push outcome, and `next` when a deliberate next-session order was agreed — persist that order first with the `Pin` answer (`kb ticket sequence set <ids> --note "<why>"`) so the pin survives the context reset.

Line content conventions: Result `<✔ success | ◐ partial | ✘ failure | ? unknown> — <one-line outcome vs the session goal>`; QA `build <✓|✗|—> · lint <✓|✗ (N errors)|—> · tests <passed>/<total>`; Tickets one entry per ticket touched (status transition where one happened, otherwise `commented`/`created`). Hard cap ~30 lines — compress a long line to counts (e.g. `5 tickets advanced (#1611 #1266 …)`) and put the detail in a ticket comment or KB entry, referenced by id.

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
- [ ] No stale worktrees. Run the sweep below from any checkout of the repo; it aborts unless the main checkout is on `main` or `master`. It removes a linked worktree and its branch only when all of these are true:
  - Merging it into the main checkout's branch changes no file (`git merge-tree`).
  - `git status` and `git ls-files -v` succeed, show no assume-unchanged or skip-worktree file, and show no untracked, ignored or modified file except `node_modules`, `dist`, `target` or `.DS_Store`.
  - It is not the worktree you run from, and it is unlocked or its lock names a dead pid.

  Report each `KEPT` line with its reason. Do not force-remove a kept worktree. `check by hand` means every commit has a `git patch-id --verbatim` match on the branch, but the branch changed that content later (a review fix or a revert). Compare `git diff <branch>...<worktree HEAD>` with the current files before you remove it.

```bash
landed() { # $1 = worktree HEAD. 0: merging it into $base changes nothing. 2: no merge commits and every commit has a verbatim patch-id match on $base, but the content differs now (reverted or edited since) — needs a human check. 1: otherwise.
  t=$(git merge-tree --write-tree "$base" "$1" 2>/dev/null) && [ "$t" = "$(git rev-parse "$base^{tree}")" ] && return 0
  [ -z "$(git rev-list --merges "$base..$1")" ] && mb=$(git merge-base "$base" "$1") || return 1
  have=$(git log -p --no-merges --no-renames --no-ext-diff "$mb..$base" | git patch-id --verbatim | cut -d' ' -f1)
  [ -z "$(git rev-list --no-merges "$base..$1" | while read -r c; do p=$(git diff-tree -p --no-renames --no-ext-diff "$c" | git patch-id --verbatim | cut -d' ' -f1); { [ -n "$p" ] && printf '%s\n' "$have" | grep -qxF "$p"; } || echo "$c"; done)" ] && return 2
  return 1
}
here=$(git rev-parse --show-toplevel) && cd "$(git worktree list --porcelain | sed -n '1s/^worktree //p')" && base=$(git symbolic-ref --short HEAD) &&
case "$base" in main|master) ;; *) echo "ABORT: main checkout is on '$base', not main/master"; false ;; esac && git worktree prune &&
git worktree list --porcelain | awk 'BEGIN{RS="";FS="\n"} NR>1{w=h=b=l="";for(i=1;i<=NF;i++){if($i~/^worktree /)w=substr($i,10);else if($i~/^HEAD /)h=substr($i,6);else if($i~/^branch /)b=substr($i,19);else if($i~/^locked/)l=($i=="locked")?"no reason":substr($i,8)}printf "%s\037%s\037%s\037%s\n",w,h,b,l}' |
while IFS=$'\037' read -r w h b l; do
  why=""; pid=$(printf '%s' "$l" | sed -n 's/.*pid \([0-9][0-9]*\).*/\1/p')
  if [ "$w" = "$here" ]; then why="current worktree"
  elif [ "$b" = main ] || [ "$b" = master ]; then why="protected branch $b"
  elif [ -n "$l" ] && { [ -z "$pid" ] || kill -0 "$pid" 2>/dev/null; }; then why="locked: $l"
  else
    landed "$h"; rc=$?
    if [ "$rc" = 1 ]; then why="content not on $base"
    elif [ "$rc" = 2 ]; then why="patches on $base but content changed since; check by hand"
    elif ! s=$(git -C "$w" status --porcelain --ignored --untracked-files=normal) || ! f=$(git -C "$w" ls-files -v); then why="git status failed"
    elif printf '%s\n' "$f" | grep -q '^[a-zS] '; then why="assume-unchanged or skip-worktree files"
    elif [ -n "$(printf '%s\n' "$s" | grep -v -E '^(\?\?|!!) (.*/)?(node_modules|dist|target|\.DS_Store)/?$' | grep .)" ]; then why="uncommitted or ignored files"; fi
  fi
  if [ -n "$why" ]; then echo "KEPT $w ($why)"; continue; fi
  if [ -n "$l" ]; then git worktree unlock "$w"; fi
  git worktree remove --force "$w" && { [ -z "$b" ] || git branch -D "$b" >/dev/null; } && echo "REMOVED $w (${b:-detached})"
done
```
<!-- kb:end-session/git-hygiene:end -->

<!-- kb:end-session/ticket-update:begin -->
If a ticket was being worked on, update it:
- [ ] Status updated via `kb ticket update <id> --status <status> --actor claude`
- [ ] Journal comment added describing what was accomplished
- [ ] Any discovered edge cases or limitations documented in journal comments
- [ ] **If status set to `testing`:** Run `/test-plan <id>` to generate and POST a test plan. Every ticket entering Testing must have a test plan.
- [ ] Every note about an open ticket — a follow-up, a pending check, a caveat — is a journal comment on that ticket (`kb ticket comment <id> "…" --actor claude`), not a handover reminder.
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
Check whether this project's KB documentation — its system-models and its project wiki page — has drifted from what the session actually changed. Goal: catch documentation drift, not generate noise. If nothing the session changed overlaps either, do nothing.

1. Identify what this session touched:
   - Files: `git diff --name-only <start_sha>..HEAD`, using `start_sha` from the session anchor (`~/.knowledgebench/session-current-<project>.json`, written by `/start-session`). If the anchor is missing, fall back to `git log --name-only --format= --since=<session-start>`.
   - Skills: any edits under `.claude/skills/` — these are usually documented in a Claude Code or skills system-model.
   - MCP / CLI surface: edits to `src/mcp-server.ts`, `src/cli.ts`, top-level routing, or anything described in an integration system-model.
   - Schema / migrations: edits under `src/db/migrations/` — usually documented in deployment or data-model system-models.

2. List candidate system-models:
   `kb query system-models --project <project> --fields id,name,tags,updated_at`

3. For each candidate whose tags or topic overlap the touched areas:
   - Read all of them in one Bash call, not one request per model: `for id in <id> <id> …; do kb get system-models $id; done`. (Batch only reads that are not expected to fail: in a parallel Bash batch one failing call cancels the others; one looped call does not have this problem.)
   - Decide: does the session's change contradict, extend, or supersede what the model documents?
     - If a documented behaviour changed (e.g. a flag, command, file path, tool list) → drift.
     - If the session only added a new behaviour the model doesn't mention but should → drift.
     - If the model is silent on the area touched → not drift.
   - On drift, either:
     a. Update the model in this session if the revision is small and self-evident (PUT /system-models/<id> with the corrected content), OR
     b. File a follow-up ticket with the specific drift identified (`kb ticket new --type task --title "Refresh system-model #<id>: <area>"`).

4. If the session shipped a substantial new surface (e.g. a new CLI command family, a new MCP tool family, a new domain) and no system-model documents it, consider creating one — but only if Scott has not asked you to defer.

5. Project wiki page — rules in convention #107 (`kb get conventions 107`). Skip for `ideas` and for a project that is not `active`.
   - **Gate (no reads).** Compare the session's outcomes — the step 1 file list, features shipped, milestones closed or opened, system models or ADRs created or retired — with the convention's *Refresh rule* signals. No signal → skip silently. A file-name match is a candidate, not proof.
   - **Signal** → `kb wiki get <project>`, read the affected section, and confirm that a stated fact is now wrong or missing. Not confirmed → skip silently. Confirmed → rewrite only the stale sections and the footer, then `kb wiki set --title "<Title>" --tags <project>,project-page --content-file <path>`. If the fix needs substantial investigation rather than this session's knowledge, file a ticket instead (below).
   - **No page** (`kb wiki get` prints `No wiki page with slug "<project>".` — not a connection or server error) → do not write one at session end; file a ticket (below). On a read error, report it on the step's outcome line and move on.
   - **Tickets.** Title `Create project wiki page for <project>` or `Refresh project wiki page for <project>: <section>`. Check first with `kb ticket list --project <project> --open --q "project wiki page" --all --format compact`; an open ticket with the exact title → add the new evidence with `kb ticket comment <id> "…" --actor claude` instead. Otherwise `kb ticket new --type task --project <project> --title "<title>" --description "<the stale facts and the session evidence>" --actor claude`.

This step is conditional: skip silently if step 3 finds no overlap and step 5's gate finds no signal. Do not run a blanket "check every model" or "regenerate the page" pass — that produces false positives and burns tokens.
<!-- kb:end-session/system-models-drift:end -->

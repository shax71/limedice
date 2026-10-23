---
name: end-session
description: Limedice session cleanup — quality checks, ticket updates, knowledge capture
kb-modules:
  end-session/record-session: "2026-07-23T10:41:53.232Z"
  end-session/session-report: "2026-10-23T03:39:10.844Z"
  end-session/code-quality: "2026-07-02T12:15:28.520Z"
  end-session/testing: "2026-05-30T18:17:14.715Z"
  end-session/git-hygiene: "2026-10-21T08:26:55.920Z"
  end-session/ticket-update: "2026-05-30T18:17:14.717Z"
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
Ask Scott the session wrap-up questions using the **`AskUserQuestion` multi-choice widget** — never a typed free-text prompt. This is Scott's standing preference: typed replies to multi-part questions arrive incomplete (e.g. "success" answering only one of two), forcing clarifying round-trips. This is the single interactive stop for session wrap-up (file-growth decisions, if this skill has that check, were already taken there).

Issue **one initial `AskUserQuestion` call with two sub-questions** (use stable headers so a retry re-asks the same slot):
1. **Was this session successful?** — options `success` / `partial` / `failure` / `unknown` (header `Result`).
2. **Push to GitHub afterwards?** — options `yes` / `no` (header `Push`).

If an answer comes back missing or outside the listed options (widget dismissed, or an "Other" free-text reply), re-ask **only that sub-question** via `AskUserQuestion` — never fall back to a typed prompt. If `AskUserQuestion` is unavailable in the running agent, present the same options as a numbered inline prompt and wait for the selection.

Carry the push answer forward to the Export/Push step — do not re-ask there. The result answer determines both the recorded `session_result` and the Session Report `Result` line — they must agree.

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

1. `kb export --commit --message "chore(kb): export after <short session descriptor>"` — path-free (#1635): writes the per-domain `kb-data/` folder (one JSON file per table) to the `git_backup_path` repo and commits only that folder.

Use the push answer from the combined success + push prompt (do not re-ask). Commit the export regardless of the push answer — never leave it staged or uncommitted. Push only on yes.

## 10. Session Report

<!-- kb:end-session/session-report:begin -->
Produce one fixed-shape **Session Report** block — same lines, same order, every session, so each fact is findable in the same place. The rendering lives in the CLI: build a JSON fact payload and pipe it through:

```bash
echo '<payload json>' | kb session report -
```

Paste the command's output verbatim into a ` ```diff `-fenced code block (the language tag is what colours it in the terminal).

**Terse-steps rule (applies to the whole skill):** while working the steps before this one, print one line per step — outcome only, plus anything that failed. The required prompt (the success/push question) is exempt: ask only the question, wait, then print the step's one outcome line. All other detail defers to this report — it is the only thing Scott should need to read.

**Facts only:** populate the payload exclusively from what the earlier steps actually observed. Omit a line's key when its step didn't run or found nothing — the CLI renders it as a red `—` line; never infer success. The step 5 success answer sets both the `result` line and the recorded session result — they must agree.

Payload keys (all optional): `result`, `qa`, `git`, `tickets`, `insights`, `models`, `session`, `docs` — each `{"status": "good|bad|warn|neutral", "text": "<line content>"}`, where good renders green `+`, bad red `-`, warn orange `!`, neutral plain. A line mixing states takes the worst element's status (`good` only when everything on the line is healthy). Plus `followUps` (array — every unresolved item carried forward, one per entry, ticket # where one exists; the safety net for anything deferred with "later"), `efficiency` (array — top 1–2 findings from the session-reflection step), and `next` (string).

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

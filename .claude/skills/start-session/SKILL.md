---
name: start-session
description: Limedice session initialization — load context and resume
kb-modules:
  start-session/session-anchor: "2026-08-03T13:34:12.462Z"
  start-session/ensure-kb: "2026-07-16T08:38:17.857Z"
  start-session/staleness-check: "2026-10-07T06:40:34.624Z"
  start-session/handback-scan: "2026-10-07T06:39:15.967Z"
---

# Session Start

## KB CLI

All KB operations use the `kb` CLI.

## 1. Current State

Run these checks:

1. `git branch --show-current && git status --short`
2. `git log --oneline -5`
3. `kb resume-pack --project limedice`

Step 3 returns last session, in-progress tickets, unresolved follow-ups, domain counts, conventions, recent changes, and accepted ADRs in a single call. Read it as your resume context.

## 2. Project-Specific Checks

- Check whether a local preview server is already running on port 8080:
  `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/ || echo "not running"`
- If not running and the session needs visual verification, start one:
  `python -m http.server 8080` (run in background)

## Session Anchor

<!-- kb:start-session/session-anchor:begin -->
Write the session anchor (session UUID + session-start commit) and persist it for `/end-session`:

```bash
kb session start
```

Store the printed `session_id`. For the remainder of this session, include the header `X-KB-Session-Id: <session_id>` on **all** KB API requests (GET, POST, PUT, DELETE to `http://localhost:3012/api/v1/*`). This populates `session_access_log`, enables co-occurrence tracking and session hit counts, and — since #2918 — refreshes this session's **lease** (every header-carrying call is a heartbeat).

`kb session start` also acquires the project's session lease. Act on its output:
- **Lease refused (`lease_held`, non-zero exit)** — another session holds a live lease (seen within the TTL). The refusal enumerates the valid next actions; surface them to the user and STOP — do not retry `kb session start` in a loop. If the user confirms the other session is dead or should be evicted, run `kb session takeover` (this is logged as an override event and writes a fresh anchor).
- **Stale-lease notice** — the previous lease was idle past the TTL and was auto-released (printed + logged as an override event). Mention it in one line; this is the normal path after a crashed/unclosed session.
- **`lease unavailable — KB unreachable`** — the session proceeds without a lease; say so.
- A stderr `WARNING: previous anchor ... was never closed` — surface it to the user. It usually means the previous session skipped `/end-session` (harmless) but can mean a second session is running in this project.
- `"start_sha": null` (not a git repository) — say so: the end-session checks that depend on it degrade to their fallbacks.

The anchor file (`~/.knowledgebench/session-current-<project>.json`) is read by `/end-session`: `start_sha` scopes the file-growth and system-model drift checks to exactly this session's commits, and `session_id` drives the co-occurrence update. `/end-session` stamps `ended_at` when it closes the session and releases the lease. Do not delete the file mid-session.
<!-- kb:start-session/session-anchor:end -->

## 3. Ready

Summarise: branch, in-progress tickets, last session context. Ask: **What are we working on?**

<!-- kb:start-session/ensure-kb:begin -->
Check KB is reachable before anything else:

```bash
kb status
```

- **Succeeds** → KB is up; do not start another instance.
- **Unreachable** → `kb status` prints the launchd recovery steps inline (kickstart, and bootstrap if the service is missing). Follow them and re-run. The full ladder (diagnosis, logs) is in **SM#24 (KB Deployment)** — `kb get system-models 24`, readable once KB is back.

Never run `npm run dev &` to (re)start KB — the launchd agent (`com.scott.dev.knowledgebench`, KeepAlive) is the only sanctioned path.
<!-- kb:start-session/ensure-kb:end -->

<!-- kb:start-session/staleness-check:begin -->
Check whether local skills' embedded KB modules have drifted from KB:

```bash
kb skills check --global
```

Act on the result; on drift, relay exactly what it prints. Do NOT auto-fix (the user decides when to refresh):
- `all in sync` → print nothing about skill sync in the Ready summary (no `Skills: all in sync` line or sentence).
- On drift the command names the affected skills and the exact next step — `/skill-refresh` for stale/missing modules (a `global:<skill>` refreshes `~/.claude/skills/<skill>/SKILL.md`; a stale `CLAUDE.md` entry uses `kb skills refresh CLAUDE.md`), or `kb skills refresh --add-missing <skill>` for missing modules. Surface that guidance verbatim. It also flags `duplicate-marker`/`not-in-kb`, untracked copies of managed skills, and extra-modules / absent-variants for manual attention. Add `--json` for structured output.
<!-- kb:start-session/staleness-check:end -->

<!-- kb:start-session/handback-scan:begin -->
## Handback Scan

Runs in Current State, straight after `kb resume-pack`; only `#<id>` rows go in the Ready summary. Project auto-detects from cwd.

```bash
kb ticket list --status testing --assignee claude --format compact --all
```

`testing` + `assignee=claude` is the handback signature (AssigneeHandoff, C296): normally a ticket the user has released back for rework (`kb ticket update <id> --assignee claude`); an interrupted run can leave the same state. Either way it is Claude's work, and nothing else surfaces it — `kb ticket next` only offers `new` tickets. `--all` lifts the 20-row default. Do not label rows rework or interrupted here: the compact list carries no journal, and the one rule that tells them apart lives in `/dev-ticket` step 2 (it reads the journal and the recorded commit, resumes a committed ticket at step 10 instead of re-implementing it, and runs one fix pass first only for genuine rework).

Branch on `#<id>` rows only. A `focus:` header line is not a row: it means an unclosed previous session's focus scoped the list to one parent's children — say so, and rerun the command once `kb session start` has written the fresh (unfocused) anchor.

- **One or more rows** → add a `Handbacks:` line to the Ready summary listing each `#<id> — <title>`, and offer `/dev-ticket <id>` for each.
- **No rows** → print nothing about handbacks: no `Handbacks:` line, no `Handbacks: none`, and no sentence saying none were found.
<!-- kb:start-session/handback-scan:end -->

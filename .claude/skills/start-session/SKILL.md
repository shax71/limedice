---
name: start-session
description: Limedice session initialization — load context and resume
kb-modules:
  start-session/session-anchor: "2026-07-06T19:48:25.428Z"
  start-session/ensure-kb: "2026-07-16T08:38:17.857Z"
  start-session/staleness-check: "2026-07-16T08:27:23.048Z"
---

# Session Start

## KB CLI

All KB operations use the `kb` CLI. Always set: `export KB_URL=http://localhost:3012`

## 1. Current State

Run these checks:

1. `git branch --show-current && git status --short`
2. `git log --oneline -5`
3. `KB_URL=http://localhost:3012 kb resume-pack --project limedice`

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

Store the printed `session_id`. For the remainder of this session, include the header `X-KB-Session-Id: <session_id>` on **all** KB API requests (GET, POST, PUT, DELETE to `http://localhost:3012/api/v1/*`). This populates `session_access_log` and enables co-occurrence tracking and session hit counts.

Act on the command's output:
- A stderr `WARNING: previous anchor ... was never closed` — surface it to the user. It usually means the previous session skipped `/end-session` (harmless) but can mean a second session is running in this project.
- `"start_sha": null` (not a git repository) — say so: the end-session checks that depend on it degrade to their fallbacks.

The anchor file (`~/.knowledgebench/session-current-<project>.json`) is read by `/end-session`: `start_sha` scopes the file-growth and system-model drift checks to exactly this session's commits, and `session_id` drives the co-occurrence update. `/end-session` stamps `ended_at` when it closes the session. Do not delete the file mid-session.
<!-- kb:start-session/session-anchor:end -->

## 3. Resources

Available if needed during the session (do NOT read at startup):
- `CLAUDE.md` — project conventions and CLI reference
- `DESIGN.md` — original design brief
- `_design_extract/README.md` — canonical design-system source of truth (copy, tokens, UI kit)
- `KB_URL=http://localhost:3012 kb query system-models --tags limedice`
- `KB_URL=http://localhost:3012 kb query conventions --tags limedice`
- `KB_URL=http://localhost:3012 kb query insights --tags limedice`
- `KB_URL=http://localhost:3012 kb search "<term>"` — cross-domain search

## 4. Ready

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

Relay exactly what it prints; do NOT auto-fix (the user decides when to refresh):
- `all in sync` → silent pass, say nothing.
- On drift the command names the affected skills and the exact next step — `/skill-refresh` for stale/missing modules (a `global:<skill>` refreshes `~/.claude/skills/<skill>/SKILL.md`; a stale `CLAUDE.md` entry uses `kb skills refresh CLAUDE.md`), or `kb skills refresh --add-missing <skill>` for missing modules. Surface that guidance verbatim. It also flags `duplicate-marker`/`not-in-kb`, untracked copies of managed skills, and extra-modules / absent-variants for manual attention. Add `--json` for structured output.
<!-- kb:start-session/staleness-check:end -->

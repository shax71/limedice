---
name: start-session
description: Limedice session initialization — load context and resume
kb-modules:
  start-session/session-anchor: "2026-06-11T16:47:21.976Z"
  start-session/ensure-kb: "2026-07-02T12:15:28.436Z"
  start-session/staleness-check: "2026-07-05T08:09:09.613Z"
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
Generate a session UUID and capture the session-start commit, then persist both as the **session anchor**:

```bash
python - <<'PY'
import json, subprocess, uuid, datetime, pathlib
cwd = pathlib.Path.cwd().resolve()
project = cwd.name.lower()
res = subprocess.run(["git", "rev-parse", "--verify", "HEAD"], capture_output=True, text=True)
sha = res.stdout.strip() if res.returncode == 0 else None
path = pathlib.Path.home() / ".knowledgebench" / f"session-current-{project}.json"
if path.exists():
    try:
        prev = json.loads(path.read_text())
        if not prev.get("ended_at"):
            print(f"WARNING: previous anchor (started {prev.get('started_at')}) was never closed — another session may be active in this project.")
    except Exception:
        pass
anchor = {
    "session_id": str(uuid.uuid4()),
    "start_sha": sha,
    "project": project,
    "cwd": str(cwd),
    "started_at": datetime.datetime.now().astimezone().isoformat(),
}
path.parent.mkdir(exist_ok=True)
path.write_text(json.dumps(anchor, indent=2))
print(json.dumps(anchor))
PY
```

Store the printed `session_id`. For the remainder of this session, include the header `X-KB-Session-Id: <session_id>` on **all** KB API requests (GET, POST, PUT, DELETE to `http://localhost:3012/api/v1/*`). This populates `session_access_log` and enables co-occurrence tracking and session hit counts.

If the snippet prints the unclosed-anchor WARNING, surface it to the user — it usually means the previous session skipped `/end-session` (harmless) but can mean a second session is running in this project. If `start_sha` is null (not a git repository), say so: the end-session checks that depend on it will degrade to their fallbacks.

The anchor file is read by `/end-session`: `start_sha` scopes the file-growth and system-model drift checks to exactly this session's commits, and `session_id` drives the co-occurrence update. `/end-session` stamps `ended_at` when it closes the session. Do not delete the file mid-session.
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
Before anything else, check whether KB is already reachable:

```bash
KB_URL=http://localhost:3012 kb status
```

- **If it succeeds** — KB is already running. Do NOT start another instance.
- **If it fails** (connection refused / timeout) — KB runs as a launchd service (`com.scott.dev.knowledgebench`, KeepAlive). Restart it:
  ```bash
  launchctl kickstart -k "gui/$(id -u)/com.scott.dev.knowledgebench"
  ```
  Wait a few seconds, then re-run `kb status` to confirm it is up.
- **If kickstart reports the service is not found**, bootstrap it, then kickstart again:
  ```bash
  launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.scott.dev.knowledgebench.plist"
  launchctl kickstart -k "gui/$(id -u)/com.scott.dev.knowledgebench"
  ```
- **If it still will not start**, diagnose with `launchctl print "gui/$(id -u)/com.scott.dev.knowledgebench"` and check the log at `$HOME/.claude/logs/knowledgebench.log`, then surface the problem to the user.
- Do NOT run `npm run dev &`: backgrounded shell execution is blocked by the sandbox, and outside the KnowledgeBench repo it starts the wrong dev server. The launchd agent is the only sanctioned way for agent sessions to (re)start KB.
<!-- kb:start-session/ensure-kb:end -->

<!-- kb:start-session/staleness-check:begin -->
Check whether any local skill's embedded KB modules have drifted from KB:

```bash
kb skills check --global
```

For every module named in a skill's `kb-modules` frontmatter, this compares the content between that module's `<!-- kb:NAME:begin -->` / `<!-- kb:NAME:end -->` markers in `.claude/skills/*/SKILL.md` against the module's current content in KB. It also covers marker-synced CLAUDE.md sections: entries reported as `CLAUDE.md` / `global:CLAUDE.md` are the project's root `CLAUDE.md` (or `~/.claude/CLAUDE.md`), discovered by their `<!-- kb:claude-md/NAME:... -->` markers alone — no frontmatter. `--global` also checks the global skill set at `~/.claude/skills` (reported with a `global:` prefix), so drift there is caught from any project. The comparison is **content-based, not date-based**, so it is immune to `updated_at` churn (a read bumps the timestamp; content does not). It also flags **untracked copies of managed skills**: a local skill directory whose name matches a KB module (e.g. dir `check` vs modules `check/*`) but whose `SKILL.md` has no `kb-modules` frontmatter — a hand-copied or pre-module copy the content diff cannot otherwise see. It also diffs each tracked skill's **declared module set** against a canonical per-skill manifest stored in KB, reporting modules that are **missing** (the manifest says the skill should carry them) or **extra** (declared but not in the manifest). A stack-dependent **variant group** (e.g. code-review's `architecture-*` module) reports its absence as advisory info, never as a missing module. It always exits 0 (untracked copies are advisory, never a failure). Add `--json` for structured output (includes an `untracked` array and a `moduleSets` array of per-skill module-set drift).

Act on what it prints:
- `all in sync` → say nothing (silent pass).
- `stale` or `missing-marker` → tell the user: **"Stale skills: <list>. Run /skill-refresh to update."** For `global:`-prefixed skills, strip the `global:` prefix when naming the skill — the file to refresh is `~/.claude/skills/<skill>/SKILL.md`, not a project skill. For a stale `CLAUDE.md` entry, the refresh command is `kb skills refresh CLAUDE.md`.
- `duplicate-marker` or `not-in-kb` → surface for manual attention (a malformed block, or a module renamed/removed in KB).
- `untracked copy of managed skill` → advisory. Tell the user: **"Untracked copy of managed skill: <list> — consider wiring to KB modules."** Strip any `global:` prefix when naming it. Do NOT auto-fix — the user decides whether to wire the copy to KB modules.
- **missing modules** (module-set drift) → the skill lacks modules its manifest requires. Tell the user: **"<skill> is missing modules: <list>. Run `kb skills refresh --add-missing <skill>`."** Strip any `global:` prefix when naming the skill.
- **extra modules** (or an **absent** architecture/stack variant) → surface for manual attention. The user decides whether to remove an extra module, or add a variant module for the stack (no auto-fix).

Do NOT auto-refresh — the user decides when to update.
<!-- kb:start-session/staleness-check:end -->

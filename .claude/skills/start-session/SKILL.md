---
name: start-session
description: Limedice session initialization — load context and resume
kb-modules:
  start-session/session-anchor: "2026-06-11T16:47:21.976Z"
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

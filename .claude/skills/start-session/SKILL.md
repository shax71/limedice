---
name: start-session
description: Limedice session initialization — load context and resume
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

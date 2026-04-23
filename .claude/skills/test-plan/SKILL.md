---
name: test-plan
description: Generate and post a test plan for a ticket
argument-hint: "<ticket-number>"
---

# Generate Test Plan

## 1. Fetch Ticket Detail

Fetch the ticket: `curl -s http://localhost:3012/api/v1/tickets/<id>`

Read the title, description, type, status, and journal entries.

## 2. Check for Existing Test Plan

Fetch existing: `curl -s http://localhost:3012/api/v1/tickets/<id>/testplan`

If items exist, warn and ask before proceeding.

## 3. Generate Test Steps

Based on ticket description, type, and journal history. No artificial cap.

Guidelines for this project (browser-verifiable static site):
- bug: reproduce scenario in browser + verify fix + check mobile and desktop breakpoints
- story/task: render check + interaction check + responsive check + accessibility (keyboard nav, focus ring, screen reader label) + cross-browser spot check
- spike: findings documented + no regressions in existing sections
- Each step: single sentence starting with a verb
- Cover all acceptance criteria in the description

## 4. POST Test Plan

```bash
curl -s -X POST http://localhost:3012/api/v1/tickets/<id>/testplan \
  -H "Content-Type: application/json" \
  -d '{"items": [{"description": "..."}], "actor": "claude"}'
```

## 5. Confirm

Display created items. If ticket not in testing, ask to transition.

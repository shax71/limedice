---
name: end-session
description: Limedice session cleanup — quality checks, ticket updates, knowledge capture
---

# Session Stop

Work through each section. Do not skip steps.

## KB CLI

All ticket operations: `KB_URL=http://localhost:3012 kb ticket <command> [args]`
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

```bash
curl -s -X POST http://localhost:3012/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "project": "limedice",
    "summary": "<1-2 sentence summary>",
    "decisions": "<key decisions>",
    "outcome": "<result>",
    "follow_ups": "<follow-up items>",
    "files_modified": ["<from git diff --name-only>"],
    "tags": ["limedice"],
    "source_agent": "claude-code"
  }'
```

## 9. Export DB and Push

1. `KB_URL=http://localhost:3012 kb export C:/Users/ScottWatson/source/repos/KnowledgeBench/kb-data.json`
2. Commit the export in the KnowledgeBench repo if changed.

Ask Scott: **"Push to GitHub? (yes/no)"**

## 10. Session Summary

Produce a brief summary for Scott.

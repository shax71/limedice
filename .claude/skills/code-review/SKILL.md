---
name: code-review
description: Pre-commit review for limedice — tokens, debug leaks, accessibility, copy
---

# Pre-Commit Code Review

Review staged and unstaged changes against project conventions before committing.

## 1. Get the Diff

1. `git diff HEAD`
2. `git status --short`

If there are no changes, report "Nothing to review" and stop.

## 2. Run the Checks

Work through each category against the diff output:

### Design tokens
- [ ] No raw hex colours outside `colors_and_type.css`. Use `var(--color-navy)`, `var(--color-lime)`, `var(--color-terracotta)`, stone neutrals, or paper tints.
- [ ] No raw spacing values (px) that duplicate existing `--space-*` tokens.
- [ ] No raw font-size values that duplicate existing `--text-*` tokens.

### Debug leaks
- [ ] No `console.log / warn / error / debug` in `main.js`.
- [ ] No `alert()` or stray test markup.
- [ ] No commented-out blocks of code.

### Content / copy
- [ ] UK English spelling (organisation, programme).
- [ ] Sentence case for headings (no title case).
- [ ] No emoji anywhere.
- [ ] No stock medical clichés in imagery or copy (heartbeats, stethoscopes, DNA helixes, caduceus).

### Accessibility
- [ ] Every interactive element has a visible focus style.
- [ ] No lime text on white or mint (contrast ≈ 1.5:1, fails WCAG).
- [ ] No terracotta body text at regular weight on white (fails at body size).
- [ ] Form inputs have real `<label>` elements (no placeholder-only labels).
- [ ] Alt text or `aria-hidden` on every `<svg>` / `<img>`.
- [ ] Heading order sensible (no jumping from h1 to h3).

### Architecture
- [ ] Styles live in `styles.css` (or `colors_and_type.css` for tokens) — not inlined on elements.
- [ ] Behaviour lives in `main.js` — not inlined `onclick` attributes.
- [ ] `_design_extract/` unmodified.
- [ ] No build tooling introduced without discussion (the site is plain HTML/CSS/JS by design).

## 3. Report

Produce a structured pass/fail table:

| Check | Result | Notes |
|-------|--------|-------|
| Design tokens | pass/fail | |
| Debug leaks | pass/fail | |
| Copy / content | pass/fail | |
| Accessibility | pass/fail | |
| Architecture | pass/fail | |

For any failures, show the specific line(s) from the diff that caused the issue and suggest the fix.

If all checks pass: **"All checks passed — safe to commit."**

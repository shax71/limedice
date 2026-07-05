---
name: code-review
description: Pre-commit review for limedice — tokens, debug leaks, accessibility, copy
kb-modules:
  code-review/get-diff: "2026-05-30T18:17:14.698Z"
  code-review/debug-leaks: "2026-07-02T12:15:28.181Z"
  code-review/maintainability: "2026-05-30T18:17:14.703Z"
  code-review/testing: "2026-07-02T12:15:28.263Z"
  code-review/report: "2026-05-30T18:17:14.707Z"
---

# Pre-Commit Code Review

Review staged and unstaged changes against project conventions before committing.

## 1. Get the Diff

<!-- kb:code-review/get-diff:begin -->
Run these commands using the Bash tool:
1. `git diff HEAD`
2. `git status --short`

If there are no changes, report "Nothing to review" and stop.
<!-- kb:code-review/get-diff:end -->

## 2. Run the Checks

Work through each category against the diff output:

### Design tokens
- [ ] No raw hex colours outside `colors_and_type.css`. Use `var(--color-navy)`, `var(--color-lime)`, `var(--color-terracotta)`, stone neutrals, or paper tints.
- [ ] No raw spacing values (px) that duplicate existing `--space-*` tokens.
- [ ] No raw font-size values that duplicate existing `--text-*` tokens.

### Debug leaks

<!-- kb:code-review/debug-leaks:begin -->
Apply the rules for the language(s) in the diff — route everything through the project's structured logger:

- [ ] JS/TS: no raw `console.log(`, `console.warn(`, or `console.error(` in production code; `console.debug()` only behind an explicit dev/test guard or excluded from production builds
- [ ] Rust: no `println!`, `eprintln!`, or `dbg!` in production code — use `tracing` macros
- [ ] Python: no `print()` outside the CLI presentation layer — use the `logging` module
- [ ] No debug logging in tight loops (per-request, per-record, per-sample)
<!-- kb:code-review/debug-leaks:end -->

<!-- kb:code-review/debug-leaks:append -->
limedice specifics:
- [ ] No `console.log / warn / error / debug` in `main.js`.
- [ ] No `alert()` or stray test markup.
- [ ] No commented-out blocks of code.
<!-- kb:code-review/debug-leaks:append:end -->

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

### Maintainability

<!-- kb:code-review/maintainability:begin -->
**Maintainability lens** — apply only to changed lines and directly touched seams, using existing project conventions where relevant:
- [ ] Prefer behavior-preserving simplification that removes branches, modes, helpers, or layers over moving complexity around
- [ ] Flag diff-local structural smells: bolted-on conditionals, one-off boolean/null modes, duplicated logic where a canonical helper exists, feature logic leaking into shared paths, thin pass-through wrappers, or casts that hide the real contract
- [ ] Flag diff-added AI-slop: comments that merely restate the code, catch/rethrow or validation around already-trusted internal paths, and deep nesting where guard clauses would preserve behavior
- [ ] Apply the deletion test to suspected shallow modules: if removing the module makes complexity disappear, inline it; if the complexity reappears across multiple callers or protects a real volatility boundary, the seam earns its keep. Do not preserve a seam for a single hypothetical future adapter.
- [ ] Treat files crossing ~1000 lines as a design-review checkpoint, not an automatic block; block only if the change expands responsibility or buries separable concepts
- [ ] Any dependency/helper recommendation must respect the project's closed-source licensing constraint

**Severity** — label each finding:
- `blocker`: changed code regresses maintainability or correctness
- `concern`: should fix before commit
- `taste`: optional cleanup

Tie each finding to a concrete path or line.

**Proportionality** — require restructuring only for complexity the PR introduces or relies on. Do not relitigate unrelated existing design debt.

**Verification** — if a simplification is claimed behavior-preserving, confirm relevant test or manual coverage exists; if coverage is missing or indirect, say so. For explicit "does it work / did this fix it" verification requests, follow `kb query conventions --tags verification`.

**Scope** — report findings only; do not edit code unless explicitly asked.
<!-- kb:code-review/maintainability:end -->

### Testing

<!-- kb:code-review/testing:begin -->
- [ ] Every new public function with non-trivial logic has direct unit or focused integration coverage
- [ ] Test names state intent, following the stack's convention: `describe/it` phrasing (JS/TS), `test_[method]_[scenario]` in `#[cfg(test)]` modules (Rust), `test_*` pytest functions (Python)
- [ ] No tests that only assert the function runs without throwing — tests must verify actual values
<!-- kb:code-review/testing:end -->

## 3. Report

<!-- kb:code-review/report:begin -->
Produce a structured pass/fail table:

| Check | Result | Notes |
|-------|--------|-------|
| Build | pass/fail | |
| Lint | pass/fail | |
| Tests | pass/fail | N passed |
| Debug leaks | pass/fail | |
| Architecture | pass/fail | |
| Test coverage | pass/fail | |

For any failures, show the specific line(s) from the diff that caused the issue and suggest the fix.

If all checks pass: **"All checks passed — safe to commit."**
<!-- kb:code-review/report:end -->

<!-- kb:code-review/report:append -->
limedice adds these rows to the report table: Design tokens, Copy / content, Accessibility, Architecture — each pass/fail against the sections above.
<!-- kb:code-review/report:append:end -->

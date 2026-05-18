---
name: ui-consistency
description: Pre-commit audit for UI consistency — design tokens, component primitives, dark-theme integrity, accessibility patterns pulled from KB insights. Runs on UI-touching diffs. Use `--plan` mode during planning to inject project UI conventions into context. Triggers when changes touch *.tsx, *.jsx, *.html, *.css, *.scss, or design-token files.
kb-modules:
  ui-consistency/scope-detection: "2026-05-18T06:26:06.439Z"
  ui-consistency/audit-checks: "2026-05-18T06:26:06.448Z"
  ui-consistency/a11y-from-kb: "2026-05-18T06:26:06.456Z"
  ui-consistency/dom-pedant-handoff: "2026-05-18T06:26:06.462Z"
  ui-consistency/plan-mode: "2026-05-18T06:26:06.469Z"
  ui-consistency/report-and-fix: "2026-05-18T06:26:06.476Z"
---

# UI Consistency

Two modes:

- **Audit** (default) — runs against staged UI files, reports violations, optionally hands off to `dom-pedant` for deep checks.
- **Plan** (`--plan`) — emits a context block describing this project's UI conventions so the plan uses the right primitives.

## Arguments

- `(empty)` — audit staged UI files
- `--plan` — emit conventions block instead of auditing
- `--all` — audit every UI file under `web/src/` and `web/public/`
- `--files <glob>` — audit a specific subset

## 1. Scope Detection

<!-- kb:ui-consistency/scope-detection:begin -->
Decide whether this run has anything to audit and what to look at.

**Trigger files** (any of these in the diff or argv):
- `*.tsx`, `*.jsx`, `*.svelte`, `*.vue`, `*.astro`
- `*.html`, `*.htm`
- `*.css`, `*.scss`, `*.sass`, `*.less`
- Tailwind config or design-token files (`tokens.css`, `design-tokens.*`, `theme.ts`)

**Source of file list:**
- Pre-commit mode (default): `git diff --cached --name-only --diff-filter=ACMR` (staged); fall back to `git diff --name-only` if nothing staged.
- `--all` flag: every UI file under `src/`, `app/`, or `web/`.
- `--files <glob>`: explicit list.

**Early exit (silent):**
- No matching files → print one line: `ui-consistency: no UI files in scope, skipping.` and stop.
- Files only in token sources (`tokens.css`, `theme.ts`, etc.) → still audit, but suppress the "raw hex" rule there (those files ARE the source of truth).

Capture the project tag (lowercased cwd basename) for the KB rule query in `a11y-from-kb`.
<!-- kb:ui-consistency/scope-detection:end -->

<!-- kb:ui-consistency/scope-detection:append -->
**limedice specifics:**
- UI roots: `site/`
- Token sources (raw-hex rule suppressed): `site/colors_and_type.css`, `_design_extract/colors_and_type.css` (the second is the design extract; the first is the live site)
- Project tag: `limedice`
<!-- kb:ui-consistency/scope-detection:append:end -->

## 2. Audit Checks

<!-- kb:ui-consistency/audit-checks:begin -->
Run these checks against each in-scope file. Each violation gets: file path, line number, rule name, what was found, suggested fix.

### 1. Raw design values (tokens)

- `color\s*:\s*#[0-9a-fA-F]{3,8}` outside token-source files → `var(--color-...)`
- `(background|background-color|border-color|fill|stroke)\s*:\s*#[0-9a-fA-F]{3,8}` outside token-source files → `var(--color-...)`
- `(margin|padding|gap|inset|top|right|bottom|left)\s*:\s*-?\d+(\.\d+)?(px|rem|em)` outside spacing-token files → `var(--space-...)`
- `(width|height|min-width|min-height|max-width|max-height)\s*:\s*\d+(\.\d+)?(px|rem|em)` for layout (excluding icons/borders) → `var(--size-...)` or container queries
- `font-size\s*:\s*\d+(\.\d+)?(px|rem|em)` → `var(--font-size-...)`
- `border-radius\s*:\s*\d+(\.\d+)?(px|rem|em)` → `var(--radius-...)`

### 2. Inline styles in markup

- `style="..."` or `style={{...}}` in JSX/HTML for properties covered by tokens → move to a class or use CSS vars
- Allowed inline: dynamic positioning (`left`, `top` driven by JS state), `transform` for animation, `--<var-name>` declarations

### 3. Hand-rolled primitives

When the project specifies a UI library in its `:append` block, flag:
- Raw `<button>` elements where the library has a button primitive
- Raw `<dialog>` / `<div role="dialog">` where a Dialog primitive exists
- Raw `<input>` / `<select>` / `<textarea>` where the library wraps them
- Custom toggle/checkbox/radio components when the library ships them

Project-specific exceptions live in the `:append` block.

### 4. Dark-theme integrity

- Hardcoded light colours that resolve to `#fff` / `rgb(255,…)` / `rgba(255,…)` in a non-token-source file → token
- `background-color` set without a matching `color` (text contrast risk in dark mode)
- `@media (prefers-color-scheme: ...)` without a corresponding token strategy is a smell — most projects in this codebase use class-on-root theming (`html[data-theme="dark"]`); flag PCS queries for review.

### 5. Class chaos

- Long Tailwind-style class strings (>10 utility classes on a single element) → extract to a component or a class
- Mixed token sources (some `var(--color-...)`, some raw hex on the same component) → normalise

For each rule, record severity:
- `error` — a token violation in non-token source, a raw primitive that has a library replacement, a known-bad a11y pattern (from `a11y-from-kb`)
- `warn` — class chaos, suspicious PCS query
- `info` — opportunity to use a newer token

`error` blocks; `warn`/`info` is reported but does not block.
<!-- kb:ui-consistency/audit-checks:end -->

<!-- kb:ui-consistency/audit-checks:append -->
**limedice primitives:**
Vanilla HTML — static site. No component library. The `_design_extract/preview/` directory contains the canonical component mockups — refer to those for the intended visual vocabulary.

**Token map:**
See `site/colors_and_type.css`. This file defines the brand colour palette and typography scale.

**Theme strategy:** No runtime theme switching — site is single-theme. Do not use `@media (prefers-color-scheme)` — flag PCS as a smell.
<!-- kb:ui-consistency/audit-checks:append:end -->

## 3. A11y Rules from KB

<!-- kb:ui-consistency/a11y-from-kb:begin -->
Pull project-relevant a11y rules from KB Insights and apply them as audit checks.

1. Query insights tagged with the relevant a11y topics:
   ```
   kb query insights --tags a11y
   kb query insights --tags modals
   kb query insights --tags forms
   kb query insights --tags keyboard
   kb query insights --project <project> --tags a11y
   ```

2. Filter to insights whose `name` reads as an imperative prevention rule (the `/kb-postmortem` shape). Each becomes a check.

3. For each rule, derive a detector if one is obvious:
   - "Trap Tab in destructive confirm" → detect `<dialog>` or `role="dialog"` open paths without a Tab cycle handler nearby
   - "Defer role=tree until keyboard nav" → flag `role="tree"` / `role="treeitem"` without `onKeyDown` or `tabIndex` handling
   - "Capture pre-modal focus via focusin on modal root" → flag modal open paths that read `document.activeElement` at the call site rather than via `focusin` on the modal root
   - "Provide secure-context fallback for `crypto.randomUUID`" → flag direct calls without a `typeof crypto?.randomUUID === "function"` guard or `?.` fallback

4. If a rule has no mechanical detector, list it under "manual review" — the human (or `dom-pedant` agent) needs to eyeball it. Do not silently drop it.

5. As insights accumulate via `/kb-postmortem`, this module gets more checks for free — no code change required. This is the compounding return.
<!-- kb:ui-consistency/a11y-from-kb:end -->

## 4. dom-pedant Handoff

<!-- kb:ui-consistency/dom-pedant-handoff:begin -->
For files where the automated checks find anything non-trivial (≥1 `error` or ≥3 `warn`), delegate a deeper review to the `dom-pedant` agent.

Prompt skeleton:
```
Review these UI files for HTML correctness, CSS architecture, Shoelace / Web Awesome usage, Shadow DOM correctness, and accessibility. Focus on the violations already detected by the automated audit (listed below) AND look for anything the automated checks could not see (semantic structure, ARIA correctness, cross-platform webview compatibility).

Files: <list>
Automated findings: <copy the audit output for those files>

Report only high-confidence issues. Skip nits.
```

Agent runs read-only — it returns a report, does not auto-fix. Merge its findings into the final report under a "dom-pedant" section so they are visually distinct from the automated checks.

Do NOT call `dom-pedant` if the automated audit found zero issues on a file. The agent burn is for cases where something is already smelly.
<!-- kb:ui-consistency/dom-pedant-handoff:end -->

## 5. Plan Mode

<!-- kb:ui-consistency/plan-mode:begin -->
When invoked as `/ui-consistency --plan` (or auto-injected during plan mode for a UI-touching ticket), do NOT scan files. Instead emit a single context block the planner can read.

Block shape:
```
## UI Conventions (project: <name>)

Primitives: <library + version>. Compose these rather than hand-rolling:
- Dialog: <component> (focus-trapped, ESC handler, restore focus on close)
- Button: <component>
- Input / Select / Textarea: <components>
- Toggle / Checkbox / Radio: <components>

Tokens:
- Colour: `var(--color-...)` from <token file>
- Spacing: `var(--space-...)` from <token file>
- Typography: `var(--font-size-...)`, `var(--font-weight-...)`
- Radius: `var(--radius-...)`

Theming: <strategy — class on root vs. prefers-color-scheme>

Known a11y rules (pulled from KB insights tagged `a11y` for this project):
- <rule 1>
- <rule 2>
- …
```

The library, token files, and theming strategy come from the project-specific `:append` block on this module. The a11y rules are queried fresh from KB so they stay current.

Purpose: the plan that comes out should already reference the right primitives. Pre-commit audit then has less to flag.
<!-- kb:ui-consistency/plan-mode:end -->

<!-- kb:ui-consistency/plan-mode:append -->
**limedice fill-in for the plan-mode block:**

```
## UI Conventions (project: limedice)

Primitives: None — static site. Compose existing primitives rather than hand-rolling.
Vanilla HTML — static site. No component library. The `_design_extract/preview/` directory contains the canonical component mockups — refer to those for the intended visual vocabulary.

Tokens:
See `site/colors_and_type.css`. This file defines the brand colour palette and typography scale.

Theming: No runtime theme switching — site is single-theme.

Known a11y rules: <query KB at runtime — kb query insights --tags a11y --project limedice>
```
<!-- kb:ui-consistency/plan-mode:append:end -->

## 6. Report & Fix

<!-- kb:ui-consistency/report-and-fix:begin -->
Output format:

```
ui-consistency: <project> — <N files scanned>

ERRORS (<count>) — must fix
  <file>:<line>  <rule>  <one-line description>
                 found:     <snippet>
                 suggested: <fix>
  …

WARNINGS (<count>) — recommended
  …

INFO (<count>) — opportunities
  …

dom-pedant (<count>)  // only if delegated
  …

Summary:
  Tokens:       <ok|N violations>
  Inline style: <ok|N violations>
  Primitives:   <ok|N violations>
  Dark theme:   <ok|N violations>
  A11y rules:   <ok|N violations>  (from <K> KB insights)
```

**Auto-fix policy:**
- Token violations with a clear 1:1 mapping (e.g. `#1a1a1a` → `var(--color-bg-elevated)`) can be auto-applied **only if** the token file confirms the mapping. Otherwise leave for manual fix.
- Inline-style → class moves require human judgement (class might not exist yet). Do not auto-fix.
- Primitive replacements (raw `<button>` → `<sl-button>`) almost always need attribute / event-handler translation. Do not auto-fix; suggest the replacement.

**Return codes** (for use in `/dev-ticket`):
- exit 0 — clean or warnings only
- exit 1 — errors present (caller decides whether to block)
- exit 2 — scope-detection bailed (no UI files) — caller treats as clean

The skill does not commit, does not stage. The caller decides what to do with the report.
<!-- kb:ui-consistency/report-and-fix:end -->

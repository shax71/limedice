# Lime Dice — Project Instructions

Static one-page marketing website for **Lime Dice Ltd**, a digital health consultancy. No build step, plain HTML/CSS/JS, hosted on GitHub Pages at `limedice.com`.

<!-- kb:claude-md/shell-behaviour:begin -->
## Shell Behaviour Rules

Resolve the project root dynamically — see KB convention #34 (`kb get conventions 34`):

- ALWAYS prefix bash commands with `cd "$(git rev-parse --show-toplevel)" && <command>`
- NEVER rely on `$CLAUDE_PROJECT_DIR` — it is not exported into the Bash tool shell and expands to empty
- NEVER use hardcoded absolute paths — they break across machines and OSes
- NEVER use bare relative paths like `cd src` — cwd is not guaranteed
- This applies to ALL tool calls, hooks, skills and bash blocks
<!-- kb:claude-md/shell-behaviour:end -->

## Stack

| Layer | Tech |
|-------|------|
| Markup | HTML5 |
| Styling | CSS (tokens from `colors_and_type.css`) |
| Behaviour | Vanilla ES6 in `main.js` |
| Icons | Lucide via CDN |
| Fonts | Inter, JetBrains Mono (Google Fonts) |
| Hosting | GitHub Pages (public repo) |

**No build step.** Serve `index.html` directly. Local preview: `python -m http.server 8080`.

## Source Layout

```
index.html            One-page site
colors_and_type.css   Canonical design tokens (from Claude Design system)
styles.css            Site-specific styles (adapted from design-system kit.css + site.css)
main.js               Lucide init, mobile nav, section highlight, contact form
assets/               Logo SVGs (wordmark, mark, mono)
_design_extract/      Claude Design system reference — do NOT edit, do NOT ship
DESIGN.md             Original design brief (kept for reference)
```

## Conventions

- **UK English** throughout (organisation, programme, whilst).
- **Sentence case** headings. No title case. No all-caps except tiny `eyebrow` labels.
- **No emoji** anywhere — not in product, not in marketing.
- **Design tokens only** — never raw hex in `index.html` or `styles.css`. Always reference CSS variables from `colors_and_type.css` (e.g. `var(--color-navy)`, not `#042C53`). The `colors_and_type.css` file itself is the only place raw hex is allowed.
- **No stock medical imagery** (clinicians, stethoscopes, pills, heartbeats, DNA helixes).
- **Icons**: Lucide only, stroke-based, inherits `currentColor`.
- **WCAG 2.2 AA** minimum. Never lime text on white or mint. Focus rings: 2px terracotta, 2px offset.
- **Licensing**: freeware closed-source. All dependencies must permit this.

<!-- kb:claude-md/ticketing:begin -->
## Ticketing

KnowledgeBench's built-in ticketing. Dev server on port 3012; web UI at http://localhost:3012. Project auto-detects from cwd (lowercased) — override with `--project <name>`.

| Action | Command |
|--------|---------|
| List open tickets | `kb ticket list --open` |
| Compact list (for context) | `kb ticket list --open --format compact` |
| Search tickets | `kb ticket search "term"` |
| Show ticket | `kb ticket <id>` |
| Create ticket | `kb ticket new --type <type> --title "text" --actor claude` |
| Update status | `kb ticket update <id> --status <status> --actor claude` |
| Add comment | `kb ticket comment <id> "text" --actor claude` |
| Close ticket | `kb ticket close <id> --actor claude` |
| Generate test plan | Run `/test-plan <id>` skill |
| List milestones | `kb milestone list` |

For ticketing workflow rules (statuses, plan rule, test plan rule, `--actor` convention): `kb query conventions --tags ticketing`.
<!-- kb:claude-md/ticketing:end -->

<!-- kb:claude-md/knowledge-base:begin -->
## Knowledge Base

All cross-project knowledge is stored in KB. If unfamiliar with KB, read: `kb get conventions 29`.

Set `export KB_URL=http://localhost:3012` once at session start (the `/start-session` skill does this), then use bare `kb` commands. Query before working in any area:

- `kb query conventions --tags <topic>` — rules and standards
- `kb query system-models --tags <topic>` — how tools and systems behave
- `kb query insights --tags <topic>` — patterns from experience
- `kb query concepts` — project glossary (project auto-detects from cwd)
- `kb search "<term>"` — cross-domain search
- `kb query symbols --q "<name>"` — indexed code symbols; check before grepping
<!-- kb:claude-md/knowledge-base:end -->

<!-- kb:claude-md/github:begin -->
## GitHub

- Push cadence: `/end-session` asks whether to push
- Never force-push to `main`/`master`
- Commit only when asked; stage files by name; keep commits scoped and conventional
<!-- kb:claude-md/github:end -->

- **Repo:** TBD — public repo under `shax71` for GitHub Pages hosting at `limedice.com`

<!-- kb:claude-md/structured-logging:begin -->
## Structured Logging

- KnowledgeBench is the log store — query shipped events with `kb logs`
- Per-project logging rules live in KB: `kb query conventions --tags logging`
- No raw `console.*` / `println!` in committed code — route through the project's logger per the KB conventions
<!-- kb:claude-md/structured-logging:end -->

Not applicable — static site, no runtime logger. Do not introduce `console.log` in production code. If debug output is ever needed, gate behind a query-string flag (e.g. `?debug=1`) and strip before merging.

## Commands

| Task | Command |
|------|---------|
| Preview locally | `python -m http.server 8080` (or `npx serve`) |
| Lint HTML (optional) | `npx html-validate index.html` |
| Lint CSS (optional) | `npx stylelint "**/*.css"` |

No automated test suite — content and visual correctness is verified in the browser.

<!-- kb:claude-md/session-workflow:begin -->
## Session Workflow

- **Start**: AUTOMATICALLY run `/start-session` on the first user message of every new conversation — do not wait to be asked
- **End**: run `/end-session` for session cleanup before finishing
<!-- kb:claude-md/session-workflow:end -->

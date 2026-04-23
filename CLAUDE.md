# Lime Dice — Project Instructions

Static one-page marketing website for **Lime Dice Ltd**, a digital health consultancy. No build step, plain HTML/CSS/JS, hosted on GitHub Pages at `limedice.com`.

## Shell Behaviour Rules

- ALWAYS begin every bash command with: `cd C:/Users/ScottWatson/source/repos/limedice && <command>`
- NEVER use `$PROJECT_ROOT` or any shell variable
- NEVER use relative paths outside the project root

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

## Ticketing

Built-in ticketing system. Server runs on port 3012 (dev). Web UI at http://localhost:3012. Project auto-detects from cwd (lowercased). Override with `--project <name>`.

| Action | Command |
|--------|---------|
| List open tickets | `KB_URL=http://localhost:3012 kb ticket list --open` |
| Show ticket | `KB_URL=http://localhost:3012 kb ticket show <id>` |
| Create ticket | `KB_URL=http://localhost:3012 kb ticket new --type <type> --title "text" --actor claude` |
| Update status | `KB_URL=http://localhost:3012 kb ticket update <id> --status <status> --actor claude` |
| Add comment | `KB_URL=http://localhost:3012 kb ticket comment <id> "text" --actor claude` |
| Close ticket | `KB_URL=http://localhost:3012 kb ticket close <id> --actor claude` |
| Compact list | `KB_URL=http://localhost:3012 kb ticket list --open --format compact` |

For ticketing workflow rules (statuses, plan rule, test plan rule, --actor convention), query `kb query conventions --tags ticketing`.

## Knowledge Base

All cross-project knowledge is stored in KB. Query before working in any area:

- `KB_URL=http://localhost:3012 kb query conventions --tags <topic>` — rules and standards
- `KB_URL=http://localhost:3012 kb query system-models --tags <topic>` — how tools behave
- `KB_URL=http://localhost:3012 kb query insights --tags <topic>` — patterns from experience
- `KB_URL=http://localhost:3012 kb search "<term>"` — cross-domain search
- `KB_URL=http://localhost:3012 kb query symbols --project limedice --q "<name>"` — look up indexed symbols before grepping

## GitHub

- **Repo:** TBD — public repo under `shax71` for GitHub Pages hosting at `limedice.com`
- Push cadence: `/end-session` asks whether to push
- Never force-push to main/master

## Structured Logging

Not applicable — static site, no runtime logger. Do not introduce `console.log` in production code. If debug output is ever needed, gate behind a query-string flag (e.g. `?debug=1`) and strip before merging.

For KB logging conventions (if needed later for build tooling): `kb query conventions --tags logging`.

## Commands

| Task | Command |
|------|---------|
| Preview locally | `python -m http.server 8080` (or `npx serve`) |
| Lint HTML (optional) | `npx html-validate index.html` |
| Lint CSS (optional) | `npx stylelint "**/*.css"` |

No automated test suite — content and visual correctness is verified in the browser.

## Session Workflow

- **Start**: run `/start-session` on the first user message of every new conversation
- **End**: use `/end-session` for session cleanup before ending a conversation

# Lime Dice — Design System

A working design system for **Lime Dice Ltd**, a specialist digital health consultancy helping NHS organisations and health tech suppliers design systems that share data properly and improve patient care.

This folder is the source of truth for Lime Dice brand & interface design. It covers colour, type, spacing, components, tone, iconography, and a marketing-site UI kit. Use it directly when generating HTML artefacts, slides, prototypes, or production code for the brand.

---

## Sources

| Source | Location / link | Notes |
| --- | --- | --- |
| `DESIGN.md` onboarding spec | `source/DESIGN.md` (copied from `uploads/DESIGN.md`) | Primary source. Every rule here comes from this file unless noted. |
| Company domain | [limedice.com](https://limedice.com) | Referenced for context only; the system doesn't yet have a production site to mirror. |
| Competitive refs | [airelogic.com](https://airelogic.com), [drdoctor.co.uk](https://drdoctor.co.uk), [janeirodigital.com](https://janeirodigital.com), [gov.uk](https://gov.uk), NHS service manual, [linear.app](https://linear.app), [vercel.com](https://vercel.com) | The brand should feel adjacent to gov.uk / Linear in restraint, and distinctly warmer than UK health tech norms. |

No codebase, Figma file, or finished logo was attached — the suggested logo mark was built from the direction in `DESIGN.md §6`. Flag anything below you'd like reworked with more authoritative inputs.

---

## Company context

- **Who they are.** A specialist independent consultancy — not an enterprise platform or large agency. The brand voice is a real person speaking (first person is allowed), not a corporate "we".
- **Audience.** Primary: NHS organisations (trusts, ICBs, GLHs, NHSE programmes). Secondary: UK health-tech suppliers. Tertiary: wider UK public-sector digital/data teams.
- **What they sell.** Architecture and advisory work across clinical systems, national programmes, genomics, interoperability, and NHS data sharing.
- **Positioning.** Warmer, lighter and more distinctive than the cool corporate blues that dominate UK health tech — achieved with navy + lime + terracotta on warm neutrals.

## Products represented

Only one surface currently exists as a design target:

1. **Marketing site** (`ui_kits/website/`) — a small marketing-consultancy site: home, about, services, writing/insights, contact. MVP scope per `DESIGN.md §9`.

There is no app, docs site, or product UI in scope today. If one is added later, spin up a new folder under `ui_kits/` and mirror the structure.

---

## Content fundamentals

**How copy is written.** Plain English, UK spelling, short sentences, specific over abstract. Always name the system, standard, or trust — never hide behind "digital transformation" abstractions. Honest about how hard NHS data is; don't promise frictionless anything.

**Person & tone.** First person ("I work with…") is preferred on personal / about pages; product and service copy can drop to neutral declaratives. Never "Lime Dice leverages…". Warm, quietly confident, pragmatic.

**Casing.** Sentence case for headings. No title case. No all-caps headings — except tiny eyebrow labels (`--text-xs`, letter-spacing 0.12em, in terracotta or stone-500).

**Technical vocabulary.** FHIR, SNOMED CT, GLH, PDS, NRL, ICB, GP Connect etc. are named without apology. Offer a brief inline gloss when it helps a non-technical reader; never patronise the technical one.

**Emoji.** No. Not in product, not in marketing. Unicode symbols used sparingly only where they carry meaning (e.g. arrows in inline links).

**Example do / don't.**

> ✅ "Most trusts have the data they need. What they don't have is a way to get it where it needs to go."
> ✅ "I've worked inside NHS genomics programmes long enough to know which solutions sound clever in a slide deck and which actually work on a Tuesday morning."
> ❌ "Lime Dice leverages next-generation interoperability frameworks to unlock unprecedented value across the healthcare continuum."
> ❌ "Our holistic approach to digital transformation empowers stakeholders."

**Strapline candidates** (in preference order): *Digital Health Specialists* (current), *Data that actually reaches the patient*, *Health systems, joined up properly*, *Architecture for NHS data that works*.

---

## Visual foundations

### Colour
- **Navy `#042C53`** is the dominant brand colour — hero backgrounds, large type on light, footer, UI chrome.
- **Lime `#74F443`** is the signature accent. Sparingly: primary CTAs, the "dice" dot in the logo, key data points. Never a large background fill. Never as text on white (1.5:1 — catastrophic).
- **Terracotta `#D4765A`** is the humanising secondary: secondary CTAs, editorial accents, links, focus rings, data-viz second series.
- Neutrals are a **warm stone family** (slight beige undertone). Paper is plain white, with **mint `#EAF6E2`** and **warm `#FAF7F2`** tinted alternatives for gentle section rhythm.
- Rules of thumb: *Lime on navy — always fine. Lime on white — only as a solid fill, never as text. Terracotta + lime adjacent at full saturation — avoid; always separate with navy or neutral space.*

### Typography
- **Inter** for headings (600/700) and body (400/500).
- **JetBrains Mono** for code, FHIR resource names, SNOMED codes, filenames, diagram labels.
- Tight heading leading (1.1–1.2), body at 1.6, 65–75ch max line length. Sentence case. UK English.
- Scale is defined as CSS variables `--text-xs` → `--text-7xl` in `colors_and_type.css`.

### Spacing & layout
- 4px base unit, scale `--space-1` (4px) through `--space-32` (128px).
- Max content width 1200px; reading blocks capped at 680px.
- 12-column grid, 24px gutters desktop / 16px mobile.
- **Generous vertical rhythm** between sections (96px desktop / 64px mobile). Alternate `--color-paper` ↔ `--color-paper-mint` to create rhythm without heavy dividers.

### Backgrounds & imagery
- Solid colour backgrounds, full stop. No gradients, no blurred hero washes, no noise textures.
- No hand-drawn illustrations, no whimsy.
- Photography used sparingly, treated with a subtle navy duotone at low opacity (or warm terracotta/cream duotone for editorial).
- Imagery vibe: **cool and architectural, or warm and editorial** — never clinical stock.

### Motion
- Restrained, functional. Fades and 120–220ms easings (`cubic-bezier(0.22, 1, 0.36, 1)`).
- No bounces, parallax, auto-play, or decorative animation.
- Respect `prefers-reduced-motion` — turn off all non-essential motion.

### Interaction states
- **Hover (primary/lime CTA):** no colour change; subtle `scale(1.02)` and `--shadow-sm`.
- **Hover (secondary/terracotta CTA):** slight darken (`#C8684C`) or inverse (outline → filled).
- **Hover (ghost/navy-outline):** fill navy, text flips to white.
- **Hover (link):** colour shifts terracotta → navy, underline appears.
- **Press:** `scale(0.98)` + 40ms press, no colour flash.
- **Focus:** always a **2px terracotta outline, 2px offset**. Terracotta — not lime — so focus rings never disappear on lime CTAs.
- **Disabled:** 40% opacity, no hover, cursor not-allowed.

### Borders, shadows, corners
- **Borders** are 1px, stone-200 default, stone-300 where emphasis is needed. Navy borders only on diagrams and featured cards.
- **Shadows** are minimal, sharp, navy-tinted. Three stops: `--shadow-sm/md/lg`. No big drop shadows, no layered glows.
- **Corners:** 4px (inputs, small buttons), 8px (cards, larger buttons), 16px (hero panels, feature cards), full pill for chips/tags.
- **No transparency or blur.** Solid panels only — Lime Dice is technical, not atmospheric.

### Cards
- Default: white background, 1px stone-200 border, 8px radius, 24px internal padding.
- On mint sections: card bg stays white, border drops — the lift comes from the colour change.
- Featured: navy background, white text, **4px lime stripe on the left edge**.
- Editorial: warm paper background, terracotta eyebrow, navy headline.

### Layout rules
- Left-aligned headings by default. Centre only for hero treatments on short pages.
- Fixed elements kept to a minimum — only the top nav is sticky, with a subtle shadow when pinned.
- No chrome-heavy sidebars on marketing surfaces. (If a future app is added, it can carry its own navigation pattern.)

---

## Iconography

**Primary library: Lucide** (regular weight, 1.5px stroke). It matches the brand rule of "stroke-based, 1.5–2px consistent stroke weight" in `DESIGN.md §6`.

**How it's delivered.** Loaded from CDN — `https://unpkg.com/lucide@latest`. Drop `<i data-lucide="heart-pulse"></i>` and call `lucide.createIcons()`. We have not vendored the set locally, as the codebase has no existing icon pipeline.

> ⚠️ **Substitution flag.** No icon files were attached with `DESIGN.md`. Lucide is chosen as the closest match to the stated stroke-based direction (Phosphor was listed as an alternative in the spec). If you'd prefer Phosphor, swap the CDN and the attribute name — all components read icons through a small wrapper so the swap is one line.

**Colour.** Icons inherit `currentColor`. Lime for active / emphasised icons. Terracotta for editorial or "attention" icons. Never multicolour.

**Sizing.** 16px (inline with body), 20px (nav), 24px (feature cards), 32px (pillar headers).

**What we don't use.**
- **No emoji**, anywhere.
- **No unicode pictograms** as icons (no ✓ ✗ ► etc. stand-ins — use a real SVG).
- **No medical clichés** (heartbeat, cross, pill, DNA helix, caduceus, "connectivity" globes) — even though the brand is health-tech.
- **No multi-colour SVG illustrations**, no hand-drawn sketches.

**Brand illustration.** When illustration is needed, it must be geometric / flat / technical — three-tone (navy + lime, navy + terracotta, or all three with stone). Isometric architecture, data flow, system maps. See `preview/Brand-Diagram.html` for a sample treatment.

---

## Index

### Root files

| File | What it is |
| --- | --- |
| `README.md` | This file. |
| `SKILL.md` | Agent Skill frontmatter — lets Claude Code load this folder as a skill. |
| `colors_and_type.css` | Single source of truth for colour + type tokens. Import at the top of any artifact. |
| `source/DESIGN.md` | The original onboarding spec. |

### Folders

| Folder | Contents |
| --- | --- |
| `assets/` | Logo variants, any brand imagery. |
| `fonts/` | (Empty — fonts loaded from Google Fonts CDN. Drop `.woff2` here to go fully offline.) |
| `preview/` | Small HTML cards rendered in the **Design System** tab — tokens, specimens, components. |
| `ui_kits/website/` | Marketing-site UI kit. `index.html` is an interactive walkthrough of the site; JSX components are the building blocks. |

### Assets

| Asset | File | Notes |
| --- | --- | --- |
| Wordmark — light bg | `assets/logo-wordmark.svg` | Primary usage. Navy on paper. |
| Wordmark — dark bg | `assets/logo-wordmark-dark.svg` | Inverse; paper text on navy. |
| Monospace mark | `assets/logo-mono.svg` | `[lime.dice]` secondary developer-oriented mark. |
| Favicon / app mark | `assets/logo-mark.svg` | Just the dice — for favicons and avatar contexts. |

---

## Accessibility — non-negotiable

Lime Dice designs **must** meet WCAG 2.2 AA. The NHS has a statutory accessibility obligation; the brand inherits that.

- Body text ≥ 4.5:1. Large text ≥ 3:1.
- Never lime text on white or mint. Never terracotta body text at regular weight on white.
- Visible focus rings (2px terracotta, 2px offset) on every interactive element.
- 44×44px minimum touch target.
- Never convey meaning through colour alone.
- Honour `prefers-reduced-motion`.
- Labels above inputs — never placeholder-only.

All palette contrast pairs are pre-verified in `DESIGN.md §8`.

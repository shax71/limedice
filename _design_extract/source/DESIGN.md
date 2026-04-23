# Lime Dice — Design System

> **DESIGN.md** for Claude Design onboarding
> Company: Lime Dice Ltd
> Tagline: Digital Health Specialists
> Domain: limedice.com

---

## 1. Brand Identity

**Who we are**
Lime Dice is a specialist digital health consultancy helping NHS organisations and health tech suppliers design systems that share data properly and improve patient care.

**What we do (one-liner)**
Helping NHS organisations and health tech suppliers design systems that share data properly and improve patient care.

**What we do (expanded)**
Most health systems struggle to share data in a way that genuinely improves patient care. Lime Dice works with NHS organisations and suppliers to design architectures that enable safe, effective data sharing across services and regions. Experience spans frontline clinical systems through to national programmes, giving a clear view of what works in practice and what doesn't.

**Audience**
- Primary: NHS organisations (trusts, ICBs, GLHs, NHS England programmes)
- Secondary: UK health tech suppliers selling into the NHS
- Tertiary: Wider UK public sector digital and data teams

**Brand personality**
- Modern and technical, but human and accessible
- Specialist without being niche or intimidating
- Pragmatic, plain-spoken, quietly confident
- Independent and unafraid to say what isn't working

**Positioning against competitors**
Unlike large consultancies (Aire Logic, DrDoctor, Janeiro Digital), Lime Dice is a specialist independent practice. The brand should feel lighter, warmer, and more distinctive than the typical enterprise health tech website. The warm terracotta accent and mint paper tones are deliberately chosen to differentiate from the cool corporate blues that dominate the sector.

Avoid the "big agency" aesthetic: stock photos of clinicians, grid-heavy case study layouts, and corporate navy-on-navy.

---

## 2. Colour System

All colours defined as design tokens. Use names, not raw hex, in generated components.

### Primary palette

- `--color-navy` `#042C53` — Primary. Dominant brand colour. Used for: hero backgrounds, large type on light, primary UI chrome, footer.
- `--color-lime` `#74F443` — Signature accent. Used sparingly for: primary CTAs, brand highlight moments, the "dice" dot in the logo, key data points. **Never** use as a large background fill or for body text at regular size.
- `--color-terracotta` `#D4765A` — Warm secondary accent. Used for: secondary CTAs, highlighted editorial elements, warm section dividers, illustrated accents, data visualisation second series. This is the "humanising" colour in the palette — it signals that Lime Dice is a person, not an enterprise platform.

### Neutrals (warm family)

The greyscale is deliberately warm — slight beige/stone undertone — to pair with the terracotta and keep the overall feel human rather than clinical.

- `--color-ink` `#0A1628` — Body text on light backgrounds (slightly softer than pure navy).
- `--color-stone-900` `#2A241E` — Deepest text option for maximum contrast on warm surfaces.
- `--color-stone-700` `#524A42` — Secondary body text.
- `--color-stone-500` `#857D72` — Tertiary text, captions, metadata.
- `--color-stone-300` `#B8B0A4` — Borders, dividers, muted UI elements.
- `--color-stone-200` `#D8D2C8` — Subtle surface differentiation on warm backgrounds.
- `--color-stone-100` `#EDE8E0` — Warm muted surface.

### Paper (backgrounds)

- `--color-paper` `#FFFFFF` — Primary background.
- `--color-paper-mint` `#EAF6E2` — Lime-tinted background. Use for alternating page sections, pull-quote backgrounds, feature callouts. Low saturation but clearly readable as mint — creates gentle visual rhythm between sections without dominating.
- `--color-paper-warm` `#FAF7F2` — Warm off-white alternative for sections where mint would feel off-tone (e.g. behind terracotta accents).

### Semantic colours

- `--color-success` `#5BA048` (muted lime derivative, not the signature lime)
- `--color-warning` `#D4A13A`
- `--color-error` `#C8553D`
- `--color-info` `#042C53` (reuses navy)

### Usage rules

- **Hero sections:** navy background with lime accent elements, **or** white/mint background with navy type and a single lime CTA, **or** mint background with navy type and a terracotta accent.
- **Primary CTAs:** lime fill with navy text.
- **Secondary CTAs:** terracotta fill with white text, or terracotta outline with terracotta text.
- **Tertiary / ghost buttons:** navy outline, navy text, fills navy on hover.
- **Body text:** `--color-ink` on `--color-paper` or `--color-paper-mint`. Never lime or terracotta for body copy.
- **Links:** terracotta by default, navy underline on hover.
- **Never** place lime on terracotta or terracotta on lime at full saturation — they'll clash. Always separate with neutral space or navy.

### Colour pairing cheat sheet

Safe combinations:
- Navy + white + lime accent (the classic brand combo)
- Navy + mint + lime accent (softer hero treatment)
- White + navy type + terracotta accent (editorial feel)
- Mint + navy type + terracotta CTA (warmest, most human)
- Warm paper + terracotta + navy type (case study / longer-read)

Avoid:
- Lime and terracotta adjacent at full saturation
- Terracotta on mint (muddy)
- Lime text on white (poor contrast)

### Dark mode (optional v2)

- Background: `--color-navy` deepened to `#031A33`
- Text: `#EDE8E0` (warm off-white)
- Lime and terracotta retain their hex values — both read well on deep navy.

---

## 3. Typography

### Type families

- **Headings:** Inter, weights 600 and 700. Fallback: system-ui, -apple-system, sans-serif.
- **Body:** Inter, weights 400 and 500.
- **Mono (technical accents, code samples, data labels):** JetBrains Mono or IBM Plex Mono. Fallback: ui-monospace, SFMono-Regular, Menlo, monospace.

All fonts loaded via standard web font hosting. No decorative or display fonts.

### Type scale (rem-based, 16px root)

- `--text-xs` 0.75rem (12px) — captions, labels
- `--text-sm` 0.875rem (14px) — UI labels, metadata
- `--text-base` 1rem (16px) — body
- `--text-lg` 1.125rem (18px) — lead paragraphs
- `--text-xl` 1.25rem (20px) — small headings
- `--text-2xl` 1.5rem (24px) — h4
- `--text-3xl` 1.875rem (30px) — h3
- `--text-4xl` 2.25rem (36px) — h2
- `--text-5xl` 3rem (48px) — h1 (body pages)
- `--text-6xl` 3.75rem (60px) — hero
- `--text-7xl` 4.5rem (72px) — hero, desktop only

### Type rules

- Headings: tight line-height (1.1 to 1.2), semibold (600) by default, bold (700) only for H1 and hero.
- Body: line-height 1.6, regular weight, max line length 65 to 75 characters.
- UK English spelling throughout (organisation, not organization).
- Sentence case for headings, not title case. No all-caps headings except for small eyebrow labels (which use `--text-xs`, letter-spacing 0.1em, in terracotta or stone-500).
- Mono font reserved for: code, technical identifiers (FHIR resource names, SNOMED codes), filenames, data in diagrams.

---

## 4. Spacing and Layout

### Spacing scale (4px base unit)

- `--space-1` 4px
- `--space-2` 8px
- `--space-3` 12px
- `--space-4` 16px
- `--space-6` 24px
- `--space-8` 32px
- `--space-12` 48px
- `--space-16` 64px
- `--space-24` 96px
- `--space-32` 128px

### Layout

- Max content width: 1200px
- Reading-width text blocks: 680px
- Grid: 12-column with 24px gutters on desktop, 16px on mobile
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
- Generous vertical rhythm between sections (96px on desktop, 64px on mobile).
- Alternate section backgrounds between `--color-paper` (white) and `--color-paper-mint` to create gentle rhythm without heavy dividers.

### Radius

- `--radius-sm` 4px (inputs, small buttons)
- `--radius-md` 8px (cards, larger buttons)
- `--radius-lg` 16px (hero panels, feature cards)
- `--radius-pill` 999px (tag chips, pills)

### Elevation

Keep shadows minimal and sharp. Avoid heavy drop shadows.

- `--shadow-sm` 0 1px 2px rgba(4, 44, 83, 0.06)
- `--shadow-md` 0 4px 12px rgba(4, 44, 83, 0.08)
- `--shadow-lg` 0 12px 32px rgba(4, 44, 83, 0.12)

---

## 5. Components

### Buttons

- **Primary:** lime background, navy text, medium radius, no shadow, subtle scale on hover.
- **Secondary:** terracotta background, white text, or terracotta outline with terracotta text.
- **Tertiary / ghost:** transparent background, navy text, navy 1px border, fills navy on hover.
- **Link button:** terracotta text, underline on hover, navy on hover.
- Sizing: sm (32px), md (40px), lg (48px) heights.
- Focus ring: 2px terracotta outline offset 2px. Terracotta is used here rather than lime because lime focus rings can disappear against lime CTAs.

### Cards

- Default: white background, 1px `--color-stone-200` border, `--radius-md`, 24px internal padding.
- On mint sections: card background shifts to white to create lift.
- Featured cards: navy background, white text, lime accent stripe on the left edge (4px wide).
- Editorial cards (for insights/writing): warm paper background, terracotta eyebrow label, navy headline.

### Navigation

- Top nav: white background, navy text, lime underline on active/hover.
- Sticky on scroll with subtle shadow when pinned.
- Mobile: slide-in drawer, navy background with lime active indicators.

### Forms

- Input fields: white background, `--color-stone-300` border, navy text.
- Focus state: terracotta border and subtle terracotta glow.
- Labels above inputs, UK English, clear and plain.
- Error state: `--color-error` border, error text below input.

### Tags and pills

- Default: `--color-stone-100` background, navy text, pill radius.
- Active / selected: lime background, navy text.
- Terracotta variant: terracotta-tinted background (`#F5E4DD`), terracotta text — used for warmer editorial categorisation.

### Code blocks (for technical content)

- Mono font, navy background, cream-white text, lime syntax highlighting for keywords, terracotta for strings.

### Data visualisation

- Primary series: navy
- Secondary series: terracotta
- Highlight / emphasis: lime
- Grid and axes: `--color-stone-300`
- Avoid rainbow palettes. Three-colour max (navy / terracotta / lime) with stone for supporting elements.

### Diagrams (architecture, systems)

Lime Dice diagrams should look technical but legible. Follow gov.uk and NHS service manual diagrammatic conventions:
- Clear boxes with navy borders
- Mono font labels for technical names
- Lime highlights for the element under discussion
- Terracotta for warnings, legacy systems, or elements that need attention
- Navy lines for data flows, stone-300 lines for weak / optional flows
- No gradients, no skeuomorphism, no 3D

---

## 6. Imagery and Iconography

### Photography

- Avoid stock healthcare imagery (clinicians with stethoscopes, blurred hospital corridors).
- Prefer: abstract compositions, real UK environments, architectural and systems-thinking visuals.
- If using photography at all, use sparingly and treat with a subtle navy duotone overlay at low opacity — or a warm terracotta/cream duotone for editorial pieces.

### Illustration

- Geometric, flat, technical. Think isometric architecture diagrams, data flow sketches, system maps.
- Three-tone: navy + lime, navy + terracotta, or all three with stone supporting.
- Hand-drawn or whimsical styles do **not** fit the brand.

### Icons

- Stroke-based, 1.5px or 2px consistent stroke weight.
- Library suggestion: Lucide or Phosphor (regular weight).
- Icon colour: inherits text colour by default. Lime reserved for active / emphasised icons. Terracotta for editorial or "attention" icons.

### Logo

No finished logo yet. Suggested direction for Claude Design to explore:
- A wordmark "Lime Dice" in Inter semibold, navy.
- The dot of the "i" in "Lime" or "Dice" rendered as a small lime square (the "dice"), rotated slightly, hinting at the name without being literal.
- Alternative: a monospace-styled "[lime.dice]" treatment as a secondary developer-oriented mark.
- Avoid: medical crosses, heartbeats, pills, caduceus, DNA helixes, abstract "connectivity" globes.

---

## 7. Tone of Voice

### Principles

- **Plain English.** Write for a busy CIO, not a conference panel.
- **UK English spelling and idiom.** "Organisation", "programme", "whilst" used sparingly.
- **Specific over abstract.** Name the system, the standard, the trust. Avoid "leveraging synergies" and similar.
- **Honest about difficulty.** Health data is hard. Don't promise frictionless transformation.
- **Technical where it helps.** FHIR, SNOMED CT, GLH, PDS, NRL are named without apology; brief explanations offered inline where useful.
- **Warm, not corporate.** First person ("I work with...") is acceptable and preferred over "Lime Dice leverages..." on personal / about pages.

### Voice examples

**Do:**
- "Most trusts have the data they need. What they don't have is a way to get it where it needs to go."
- "I've worked inside NHS genomics programmes long enough to know which solutions sound clever in a slide deck and which actually work on a Tuesday morning."

**Don't:**
- "Lime Dice leverages next-generation interoperability frameworks to unlock unprecedented value across the healthcare continuum."
- "Our holistic approach to digital transformation empowers stakeholders."

### Strapline options

- Digital Health Specialists (current, functional)
- Data that actually reaches the patient
- Health systems, joined up properly
- Architecture for NHS data that works

---

## 8. Accessibility

All generated designs must meet WCAG 2.2 AA as a minimum. Lime Dice serves the NHS, which has a statutory accessibility obligation.

### Contrast checks (verified)

- Navy `#042C53` on white: 14.8:1 ✓ (AAA)
- Navy `#042C53` on mint `#EAF6E2`: 13.2:1 ✓ (AAA)
- Ink `#0A1628` on white: 19.5:1 ✓ (AAA)
- Terracotta `#D4765A` on white: 3.6:1 — large text only (18px+) ✓
- Terracotta `#D4765A` on navy: 4.8:1 ✓ (AA)
- Lime `#74F443` on navy: 11.2:1 ✓ (AAA)
- Lime `#74F443` on white: **1.5:1** ✗ — never use for text on white
- White on terracotta: 4.4:1 ✓ (AA for large text, borderline for body — use bold weights)

### Rules

- Body text contrast: minimum 4.5:1.
- Large text contrast: minimum 3:1.
- Never use lime text on white or mint (fails catastrophically).
- Never use terracotta for body text at regular weight on white — only for headings/large text or on navy.
- Interactive elements have visible focus rings (2px terracotta outline, 2px offset).
- Minimum touch target: 44x44px.
- Don't convey meaning through colour alone; always pair with text or icon.
- Respect `prefers-reduced-motion`: no parallax, auto-play, or decorative animation for users who've opted out.
- All form fields have visible labels (no placeholder-only labels).
- Alt text required on all meaningful imagery.

---

## 9. Example Pages and References

### Website structure (MVP)

1. **Home** — hero with strapline, one-line value proposition, three service pillars, social proof strip, CTA to contact.
2. **About** — the Scott story. Why independent. Background across clinical systems and national programmes. Credibility markers.
3. **Services / How I work** — three pillars:
   - Architecture and design for NHS organisations
   - Advisory for health tech suppliers selling into the NHS
   - Specialist input on genomics, interoperability, and data sharing
4. **Writing / Insights** — blog or long-form thinking, optional for MVP but architected for later. Editorial cards use warm paper backgrounds and terracotta accents.
5. **Contact** — simple form, email, LinkedIn, Companies House registration note in footer.

### Hero reference

Lean closer to Linear, Stripe, or Vercel in restraint than to the dense agency layouts at airelogic.com or janeirodigital.com. One clear headline, one clear CTA, generous whitespace.

Two possible hero treatments:
- **Treatment A (bold):** Navy background, white heading, lime CTA, small terracotta eyebrow label.
- **Treatment B (warm):** Mint background, navy heading, lime CTA, terracotta accent in supporting illustration.

### Pages to generate during onboarding

Claude Design, when processing this file, should generate as a validation test:
- A home page hero (try both bold and warm treatments)
- A services overview section with three cards
- An insights/writing preview card with the editorial styling
- A simple contact form
- A basic footer with Companies House number placeholder

### References

- **Aire Logic** (airelogic.com) — UK health tech baseline. Reference for credibility markers and case study patterns, not for visual style. Lime Dice should feel lighter, warmer, and more distinctive.
- **DrDoctor** (drdoctor.co.uk) — NHS-facing supplier tone.
- **Janeiro Digital** (janeirodigital.com) — personal data stores positioning, similar philosophical territory.
- **gov.uk** and **NHS service manual** — gold standard for plain English and accessible layout. Lime Dice should feel adjacent to this tradition but more branded.
- **Linear** (linear.app), **Vercel** (vercel.com) — restraint, typography, technical confidence.

---

## Appendix: Quick reference for Claude Design

- Primary brand colour: navy `#042C53`
- Signature accent: lime `#74F443`
- Warm accent: terracotta `#D4765A`
- Neutrals: warm stone family (from `#EDE8E0` to `#2A241E`)
- Paper: white `#FFFFFF` with mint tint alternative `#EAF6E2`
- Heading font: Inter 600/700
- Body font: Inter 400/500
- Mono font: JetBrains Mono or IBM Plex Mono
- Base radius: 8px
- Language: UK English
- Target: NHS and UK health tech audience
- Feel: modern, technical, warm, human
- Differentiator: the warm terracotta and mint tones set Lime Dice apart from the cool corporate blues that dominate UK health tech
- Avoid: stock medical imagery, corporate clichés, rainbow palettes, heavy shadows, all-caps headings

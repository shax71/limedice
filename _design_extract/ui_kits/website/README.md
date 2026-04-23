# Lime Dice — Marketing website UI kit

Small interactive recreation of the Lime Dice marketing site as defined in `source/DESIGN.md §9`. Since no production site or Figma was provided, this is a first-pass build directly from the spec — treat it as a working draft.

## Screens included in `index.html`

1. Home — bold navy hero + services strip + editorial teasers + footer.
2. About — Scott's story, credibility markers.
3. Services — three pillars, each an expandable row.
4. Writing — insights preview with editorial cards.
5. Contact — simple form.

Switch screens using the top nav — each nav link routes without a page load.

## Components (JSX)

- `TopNav` — sticky, lime underline on active
- `Hero` — both treatments (bold navy, warm mint) as a prop
- `ServicePillar` — three-pillar card row
- `EditorialCard` — warm paper card for Writing
- `ContactForm` — input + textarea with focus/error states
- `Footer` — navy, with Companies House placeholder
- `Button` — all variants (primary/secondary/outline/ghost/link)

## Notes

- No real photography or illustrations — spec forbids stock clinical imagery. Hero is type-first.
- Icons via Lucide CDN (flagged as a substitution in the root README).
- All colour/type values come from `colors_and_type.css` via CSS vars.

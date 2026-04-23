---
name: lime-dice-design
description: Use this skill to generate well-branded interfaces and assets for Lime Dice Ltd — a UK digital health consultancy — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colours, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artefacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always import `colors_and_type.css` at the top of any stylesheet so you inherit the full token system — navy / lime / terracotta, warm stone neutrals, paper + mint + warm surfaces, Inter + JetBrains Mono, and all spacing / radius / shadow variables.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand. The marketing-site UI kit in `ui_kits/website/` shows how the tokens compose into real components.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artefacts _or_ production code, depending on the need.

Brand essentials to remember:
- **Audience.** NHS organisations and UK health-tech suppliers. UK English, plain language, specific over abstract.
- **Feel.** Modern, technical, warm, human — distinctly not the cool corporate blue of most UK health-tech.
- **Signature combo.** Navy `#042C53` as the dominant colour; lime `#74F443` as sparing accent; terracotta `#D4765A` as the humanising warm secondary.
- **Never.** Lime text on white (1.5:1 contrast — fails). Emoji. Medical clichés (cross, heartbeat, pill, DNA helix, caduceus). Stock clinical photography. Gradients. Bouncy or decorative animation.
- **Always.** Sentence case headings. Focus rings in terracotta. Labels above inputs. WCAG 2.2 AA minimum.

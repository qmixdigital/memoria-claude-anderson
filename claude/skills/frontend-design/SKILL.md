---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Data Tables on Narrow Screens

A data table is where polished designs quietly break. Horizontal scroll is the lazy
answer and it fails for one reason: the user never discovers the gesture. A fade on the
edge and a "swipe to see more" caption are both admissions that the pattern failed.

**Below ~640px, turn every row into a card**, with the column label above its value.
Nothing leaves the viewport, nothing has to be discovered.

```html
<td data-label="Sessions">3 monthly</td>
```

```css
@media (max-width: 640px) {
  .tab-wrap { overflow: visible; border: 0; background: transparent }
  .tab { min-width: 0 }
  .tab caption { display: none }
  /* header leaves the screen but stays in the DOM for assistive tech */
  .tab thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0) }
  .tab, .tab tbody, .tab tr, .tab th, .tab td { display: block; width: auto }
  .tab tbody tr { border: 1px solid rgb(0 0 0 / .09); border-radius: 14px;
                  padding: 2px 20px 18px; margin-bottom: 14px }
  /* the step everyone forgets: kill inherited cell borders and backgrounds */
  .tab tbody th, .tab tbody td { border: 0; background: transparent }
  .tab tbody th { border-bottom: 1px solid rgb(0 0 0 / .10); padding: 15px 0 13px }
  .tab tbody td { padding: 15px 0 0; display: block; text-align: left; line-height: 1.55 }
  .tab tbody td::before { content: attr(data-label); display: block; font-weight: 600;
                          font-size: 12px; letter-spacing: .05em; text-transform: uppercase }
}
```

**Accessibility is not optional here.** `display: block` **strips table semantics** in
most browsers, so a screen reader stops announcing row and column relationships. Restore
them with explicit roles, or the table degrades into an unlabelled list:

```html
<table role="table">
  <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">
  <tbody role="rowgroup"><tr role="row"><th scope="row" role="rowheader">
    <td role="cell" data-label="…">
```

### Three failure modes seen in production

1. **Inherited cell chrome.** Most themes and CSS resets paint a 1px border on **all four
   sides** of `th`/`td` plus a tinted `th` background. Zeroing only `border-bottom`
   leaves vertical rules slicing through the card. Zero `border` and `background`
   entirely, then rebuild the one separator you want — **on desktop too**, so the table
   reads as horizontal rules rather than a spreadsheet grid.
2. **Editing CSS by string replacement.** The same selector exists inside and outside the
   media query. Split the stylesheet at the breakpoint and operate on one half, or
   desktop silently inherits the mobile `padding: 15px 0` and text welds to the edge.
3. **Long values right-aligned.** Side-by-side label/value looks tidy with short values
   like percentages and ragged the moment a sentence wraps. Label above, value below,
   left-aligned, always.

**Caption** describes the data ("Treatments compared by number of sessions"). Never use
it to explain a gesture.

**Verify above the breakpoint too**: computed `display` still `table`, header visible,
`::before` off. The mobile fix is worthless if it regresses the desktop.

---

## Armadilhas de cascata e de porte (rede QMIX)

Cada uma custou uma correção em produção. Todas passam em teste de status.

**Reset tem de PERDER para classe.** `.ahwrap ul{margin:0}` pesa (0,1,1); a classe
do menu pesa (0,1,0). O reset vencia e zerava a margem que separava os dois níveis
do menu, deixando **dois alvos de toque a 1 px um do outro** — exatamente na troca
de hierarquia, que é onde o dedo mais erra. **Reset vai em `:where()`**, que tem
especificidade zero e nunca disputa com a classe.

**Utilitária de acessibilidade tem de VENCER o contexto onde for usada.**
`.des-form :is(input, select, textarea)` pesa (0,2,1) contra `.des-sr` com (0,1,0),
e devolvia `width:100%` ao campo que deveria estar escondido do olho e visível ao
leitor de tela. É o caso legítimo de `!important`, e é o que o Bootstrap faz em
`.visually-hidden`.

**Escala tipográfica se porta FLUIDA, não em degraus fixos.** Um `clamp()` portado
como três tamanhos fixos fez o título cair para 7 e 8 linhas entre 768 e 1024 px,
justamente onde a placa reservava vão para a foto: a abertura foi a 74% da tela,
numa largura que ninguém olha no dia a dia. Se a origem é fluida, o destino é
fluido.

**Margem de contraste de 1% não é folga.** Um vinho de marca dava 4,56:1 contra o
piso de 4,50 para texto pequeno: passa em AA, e qualquer ajuste de cor depois
derruba. **Em fundo de cor cheia, peça 20% de folga ou mais** — escurecer o mesmo
matiz um degrau levou para 5,80:1 sem mexer na identidade.

**Duas queixas ao mesmo tempo não são uma.** Quando o dono reclama de "grande" e
"simplão" no mesmo fôlego, encolher resolve a primeira e **piora** a segunda, e a
segunda volta reprovada. Peça variantes com as duas restrições JUNTAS: teto de
altura **e** exigência de composição.

# Visual Identity Guide

Color palette, typography, spacing, and global visual choices that survive across every page of the portal. This is the single biggest fingerprint factor that automated detectors look at, because palette + font is computed from a single CSS download.

## 20 color palettes

Use one per portal. Never reuse the same palette across siblings on the same VPS or same niche.

Each palette has 6 colors: primary, secondary, accent, surface, text-strong, text-muted.

| ID | Theme | Primary | Secondary | Accent | Surface | Text-strong | Text-muted | Best for |
|---|---|---|---|---|---|---|---|---|
| P01 | Brasil clássico | #006847 | #FFCC29 | #002776 | #FFFFFF | #1A1A1A | #555555 | regional/oficial |
| P02 | Jornal sóbrio | #1B1F23 | #C0392B | #ECECEC | #FAFAFA | #111111 | #4A4A4A | news geral |
| P03 | Saúde fresca | #00A19A | #6FCF97 | #FF6B6B | #F4FFFE | #1F2937 | #6B7280 | saúde/wellness |
| P04 | Fitness energia | #FF6B35 | #004E89 | #FFD23F | #FFFFFF | #0A0A0A | #4A5568 | fitness/esporte |
| P05 | Auto/tech | #0066CC | #FF3300 | #00D4FF | #F8FAFC | #0F172A | #64748B | automotivo/tech |
| P06 | Magazine premium | #722F37 | #C5A572 | #2C3E50 | #FFF8F0 | #1A1A1A | #5C5C5C | editorial premium |
| P07 | Eco / sustentável | #2D5016 | #97BC62 | #F4A261 | #FAFAF7 | #1B2614 | #4F5D45 | eco/natural |
| P08 | Cripto / fintech | #16213E | #0F3460 | #E94560 | #1A1A2E | #EAEAEA | #B0B0B0 | dark mode tech |
| P09 | Lifestyle pastel | #F9C5D5 | #FFE5B4 | #C5DEDD | #FFFFFF | #4A4A4A | #888888 | lifestyle/moda |
| P10 | Política sério | #1F4068 | #E43F5A | #B7C9D3 | #F5F5F5 | #1A1A1A | #455D7A | política/análise |
| P11 | Cultura | #6A0572 | #AB1267 | #F1A208 | #FFF9F0 | #2D0033 | #66486F | cultura/arte |
| P12 | Esportes intenso | #00B4D8 | #FF6B35 | #FFD60A | #001F3F | #FFFFFF | #B0C4DE | esportes |
| P13 | Negócios corp | #003049 | #D62828 | #F77F00 | #FAFAFA | #001628 | #404C5C | negócios/B2B |
| P14 | Entretenimento | #240046 | #C77DFF | #FF9100 | #FAF0FF | #100020 | #6C5677 | entretenimento |
| P15 | Direito / juris | #14213D | #FCA311 | #E5E5E5 | #FFFFFF | #0A0F1F | #4F5969 | direito/oficial |
| P16 | Religião | #4E342E | #D7A86E | #B37049 | #F8F1E5 | #2D1A14 | #6B5C50 | religião/família |
| P17 | Educação | #2B6CB0 | #ED8936 | #38A169 | #FFFFFF | #1A202C | #4A5568 | educação |
| P18 | Gastronomia | #D62828 | #F77F00 | #FCBF49 | #FFF5E1 | #2C0F0F | #6E4444 | culinária |
| P19 | Tecnologia minimal | #000000 | #FFFFFF | #00FFAA | #0A0A0A | #FAFAFA | #888888 | tech/dev |
| P20 | Turismo / viagem | #006D77 | #E29578 | #FFDDD2 | #EDF6F9 | #003844 | #4A6F75 | turismo |

## 20 font pairings

Heading + Body. All web-safe (Google Fonts or self-host equivalent). All have full Latin Extended-A coverage for Portuguese (ç, á, é, etc.).

| ID | Heading | Body | Vibe |
|---|---|---|---|
| F01 | Playfair Display | Source Sans 3 | Editorial classic |
| F02 | Bebas Neue | Inter | Tabloid impact |
| F03 | Merriweather | Lato | News standard |
| F04 | Montserrat | Open Sans | Modern blog |
| F05 | Cormorant Garamond | Roboto | Magazine elegant |
| F06 | Oswald | Source Serif 4 | Newspaper bold |
| F07 | DM Serif Display | DM Sans | Editorial fresh |
| F08 | Archivo Black | Inter | Strong contrast |
| F09 | Libre Baskerville | Libre Franklin | Classic news |
| F10 | Poppins | Roboto | Default modern |
| F11 | Crimson Pro | Public Sans | Government/serious |
| F12 | Bitter | Karla | Tech-friendly news |
| F13 | Anton | PT Sans | High impact title |
| F14 | Lora | Mulish | Editorial warm |
| F15 | Raleway | Source Code Pro | Tech blog |
| F16 | Cinzel | Cormorant | Cultural/sofisticado |
| F17 | Roboto Slab | IBM Plex Sans | Technical modern |
| F18 | Manrope | Manrope | Single-family modern |
| F19 | Libre Caslon Display | Spectral | Premium editorial |
| F20 | System UI native | System UI native | Zero font load (fastest) |

## Spacing scale

Pick one scale per portal. Define on `:root` as CSS variables, use everywhere.

| Scale | Base | Step | Sample (sm/md/lg/xl) |
|---|---|---|---|
| `tight` | 4px | 1.5x | 4 / 6 / 9 / 14 |
| `default` | 8px | 1.5x | 8 / 12 / 18 / 27 |
| `comfortable` | 8px | 1.6x | 8 / 13 / 20 / 33 |
| `spacious` | 12px | 1.6x | 12 / 19 / 31 / 49 |
| `golden` | 8px | 1.618x | 8 / 13 / 21 / 34 |

## Border radius scale

Pick one. Apply to cards, buttons, inputs, images.

| Scale | Style |
|---|---|
| `sharp` | 0px (no radius) |
| `subtle` | 2-4px |
| `default` | 6-8px |
| `friendly` | 12-16px |
| `pill` | 999px (full pill on buttons) |
| `mixed` | Different per element type |

## Shadow style

| Style | Treatment |
|---|---|
| `flat` | No shadows anywhere |
| `subtle` | 0 1px 3px rgba(0,0,0,0.1) |
| `editorial` | 0 4px 12px rgba(0,0,0,0.08) |
| `bold` | 0 8px 24px rgba(0,0,0,0.15) |
| `neumorphic` | Inset + outset combined |

## Visual identity fingerprint variables

Add to the roll:

| Variable | Example values |
|---|---|
| `palette` | P01..P20 |
| `font_pairing` | F01..F20 |
| `spacing_scale` | tight, default, comfortable, spacious, golden |
| `border_radius` | sharp, subtle, default, friendly, pill, mixed |
| `shadow_style` | flat, subtle, editorial, bold, neumorphic |
| `link_underline_style` | always, hover_only, never, dotted, animated |
| `button_style` | filled, outlined, ghost, link_only, gradient |
| `dark_mode_support` | none, manual_toggle, auto_prefers |

## Implementation as `style.css`

Pick a palette + font + scales, render a CSS variables block:

```css
/* Visual identity: P03 (Saúde fresca) + F12 (Bitter/Karla) + spacing-comfortable */
:root {
    /* palette */
    --color-primary: #00A19A;
    --color-secondary: #6FCF97;
    --color-accent: #FF6B6B;
    --color-surface: #F4FFFE;
    --color-text-strong: #1F2937;
    --color-text-muted: #6B7280;

    /* typography */
    --font-heading: "Bitter", Georgia, serif;
    --font-body: "Karla", -apple-system, sans-serif;
    --line-height-body: 1.6;
    --line-height-heading: 1.2;

    /* spacing */
    --space-xs: 8px;
    --space-sm: 13px;
    --space-md: 20px;
    --space-lg: 33px;
    --space-xl: 53px;

    /* radius + shadow */
    --radius-card: 12px;
    --radius-button: 999px;
    --shadow-card: 0 4px 12px rgba(0,0,0,0.08);
}
```

Apply variables in component CSS:

```css
.news-card {
    background: var(--color-surface);
    border-radius: var(--radius-card);
    padding: var(--space-md);
    box-shadow: var(--shadow-card);
    font-family: var(--font-body);
}

.news-card__title {
    font-family: var(--font-heading);
    color: var(--color-text-strong);
    line-height: var(--line-height-heading);
}
```

## Anti-fingerprint rules for visual identity

1. Never use the same palette ID across sibling portals (same VPS or same niche).
2. Never use the same font pairing ID across sibling portals.
3. Vary spacing scale across at least 3 of 5 options network-wide.
4. Don't all use the same border radius. If one portal is sharp, another should be friendly.
5. Don't ship the same `style.css` minified hash. Even with same content, comment headers should differ per portal.
6. Logo dimensions vary per portal (see chrome.md).
7. Favicon: vary 16x16 / 32x32 / 192x192 sources, ideally generated from each portal's own visual identity.

## Self-hosting fonts (preferred)

Self-host fonts for performance + privacy. Steps:

1. Download font files from Google Fonts (woff2 only, latin + latin-ext subsets).
2. Place in `wp-content/themes/<child-theme>/assets/fonts/`.
3. Generate `@font-face` rules with `font-display: swap`.
4. Preload the heading font:

```html
<link rel="preload" href="/wp-content/themes/portal-x/assets/fonts/Bitter-700.woff2" 
      as="font" type="font/woff2" crossorigin>
```

5. Reference in `style.css` via the CSS variable.

This gives 50-100ms LCP improvement over Google Fonts CDN and avoids GDPR/LGPD risk.

---
name: workflow-and-tooling
description: Per-article production workflow, DOCX generation and validation setup, MCP publishing connector, and project file locations
sources: [backfill]
aliases: []
---

## Standard production workflow (per article)

- [stated] 1. Read project files from `/mnt/project/` for standing rules, portal profiles, and client records
- [stated] 2. Fetch the destination portal and client URL to map editorial profile and confirm topical relevance
- [stated] 3. Run targeted web searches for verifiable data (named sources: IBGE, Abrasel, Anatel, EPE, Embratur, Fórum Brasileiro de Segurança Pública, sector associations, academic studies, etc.)
- [stated] 4. Select a distinct editorial angle suited to the portal's geography and audience, never reuse the angle from a prior article in the same campaign
- [stated] 5. Draft in Brazilian Portuguese (or European Portuguese for PT portals), ~1,200 to 1,800 words, journalistic tone, H1/H2 structure, Arial font, justified alignment
- [stated] 6. Generate DOCX via Node.js (`docx` library) at `/home/claude/`, run `validate.py` at `/mnt/skills/public/docx/scripts/office/validate.py`, then run inline Python validation: extract URLs from `word/_rels/document.xml.rels` via regex, count words with `re.findall(r'\b[\wÀ-ÿ%]+\b', txt)`, scan for forbidden terms and em/en dashes
- [stated] 7. Copy validated file to `/mnt/user-data/outputs/`
- [stated] 8. Deliver via `present_files` with a brief note on link placement only
- [stated] 9. Flag new portals and clients for manual registration in `portais-mapeados.md` and `clientes-recorrentes.md`

## Working practices

- [stated] Incremental edits are made via Python string replacements in the existing `gen.js` script rather than full rewrites, efficient for targeted changes like title swaps, section insertions, or anchor adjustments
- [stated] DOCX preview errors ("Failed to Load Document / ECONNRESET") are server-side preview failures, not file corruption, redeliver with `present_files` without regenerating

## Tools and resources

- [stated] DOCX generation: Node.js + `docx` npm library; `ExternalHyperlink` wrapping `TextRun` with `style: "Hyperlink"` on the TextRun (not the hyperlink wrapper); font/size set explicitly on each TextRun (Arial, size 24 for 12pt body)
- [stated] Validation: `/mnt/skills/public/docx/scripts/office/validate.py` plus inline Python (`zipfile`, `re`) for word count, hyperlink URL verification, forbidden terms, em/en dash check
- [stated] MCP connector "Publicar em sites de parceiros", tools: `listar_sites`, `listar_categorias`, `subir_imagem`, `criar_post`
- [stated] `url_imagem` accepts direct image URLs; Unsplash CDN with `?fm=webp&q=80&w=1200` parameters works reliably for WebP conversion
- [stated] `criar_post` accepts `imagem_destaque_id` and `categorias` as a numeric array; does not expose custom fields (subtitles, deck lines), those require manual WordPress admin edit
- [stated] Image sourcing: Pexels (direct `images.pexels.com` URL with compression parameters, not gallery page URL) and Unsplash CDN both work for `subir_imagem`
- [stated] Project files at `/mnt/project/` (read-only): `SKILL.md`, `angulos-por-segmento.md`, `portais-mapeados.md`, `clientes-recorrentes.md`, `validacao-e-factual.md`, `validador_materia.py` (humanization score 0 to 100, minimum passing threshold 70)
- [stated] Output directory: `/mnt/user-data/outputs/`

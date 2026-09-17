---
name: awesome-claude-design
description: Biblioteca de referência de gosto/estética pra design de UI (não gera código sozinha). Use ao DEFINIR a direção visual de um site — escolher uma família estética e puxar um DESIGN.md de referência antes de gerar. Traz famílias (brutalist, cinematic, data-dense, editorial, glass, indie, playful, remix, terminal, warm) com DESIGN.md reais, prompts de workflow e recipes. Fonte: github.com/rohitg00/awesome-claude-design.
---

# Awesome Claude Design (biblioteca de referência)

NÃO é um gerador. É referência de **gosto** pra você escolher uma direção e ancorar o design antes de gerar (combina com `frontend-design`, `taste-skill`/`design-taste-frontend` e `impeccable`).

## Como usar
1. **Escolher a estética:** abra `prompts/family-picker.md` pra decidir a família, ou vá direto numa de `design-md/<familia>/`.
2. **Puxar um DESIGN.md de referência:** cada arquivo em `design-md/<familia>/*.md` é um DESIGN.md completo (tema, paleta, tipografia, layout, motion) de uma referência real. Leia o mais próximo do brief e use como direção.
3. **Aplicar via prompts/recipes** conforme o caso.

## Conteúdo
- `design-md/` — famílias: **brutalist, cinematic, data-dense, editorial, glass, indie, playful, remix, terminal, warm** (cada uma com DESIGN.md de referências reais).
- `prompts/` — `family-picker.md` (escolher estética), `break-default-aesthetic.md` (fugir do default de IA), `audit-live-site.md`, `brand-to-design-md.md`, `3-designer-debate.md`, `remix-two-brands.md`.
- `recipes/` — `brand-extraction.md`, `figma-to-design-md.md`, `landing-page-20-min.md`, `repo-to-design-system.md`, `token-budget-claude-design.md`, entre outras.

## Regra da rede (QMIX)
Bate com o que o dono já pediu: fugir do default/AI-slop, identidade própria por site, **sem Fraunces/serif-default**. Não copiar 1:1 um DESIGN.md de referência — usar como direção e diferenciar. Aprovação por screenshot (ver o comando `/design-fable`).

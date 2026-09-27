---
name: css-critico-mobile-full-e-portas
description: "CSS crítico dos sites estáticos deve ser gerado com --mobile-full (senão o iPhone \"transforma\" a página ao abrir); conferir porta livre antes, servidores órfãos fazem o gerador ler outro site"
metadata: 
  node_type: memory
  type: project
  originSessionId: cc85d4da-b1bc-47c9-9cb6-b2d7b30c00b7
  modified: 2026-09-21T07:25:20.883Z
---

Em 21/09/2026 o dono do site do Dr. Eduardo viu a página "se transformar" ao abrir no
iPhone e fotos "achatadas". Causa: o `<style data-critical>` só cobria a primeira tela;
em 4G o resto renderizava sem estilo até o `style.css` assíncrono chegar. Nenhuma imagem
era deformada de fato, era o estado intermediário.

**Why:** o gerador `~/.claude/skills/pagespeed-audit/scripts/static_site_fix.py` filtrava
por dobra em 390 e 1280. Ganhou a flag `--mobile-full` (em 390 entra tudo o que a página
usa; desktop segue só a primeira tela). +4 KB por página, LCP igual (medido em 4G lento).

**How to apply:**
- Sempre rodar `static_site_fix.py <pasta> <porta> --mobile-full` nos sites Eduardo (8768),
  Henrique (8769, via `scripts/critical.py`) e Körpem (8770), depois de mudar `style.css`,
  trocando o `?v=` antes.
- **Antes, conferir que a porta está livre** (`netstat -ano | grep :<porta>`). Havia
  `http.server` órfãos de outros projetos nas portas 8768 a 8773; o gerador leu o site
  errado e produziu crítico de 2 KB. Crítico com 2 a 3 KB é sinal disso.
- Verificar com Playwright WebKit (`p.webkit`, `p.devices['iPhone 13']`) bloqueando
  `**/style.css*` e comparando posições dos elementos com o render completo; a meta é
  zero diferença. Ver [[redesign-direcao-a-aprovada]].

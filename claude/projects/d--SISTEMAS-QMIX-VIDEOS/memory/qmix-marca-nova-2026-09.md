---
name: qmix-marca-nova-2026-09
description: A logomarca da QMIX Digital mudou em 15/09/2026 para "QMIX | GEO • SEO • BACKLINKS", com versão compacta; a antiga "Backlinks & SEO" não entra em vídeo novo
metadata:
  type: project
---

**Aviso dele em 15/09/2026:** "a nossa logomarca mudou, consegue pegá-la no
site?". A marca nova é **QMIX | GEO • SEO • BACKLINKS**, com pontos verdes, e
tem versão **compacta** empilhada (QMIX em cima, tagline embaixo).

Instalada em `media/library/brand/`, renderizada dos SVGs do site em alta:
- `logomarca-qmix-branca.webp` (2480x420, 5,9:1) e `.svg`: horizontal, para
  topo de tela, thumbnail, `BrandMark`
- `logomarca-qmix-compacta-branca.webp` (1600x593, 2,7:1) e `.svg`: para
  **cartela de fechamento**, onde a marca é o herói
- `logomarca-qmix-escura.webp`: horizontal em tinta, para fundo claro
- `*-antiga.webp`: a marca anterior, só histórico

**A horizontal nova é 36% mais baixa na mesma largura** que a antiga (3,8:1).
Por isso os fechamentos do qmix-24 e do anúncio usam a compacta. Os vídeos
antigos (qmix-1 a 23) referenciam o mesmo caminho e pegariam a marca nova num
re-render, com o lettering menor: se algum for re-renderizado, conferir o fecho.

**Why:** marca errada num vídeo novo é o erro mais visível que existe, e o site
é a fonte da verdade da identidade (brand.md).

**How to apply:** `brand.md` já descreve os três arquivos e onde cada um entra.
Cloudflare barra navegador sem cabeça no qmix.com.br, mas `curl` com
user-agent de navegador baixa `/images/*.svg` e `*.png` normalmente.

---
name: qmix-adsense-ferramentas
description: AdSense ligado em ferramentas.qmix.com.br em 09/10/2026 (site aprovado): 3 unidades por DOM no layout (tools), regras de posição, política e como conferir
metadata:
  type: project
---

O Google aprovou qmix.com.br no AdSense em 09/10/2026 e o Anderson quis anúncio **só nas ferramentas** (ferramentas.qmix.com.br, route group `(tools)`); o site institucional segue sem.

**Como está:** `src/app/(tools)/ferramentas/_shared/AnunciosFerramentas.tsx` (cliente, inserção por DOM como o TabelasMobile) + CSS `.qmix-anuncio*` em `ferramentas.css` + ligação em `src/app/(tools)/layout.tsx`. Publisher `ca-pub-3880875536722698`; loader por `createElement` e meta `google-adsense-account` já existiam no layout; `public/ads.txt` ok.

Unidades: in-article **8802930110** antes do 1º `.qmix-content-block` (depois da ferramenta, nunca acima dela); in-article **7291251904** antes do 4º bloco só em página com 5+ blocos; display **4765426841** no fim (`<AnuncioRodape />`, antes do BannerEnjai). `empurrar()` só faz push em `.qmix-anuncio ins` (o adsbygoogle.js cria `<ins>` próprios que não podem receber push). Unidade `unfilled` some por CSS (`:has`). Política das ferramentas (`(tools)/politica`) tem o parágrafo do AdSense com opt-out.

**Why:** regra dele dos banners (afiliado): anúncio no início do conteúdo, nunca empilhado, teto por página; CLS zero (min-height reservada).
**How to apply:** ajuste de densidade = mexer em `inserir()` (índices dos blocos), não página por página. Conferir com `D:\tmp\ads-check.mjs` (Playwright: slots, data-ad-status, posição). Status `unfill-optimized` nos primeiros dias é o Google segurando, não erro. Ver [[padrao-ga4-adsense]] e [[ferramentas-subdominio]].

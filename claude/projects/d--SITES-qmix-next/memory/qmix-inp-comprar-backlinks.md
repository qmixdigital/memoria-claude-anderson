---
name: qmix-inp-comprar-backlinks
description: Causa da oscilação de ranking do qmix (INP mobile reprovado) e a otimização feita em 2026-06-23
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
---

A página `comprar-backlinks` do qmix.com.br oscilava no Google (#1 → página 3 → volta), independente da migração de VPS. Causa diagnosticada com dados de campo (CrUX/PageSpeed): **INP mobile = 1051ms (REPROVADO)** — a página falhava nos Core Web Vitals só no mobile; o INP na fronteira fazia o sinal de Page Experience ligar/desligar.

Raiz técnica: `src/app/(frontend)/comprar-backlinks/MarketplaceFilters.tsx` renderizava ~100 cards de uma vez (forçava `setVisibleCount(mapped.length)`) e re-renderizava tudo na thread principal a cada interação.

**Correção (2026-06-23, deployada):** paginação real (24 + "Ver mais"), `useDeferredValue` na busca, `ProdutoCard` com `React.memo`, reset de paginação ao filtrar. Resultado lab mobile: Performance 72→91, CLS 0.322→0, LCP 2.8→2.1s.

**Why:** o ganho real de INP é estrutural (24 vs 100 cards na interação) e só aparece no campo/CrUX, que é janela móvel de ~28 dias. **How to apply:** re-medir os Core Web Vitals por volta de **2026-07-21** com a chave em [[pagespeed-api-key]]; se o INP mobile cair para <200ms ("bom"), a oscilação deve estabilizar. TBT mobile (~330ms) é o próximo alvo se quiser ir além. Deploy é manual zero-downtime (build + `pm2 reload` x2 na srv1166087).

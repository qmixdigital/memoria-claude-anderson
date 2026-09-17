---
name: ga4-rastreio-joelho
description: GA4 do joelho (propriedade 378259356) configurado em 17/09/2026 com generate_lead {metodo, local, texto_botao} que o relatorio monitor-ia le; conta enjai tem edicao
metadata:
  type: project
---

Em 17/09/2026 o site passou a enviar `generate_lead` (whatsapp/telefone/email) com `metodo`,
`local`, `texto_botao`, `pagina`, mais `clique_rede_social`, `clique_mapa` e `view_search_results`.
Antes disso o site principal nao media clique nenhum (os 21 leads/mes vinham do WP do blog).

- Propriedade GA4 `378259356`, stream `G-78ZBT9EC66`. Conta com **edicao**:
  `C:\Users\User\Documents\APIs\enjai-493011-5bc78ff8f355.json` (ve 92 propriedades da rede).
- Feito na propriedade via Admin API: dimensoes `metodo`, `local`, `texto_botao`, `rede`;
  retencao 14 meses; medicao aprimorada completa. Dimensao nao e retroativa: anatomia do contato
  no relatorio so tem dado a partir de 17/09/2026.
- Relatorio `monitor-ia`, cliente `dr-ulbiramar`: `mostrar_contatos` e `rastreio_completo` ligados;
  Search Console trocado para `seoqmix-024e9465e9d9.json` (a `backlinkguard` dava 403).
  `LOCAIS_PT` ganhou `cta_artigo`.
- Vocabulario de `local` = o do `relatorio.py`. Usar os mesmos nomes em outros sites da rede.

**How to apply:** para instrumentar outro site, copiar `src/lib/rastreio.ts` + `Rastreio.tsx`,
por `data-local` nos CTAs com os nomes de LOCAIS_PT, criar as 4 dimensoes na propriedade e ligar
`mostrar_contatos`. Validar com `node _migracao/e2e-live.mjs` (mostra os hits do GA4).

---
name: rastreio-ga4
description: GA4 do drbrunoair.com.br via 94% das visitas invisíveis (consentimento obrigatório + blog WordPress sem tag); corrigido com Consent Mode v2, rastreio.js e engajamento.js, e relatório monitor-ia ganhou bloco de engajamento
metadata:
  type: project
---

**Diagnóstico (17/09/2026):** Search Console 5.091 cliques/30 dias, GA4 300
sessões. Duas causas: (1) o GA4 só carregava depois de "Aceitar todos" +
interação; (2) o blog WordPress (onde cai ~95% do tráfego) **nunca teve o tag**,
zero pageviews em /blog/* em 90 dias. O relatório mensal vinha mostrando 262
usuários e nenhum contato.

**Correção:** `analytics-consent.js` com Consent Mode v2 (carrega após
interação ou 4 s, consentimento negado por padrão, pings anônimos);
`js/rastreio.js` (padrão da rede, `generate_lead`) e `js/engajamento.js`
(novo: `social_click`, `cta_click`, `faq_open`, `leitura`, `video_play`);
propriedade 328805140 com 6 dimensões personalizadas, `generate_lead` como
evento-chave, retenção 14 meses. Testado com Playwright no site publicado:
hits saem com `gcs=G100` sem aceite e `G101` depois.

**Pipeline de relatório** (`D:\SISTEMAS\Relatórios de Clientes\monitor-ia`):
`google_dados.py` ganhou coleta de engajamento e `relatorio.py` o bloco
"Engajamento no site"; `config.json` do dr-bruno-air com `mostrar_contatos`
e `rastreio_completo` true e Search Console pela conta `seoqmix` (a
`backlinkguard` dava 403). Auditor: cliente `qmix` marcado `"agencia": true`
para a assinatura não acusar "cita outro cliente" nos 12 relatórios.

**Regra que fica:** ao auditar qualquer cliente, comparar sessões GA4 × cliques
GSC do mesmo período. Abaixo de 50% é rastreio quebrado.

Ver [[migrado-cloudflare-pages]].

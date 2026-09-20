---
name: qmix-landing-medicos-sp
description: "Landing de anúncio Meta /geo/medicos-sao-paulo (19/09/2026): route group (landing) sem menu, simulador pré-preenchido, WhatsApp único; pixel do Meta NÃO está no código"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-19T21:32:07.646Z
---

Criada em 19/09/2026 porque o anúncio "GEO médicos SP" mandava 71 visitantes para /geo e ninguém simulava
(tabela `geo_simulacoes` zerada para esse tráfego). URL: https://qmix.com.br/geo/medicos-sao-paulo (noindex, follow).

**Estrutura:** route group `src/app/(landing)/` com layout próprio (logo, rodapé de uma linha, `LandingConsent`
compacto; sem HeaderNav/Footer/WhatsAppButton/ConsumerAlert e sem providers). Página em
`(landing)/geo/medicos-sao-paulo/page.tsx`; botão em `CtaWhats.tsx` (dispara `fbq('track','Contact')` e
`gtag('event','whatsapp_click')` se existirem, via cast local, sem `declare global`, que quebra o
`@ts-expect-error` do CookieConsent). Print real do simulador em `public/images/landing-medicos-resposta-ia.webp`
(dermatologista SP, nomes borrados, inclusive o nome do médico citado na descrição do item 2).

**SimuladorIA ganhou props** para landing: `cidadeInicial`, `rotuloCategoria`, `placeholderCategoria`,
`semExemplos`, `paineisSoDepois` (painéis vazios só aparecem depois do clique). Continua sem provider, então roda
em qualquer layout.

**Redesign 19/09 (pedido do Anderson):** claro/escuro com `ThemeToggle` no cabeçalho da landing, visual "IA/futurista"
(grade + brilho verde, janela com prompt digitado e caret, cartões com feixe, faixa escura final), vídeo do GEO
reaproveitado (`VideoGeo`, horizontal no desktop e vertical no celular) e faixa de autoridade com duas fontes
externas conferidas: 71% dos brasileiros consultaram IA sobre saúde no último ano (Olá Doutor via CNN Brasil,
03/2026) e 50 milhões usam IA generativa, 69% na classe A (Cetic.br, TIC Domicílios 2025). Estado de espera do
simulador agora é próprio do componente (classes `sim-*`), porque as `geo-*` só existiam no CSS da /geo.

**Rastreio próprio (19/09, noite):** tabela `landing_eventos` (visita/whatsapp/simulacao/video, origem por
utm_source/fbclid, campanha, cidade via cf-ipcity, mobile) alimentada por beacon do `RastreioLanding`
(`(landing)/RastreioLanding.tsx`; SimuladorIA e VideoTeatro disparam `qmix:simulacao`/`qmix:video` no documento).
API `/api/landing/evento` só aceita páginas listadas em `PAGINAS`. Cron `relatorio-landing` no crontab do VPS
`0 11,23 * * *` UTC (08:00/20:00 SP) manda o resumo ao Telegram (12h vs 12h anteriores + acumulado). Nova landing =
adicionar em `PAGINAS` da API e em `LANDINGS` do cron. Anúncio Meta liberado pelo Anderson em 19/09 à noite.
Vídeo em modo cinema (`src/components/VideoTeatro.tsx`, usado também na /geo e nos YouTube do blog); cache do
simulador agora avisa "Resposta reaproveitada" com botão "Consultar ao vivo agora" (`aoVivo: true` na API);
bloco "Quem está por trás" (foto, CNPJ, link único para /qmix). Pendente conferir: primeiro relatório das 20:00
de 19/09 chegou no Telegram? (porta 22 estava bloqueada na hora).

**Pixel do Meta não existe no `src`** (nenhum `fbevents`/`fbq`); o evento Contact do botão só conta quando o
pixel for instalado. Se cair `tsc` com "Unused @ts-expect-error" no CookieConsent, é cache: apagar
`tsconfig.tsbuildinfo`.

**Why:** landing de tráfego pago precisa de uma ação só e copy leiga; a /geo é página de serviço com menu, preço
e jargão, e o público médico chegava e saía.

**How to apply:** novas landings de anúncio entram no mesmo grupo `(landing)`; medir por `geo_simulacoes`
(cidade São Paulo) e cliques no WhatsApp; para outra praça/nicho, copiar a página trocando print, cidade e
placeholder.

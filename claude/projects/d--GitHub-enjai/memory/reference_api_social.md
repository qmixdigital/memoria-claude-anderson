---
name: reference_api_social
description: "API Instagram/TikTok das ferramentas grátis — failover <<REMOVIDO>> + mediafy (RapidAPI), config e cotas"
metadata: 
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-08-11T10:55:13.052Z
---

**Ferramentas de Instagram/TikTok** (grátis, nos 4 sites) usam RapidAPI via `lib/instagram-api.ts` (cliente compartilhado, cache TTL 6h/30min + dedupe inflight).

**FAILOVER (desde 2026-08-11):** `RAPIDAPI_HOSTS` (env, default `"<<REMOVIDO>>.p.rapidapi.com,mediafy-api.p.rapidapi.com"`) — `fetchInstagram` tenta os hosts em ordem; em **429 (cota estourada), 401/403 (bloqueio) ou erro de rede** cai automático pro próximo. **<<REMOVIDO>> = primário**, mediafy = backup. Endpoints/param/resposta são **idênticos** entre os dois (`/v1/<endpoint>?username_or_id_or_url=`, resposta `{data:...}`) — são espelhos. Trocar ordem/hosts = só editar env + reload (sem rebuild). Endpoints usados: `info, posts, stories, reels, highlights, tagged, post_info` (post_info usa param `code_or_id_or_url`).

**Chave:** `RAPIDAPI_KEY` = `84140f0d0amshd45c5fc7e5b3a2ap10477ejsncca7d25423a5` (mesma nos 4 sites). ⚠️ **Cada API do RapidAPI tem cota SEPARADA** mesmo com a mesma chave: <<REMOVIDO>> = 30k/mês próprio, mediafy = 30k/mês próprio → ~60k combinado com o failover. **Apps/chaves diferentes na MESMA conta RapidAPI compartilham a cota** (não adianta criar chave nova na mesma conta p/ ganhar quota — provado). Consumo ~2.700 req/dia; p/ mais folga: upgrade de plano OU conta RapidAPI **separada** (login diferente) + adicionar host ao failover.

**REDUÇÃO DE CUSTO (2026-08-11):** análise dos logs nginx mostrou que **o Analisador de Perfil (`instagram-perfil`) do enjai = ~75-85% do consumo** e faz **2 chamadas/uso** (`info`+`posts`); validar-perfil (compra) é só ~8%. Medidas nos 4 sites: (1) **cache L2 persistente** — tabela `CacheInstagram(chave,payload Json,expiraEm)` lida/escrita no `fetchInstagram` (L1 memória + L2 DB), **sobrevive a deploy** (antes o cache em memória zerava a cada reload — maior causa de chamada duplicada); (2) **TTL_OK 6h→24h**; (3) **limite diário por usuário** no analisador — tabela `LimiteFerramenta(chave=email|dia, usos)`, cap **25 análises/dia/usuário** (429 se passar), via getToken. `posts` NÃO foi removido (é o dashboard). Pendente opcional: cron limpando `CacheInstagram` expirado.

**Histórico:** mediafy foi primário; <<REMOVIDO>> ficou "Blocked User" (401, bloqueio da conta inteira no provedor) por um tempo e **desbloqueou em 2026-08-11**. Proteção nginx `00-ferramentas-protect.conf` bloqueia curl/bot em `/api/ferramentas` (403) — testar app com User-Agent de navegador. Rota `validar-perfil` é ungated (fluxo de compra); demais ferramentas exigem login Google [[project_login_gate_ferramentas]].

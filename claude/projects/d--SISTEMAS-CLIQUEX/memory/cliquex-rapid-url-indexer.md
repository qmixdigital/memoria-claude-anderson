---
name: cliquex-rapid-url-indexer
description: API Rapid URL Indexer p/ empurrar URLs ao Google (chave em outra memória); só enviar quando o usuário pedir
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-08-17T15:13:53.002Z
---

**GATILHO (regra explícita do usuário, 17/08/2026):** quando ele pedir "enviar para indexação usando uma API" / "indexar via API" / "manda pra indexação" (sem nomear a ferramenta), é SEMPRE esta — **Rapid URL Indexer**. Não perguntar qual API; já saber. Empurra URLs específicas pro índice do **Google** (o IndexNow só atinge Bing/Yandex; ver [[cliquex-indexnow]]). Mesma ferramenta usada na rede de portais.

**Fluxo padrão ao receber o pedido:** montar a lista de URLs criadas/pedidas → POST único ("combo completo", o usuário prefere não fragmentar) em modo barato (`apex_mode_enabled:false`) → reportar project_id + créditos gastos + saldo. Enviado 17/08/2026: projeto **1108452**, 50 URLs novas do silo leilopora (12 provedores/temas + 24 cidades + 14 combos), 50 créditos.

Detalhes completos (chave `X-API-Key`, conta qmixdigital@gmail.com, endpoints `/wp-json/api/v1/...`, histórico) já estão na memória **`rapidurlindexer-api`** do projeto d--PORTAIS (`C:\Users\User\.claude\projects\d--PORTAIS\memory\rapidurlindexer-api.md`). Base `https://rapidurlindexer.com/wp-json`, POST `/api/v1/projects` com `{project_name, urls, apex_mode_enabled:false}`.

**Regras do usuário (críticas):** (1) modo mais barato por padrão — `apex_mode_enabled:false` = 1 crédito/URL. **EXCEÇÃO registrada em 2026-09-10:** quando ele pedir explicitamente "indexação Apex", confirmar o custo numa pergunta (Apex = 3 créditos/URL, devolve 1 por URL não indexada) e usar `apex_mode_enabled:true` se ele confirmar; foi o que aconteceu com o silo secundário do figa2023 (projetos **1172825** com 30 URLs e **1172826** com 12, 126 créditos, saldo 649→523); (2) **só enviar quando ele solicitar** — publicar e indexar são passos separados, indexar é decisão dele; (3) máx 30 URLs por projeto; (4) antes de enviar, perguntar QUAIS URLs entram. (5) **Armadilha 403**: sem `User-Agent` de navegador todos os endpoints dão 403 do LiteSpeed — sempre mandar UA Chrome. Consultar saldo/status não gasta crédito.

---
name: cliquex-worker-rotador
description: "O rodízio do cliquex.click roda num Cloudflare Worker (edge), imune a flood na origem"
metadata:
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-26T12:59:45.829Z
---

**FEITO 2026-07-26**: o rodízio de `cliquex.click` foi movido pra um **Cloudflare Worker** (edge) — o fix definitivo do flood (ver [[cliquex-ddos-hardening]]). O `/` (rodízio) e `/whatsapp-*` (campanhas) agora respondem NO EDGE, nunca tocam a origem, então flood na origem não afeta mais o lead. Admin `/clk` e `/api/*` continuam na origem nativos.

**Onde**: conta CF **Endrick** (`011fa32b46296a88d9ec00fc1b136f64`, = conta1/conta26 do contas.json), zona `cliquex.click` (`3b4b5ac0...`, Pro). Worker `cliquex-rotator`. Plano **Workers Paid** (Durable Objects exige). Fonte do Worker: `scratchpad/worker/worker.js` (+ metadata.json). Deploy via API: `curl -X PUT .../accounts/AC/workers/scripts/cliquex-rotator -F metadata=@metadata.json -F worker.js=@worker.js`. Token de Workers do usuário é `cfut_...` (Workers Scripts+KV+Routes; ele rotaciona — pedir na hora). O token da conta no contas.json (`cfat_...`) NÃO tem permissão de workers/routes; usar o `cfut_` pra rotas.

**Arquitetura (opção B — round-robin EXATO + contagem 100%)**:
- **KV** `CONFIG` (ns `246bd56d9d494ecab9f016b1119f6a05`): chaves `links` (array `[{id,url}]` ordenada), `campanhas` (`{slug:{id,url}}`), `ponteiro-seed`.
- **Durable Object** `RotadorDO` (SQLite — migração tem que ser `new_sqlite_classes`, o antigo `new_classes` foi bloqueado pela CF), instância única `idFromName("global")`. Guarda o ponteiro (contador atômico do round-robin) + buffer de cliques. `/next` incrementa e devolve o ponteiro; `chosen = links[(ponteiro-1) % N]`.
- **alarm() a cada 30s** (re-arma sempre, vira um cron): (1) GET `origin/api/rotator-config` → reescreve KV `links`/`campanhas` (config sempre fresca do banco); (2) POST `origin/api/rotator-sync` com o buffer de cliques → grava no banco, só limpa o buffer se a origem responder 2xx (nunca perde clique).
- Bindings do Worker: `ORIGIN=https://cliquex.click`, `SYNC_SECRET` (= `ROTATOR_SYNC_SECRET` do `.env` da origem). O DO fala com a origem via `cliquex.click/api/*` (NÃO é rota de Worker → vai pra origem, sem loop). UA do DO = `CliquexEdge/1.0` (passa pelo bot-block do nginx).
- Endpoints na origem (Next): `app/api/rotator-config` (GET, links+campanhas+ponteiro), `app/api/rotator-sync` (POST, aplica cliques + `ponteiro=GREATEST`), `app/api/rotator-seed` (GET). Todos exigem header `x-sync-secret`.

**Rotas do Worker** (só os caminhos quentes; resto fica na origem): `cliquex.click/`, `cliquex.click/whatsapp-*`, idem `www.`. TODAS as campanhas hoje são `whatsapp-*`; se criar campanha com outro prefixo, ela cai na origem (ainda funciona via `app/[slug]`), mas não fica no edge — se precisar, adicionar rota. Config nova (link/campanha criada no /clk) aparece no KV em até 30s (o alarm sincroniza).

**Regra de ouro mantida**: zona `cliquex.click` com `security_level=essentially_off`, Bot Fight off, SBFM allow, 0 regras WAF → nenhum desafio antes do Worker; o próprio Worker nunca bloqueia (bot só toma "peek" no 1º link, humano gira). Lead nunca travado. Ver [[cliquex-deploy]].

**EVOLUÇÕES 2026-07-26 (v2)** — 4 recursos novos, testados em staging isolado antes de promover:
1. **Failover**: o alarm faz HEAD em cada destino (5s timeout) → grava KV `links-health` `{id:bool}`; o Worker filtra offline do rodízio (se TODOS offline, usa todos — lead nunca sem destino). Recupera sozinho quando o destino volta. Status vai pro banco (`links.online`/`ultimoCheck`) e aparece no /clk (bolinha verde/vermelha).
2. **Clique bruto × válido**: o DO conta `{b,v}` por alvo. `válido` = humano provável: exclui prefetch (`Sec-Purpose`), ASN de datacenter (set `DATACENTER_ASN` no worker.js) e duplicata (mesmo `ipHash`+alvo em <90s; `ipHash`=FNV do CF-Connecting-IP, não guarda IP cru; dedup só em memória do DO). Colunas `cliquesValidos` + `cliques_hora.validos`. Serve pra comparar com sessões do GA.
3. **Dimensões**: por clique VÁLIDO agrega país (`cf.country`), dispositivo (UA mobile/desktop) e referrer (host do `Referer`) → tabela `cliques_dimensao(dia,tipo,valor,cliques)` (upsert, dia fuso SP). Painel /clk/reports mostra os 3 blocos com barras. Referrer mostra de qual site do usuário veio o clique.
4. **Peso por link**: coluna `links.peso` (1-50). O `rotator-config` gera a sequência de rodízio já expandida+intercalada por **smooth weighted round-robin** (algoritmo do Nginx) — o Worker continua RR simples na lista (não mudou a lógica quente). Peso 1 pra todos = ordem normal (retrocompat). Campo no form /clk/new e /clk/edit.

Payload do DO→`/api/rotator-sync`: `{ponteiro, links:{id:{b,v}}, camps:{id:{b,v}}, dims:{tipo:{valor:n}}, health:{id:bool}}` (o sync aceita também número puro p/ retrocompat). Testar Worker sem sujar prod: deploy script `cliquex-rotator-stg` com KV+DO próprios e binding `STAGING=1` (pula o push pro banco); apagar (worker+KV) ao terminar. **Cuidado com peso/config**: mudar peso no banco afeta prod na hora (config compartilhada) — não dá pra testar peso em staging sem afetar prod; testar a lista expandida escrevendo KV staging à mão.

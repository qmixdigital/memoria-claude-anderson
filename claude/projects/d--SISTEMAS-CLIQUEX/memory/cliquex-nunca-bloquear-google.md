---
name: cliquex-nunca-bloquear-google
description: "Regra absoluta: nenhum site da rede pode bloquear o Googlebot; todas as zonas CF têm skip de verified bot"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-29T14:54:50.968Z
---

**REGRA ABSOLUTA (2026-07-29)**: nenhum site da rede pode bloquear/desafiar o **Googlebot** — isso derruba o site da SERP (o usuário viu expoind2025 cair de 1º lugar). Exceção única: **cliquex.click** (a ferramenta de rodízio, NÃO deve ser indexada).

**Blindagem aplicada em todas as 29 zonas ativas da conta Endrick** (011fa32b): regra WAF custom de **topo** com `action:skip`, `expression:(cf.client.bot)`, pulando `phases:[http_ratelimit, http_request_firewall_managed]` e `products:[waf, rateLimit, securityLevel, bic, uaBlock, hot, zoneLockdown]`. Ou seja, verified bots (Googlebot/Bing, validados pela CF por IP — não falsificável por UA) passam por TUDO: WAF, rate-limit, security level (mesmo high/under_attack), challenge. Script: scratchpad `blindar-google.py`.

**Auditoria**: `curl -A "Googlebot..." https://dominio/` DEVE dar 200/301/302. As 5 zonas que deram `000` (bitcao, estudiounidesign, masterjuris, ticketson, truenet) são domínios **sem site ainda** (DNS não resolve) — já blindados pra quando forem ao ar. Ao criar regra WAF nova em qualquer zona, SEMPRE manter a regra skip de verified bot no topo.

**BLINDAGEM EM MASSA (2026-07-29)**: varri TODAS as contas CF do usuário (tokens em `D:\SISTEMAS\Cloudflare\contas.json` + token analytics avulso). **449 zonas únicas** no total; **434 blindadas** com a regra skip de verified bot. Casos especiais: (1) **2 sites WordPress bloqueavam o Googlebot com HTTP 429** (rate-limit pegando o Google): `ortopedistadeombro.com.br` e `pontonaturalbrasil.com.br` — corrigidos ESTENDENDO a regra `skip` "[WP] Bypass para Admin e Ads" que já existia (add `or (cf.client.bot)` na expressão + phases `http_ratelimit`/`http_request_firewall_managed`/`http_request_sbfm`), sem adicionar regra (Free = 5 regras max). Token que edita esses: `cfut_reEz...` (analytics-novo). (2) **12 zonas** já com 5 regras (max) não couberam a skip, MAS já dão Googlebot 200/301 (não bloqueiam) — não urgente: azulmagazine, blogse, curiosododia, divirto, docesletras, ebookcult, guia55, livrariaatlantico, medicinageriatrica, opopularjornal, publisherbrasil(*), wtw19(*). (3) **rblc.com.br (2º), criexp.com.br (8º), revan.com.br (12º)** — conta3, blindados individualmente, Googlebot OK. (*) publisherbrasil/wtw19: token só lê, não edita — mas Googlebot passa.

**ATAQUE COORDENADO 28-29/07/2026**: quando os sites da rede começaram a rankear, sofreram flood massivo simultâneo (confirmado via GraphQL `httpRequests1dGroups`, token com Analytics:Read). Alvos: **fnem.com.br (31M reqs/dia, 5,4M ameaças — o maior)**, anufoodbrazil (2,1M), aesupar (1,8M), expoind2025 (1,8M), cieh (786k) — vs ~1.700 reqs/dia normais. O expoind saiu da SERP no dia do ataque (não foi bloqueio nosso — Googlebot dava 200; foi o flood/SEO negativo). Nenhum caiu (todos no Pages/edge). **Reforço aplicado nos 5**: `security_level=high` + Bot Fight Mode (já ON) + rate-limit 200req/10s→block + skip verified bot. Escudo extra disponível se escalar: `security_level=under_attack` (Googlebot blindado passa, mas põe fricção 5s em usuário real — usar só se necessário). Token Endrick NÃO edita `/bot_management` (erro 10405); precisa token com Bot Management.

**cieh.com.br** (top-3 Google, estático no Pages): recebeu 3 regras WAF extras (só GET/HEAD; block ferramentas de ataque+UA vazio; block paths de exploit) + a skip do Google. Sites no Pages são imunes a "derrubar servidor" (edge, sem origem). Ver [[cliquex-sites-pages]], [[cliquex-ddos-hardening]].

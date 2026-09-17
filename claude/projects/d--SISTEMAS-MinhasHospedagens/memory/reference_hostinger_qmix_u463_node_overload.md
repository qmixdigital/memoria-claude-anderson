---
name: reference_hostinger_qmix_u463_node_overload
description: "hostinger-qmix (conta u463007860, nó br-asc-web1659.main-hosting.eu) sofre flapping diário (up 25-35min / down ~10min, erro 'This operation was aborted'/522) por oversubscription: 30+ sites WP estourando LVE. NÃO é ataque. Fix: cache HTML no CF edge / ticket Hostinger / mover pesados p/ VPS."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-28T21:32:07.297Z
---

# hostinger-qmix (u463007860) — nó compartilhado sobrecarregado

**Alias SSH:** `hostinger-qmix` = 82.112.247.158:65002, conta Hostinger **u463007860**, nó físico compartilhado **`br-asc-web1659.main-hosting.eu`**. É DIFERENTE do "qmix" do hostverge ([[reference_hostverge_qmix_oversubscription]]) — outra hospedagem, mesmo nome de conta confuso.

**Sintoma (23/07/2026, dia todo):** ~7 sites da conta flapam em ciclos — no ar 25-35min, fora ~10min — com erro **`This operation was aborted`** (timeout do bot healthcheck) e **HTTP 522** (CF não alcança a origem). SSH:65002 também cai junto (não é fail2ban do meu IP: confirmado de 3 redes — minha, vps1, Anthropic). O flapping é tão forte que fecha sessão SSH de 30s no meio.

**Causa:** oversubscription. `uptime` no nó = **load average ~24 sustentado** (23/24/24). 30+ sites WP numa conta só estouram limite de entry-process/IO do LVE CloudLinux → PHP enfileira, requisições dão timeout intermitente. `lveinfo`/`/proc/user_beancounters` não expõem dados pro user (sem permissão). **NÃO é ataque, NÃO é efeito de remoção de backlink, NÃO é IP bloqueado.**

**Sites da conta que flaparam:** barranews.com.br, folhadonoroeste.com.br (3.7G uploads), folhar.com.br (1.2G), desassossegada.com.br (1.2G), oiempreendedores.com.br, itacaiugo.com.br, belemduartealmeida.com.br. Todos em `/home/u463007860/domains/<D>/public_html`. Disco da conta OK (54% de 21T no nó).

**anderson-gna (u400588174, 147.79.91.52):** no mesmo dia deu SSH `rc=255` (varredura de integridade "vigia cego") + origem 522. Não confirmado se é o mesmo overload ou problema próprio do nó dela.

**Fix (ordem de custo/benefício):**
1. **Cachear HTML na borda do Cloudflare** (Cache Everything + edge TTL, bypass em wp-admin/wp-login/cookie wp-logged-in) — leitor anônimo servido do edge, origem quase não roda PHP, alivia LVE na hora. São portais de notícia (tráfego anônimo), cache de HTML é seguro. Usar API em `D:/SISTEMAS/cloudflare`. É o que a nota do hostverge também recomenda.
2. **Ticket Hostinger** (só o Anderson, no hPanel) pedindo migração da conta pra nó menos carregado.
3. **Mover os pesados pra VPS** (opengravity/srv1166087): folhadonoroeste, barranews, folhar, desassossegada.

## Atualização 28/07/2026 — reconfirmado (qmix E vps1 juntos) + FIX aplicado
Novo episódio: dois grupos flapando juntos — os 7 da qmix (u463) + ~34 da **vps1 (u651115354)**. O bot gritou "NULLROUTE/DDoS provável" (texto pré-programado, heurística SSH-timeout+N-sites) — **FALSO**. Evidência que derruba a tese de ataque: sites respondem **200 em <1s** da minha máquina E da opengravity; SSH funciona nas duas; **qmix load ~30, vps1 load ~51 em nós de 64 cores**; nossos processos consomem quase nada (9 lsphp qmix, 40 vps1, todos <7% CPU) → carga é dos VIZINHOS (oversubscription) + teto LVE sob rajada. Monitor: `dist/monitor/sites.js` na opengravity (PM2 app `opengravity` id 11), batch 10, 2-falhas-consecutivas. Usa **GET** (pega o cache). Timeout **subido 15s→30s em 28/07** (`sed abort(),15000→30000` + `AbortSignal.timeout`; backup `.bak-timeout`; `pm2 restart opengravity`) — reduz o falso "operation aborted" (o visitante já pega cache HIT; agora a origem lenta tem 30s antes de marcar fora). O alarme "NULLROUTE/DDoS" segue sendo texto pré-programado/falso.

**FIX client-safe aplicado — microcache no CF edge:** `D:\SISTEMAS\cloudflare\cache_wp_edge.py <dominios>` cria 2 Cache Rules (cache-everything 300s + BYPASS wp-admin/wp-login/wp-json[Antônio]/xmlrpc/wp-cron/qualquer-POST/cookie-logado/wp-postpass/comment/busca/preview). NUNCA bloqueia: anônimo GET→HIT (alivia origem), logado/form/admin→DYNAMIC. **Hardening NÃO resolve** (advdobrasil/qmiximoveis/pael já hardened e flapavam) — só cache.
- **BUG corrigido no script:** criação do entrypoint de cache mandava body `{name,kind,phase,rules}` → HTTP 400 "unknown field kind". Correto = PUT `{'rules':[...]}` só. Corrigido.
- **Aplicado + verificado (HIT anônimo / DYNAMIC logado):** qmiximoveis, advdobrasil, carretaspresidente, comprarvisualizacoes, energiaeficiente, jornalexpresso, pael, sejanoticia (8).
- **BLOQUEIO nos outros ~31 (PENDENTE, só operador no dash CF):** em `contas.json`, **conta11 e conta25 = token INVÁLIDO** e **conta10 sem permissão Cache Rules (403)**. Maioria das zonas flapando está nessas contas → "zona não localizada". Ação: regenerar tokens conta11/conta25 + add permissão **Zone→Cache Rules→Edit**; depois rodar `cache_wp_edge.py` no restante. Alternativa sem token: LiteSpeed page cache na origem via SSH (parece já ativo).

Relacionado: [[reference_hostverge_qmix_oversubscription]] (mesmo tipo de problema, outra hospedagem), [[reference_site_healthcheck]] (bot que dispara os alertas), [[reference_cloudflare_api_hardening]] (tokens/ferramenta CF).

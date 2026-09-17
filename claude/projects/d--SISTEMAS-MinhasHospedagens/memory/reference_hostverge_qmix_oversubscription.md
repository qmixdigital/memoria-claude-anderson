---
name: reference_hostverge_qmix_oversubscription
description: "Conta compartilhada qmix.com.br na hostverge (CloudLinux/LVE) está superlotada (30+ sites WP); sites pesados (wtw19, jornalconceito, saudeacessivel) dão 503/508 intermitente por limite de recurso da conta, não por crash."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

A conta SSH **`hostverge`** cai no usuário **`qmix.com.br`**, home **`/home/sites/18a/7/7672b9147f/`**, com **`public_html/<dominio>/`** por site (~30+ domínios WP no mesmo `public_html`: df8.com.br, jornalconceito.com, saudeacessivel.com.br, wtw19, agoranoticias.net, cirurgia*, etc.). É **CloudLinux/LVE** (kernel el9) — limite de CPU/EP/PMEM **por conta**, compartilhado entre TODOS os sites. wp-cli em `/usr/local/bin/wp`; usar `wp --path=$HOME/public_html/<site>`.

**wtw19.com.br (diagnosticado 2026-06-18):** WordPress 7.0, **2454 posts**, tema **SmartMag (smartmag-core/sphere-core) + Elementor**, plugins Wordfence + Independent Analytics (iawp) + Google Site Kit + qmix-feed-import + LiteSpeed Cache. Caía constantemente (HTTP **503**, às vezes timeout "operation aborted"), atrás de **Cloudflare em modo DYNAMIC (NÃO cacheia HTML)**.

**Causa = limite de recurso da conta (508→503), NÃO crash:** `error_log` do site vazio (sem fatal/memory), sem processo PHP descontrolado, sem malware (o arquivo de nome aleatório `dMQoNL...` é só cookie-jar do libcurl), só o admin legítimo `suporte`. LiteSpeed: cache de página LIGADO (=1), CCSS/UCSS/crawler já DESLIGADOS. O problema é **oversubscription**: 30+ sites WP pesados disputando o mesmo limite LVE; wtw19 (o mais pesado) + jornalconceito + saudeacessivel (MESMA conta) estouram juntos → 503 simultâneo (por isso os 3 alertam juntos no [[reference_site_healthcheck]]).

**Fixes (ordem de impacto):**
1. **Cachear HTML no Cloudflare** (Cache Rule + bypass wp-admin/logado) nos sites mais movimentados — tira ~90% dos hits do PHP. É o alívio mais rápido. ✅ **APLICADO em wtw19.com.br (2026-06-18):** zona `ce5139f1f2a6328b06b8f59411d8de3c` (plano Free), cache rule na phase `http_request_cache_settings` — cacheia GET anônimo, bypass de `/wp-admin` `/wp-login.php` `/wp-json` e cookies `wordpress_logged_in`/`wp-postpass`/`comment_author`, edge_ttl override 1800s (30min), browser_ttl respect_origin. Validado: homepage e artigos dão `cf-cache-status: HIT` (testar com GET real, NÃO `curl -I`/HEAD — a regra exige method GET). CAVEAT: sem auto-purge no CF, post novo do feed-import só aparece em páginas cacheadas após 30min (LiteSpeed purga só o cache da origem, não o do CF) — se precisar de frescor instantâneo, baixar o edge_ttl ou ligar a integração Cloudflare no plugin LiteSpeed (CDN > Cloudflare API) p/ purgar CF no publish. Token CF do usuário cobre SÓ a zona wtw19 (jornalconceito.com e saudeacessivel.com.br não foram alcançadas — outra conta CF ou token zona-scoped; pedir token dessas zonas p/ replicar).
2. **Mover os sites mais pesados (wtw19) para VPS** (srv1166087/opengravity têm capacidade) — solução definitiva da oversubscription. Ver receita [[reference_portal_engine_migration_recipe]] se for converter, ou migração WP normal.
3. **Upgrade do plano hostverge** (mais CPU/EP) ou redistribuir sites entre contas.
4. Per-site: `DISABLE_WP_CRON` + cron de sistema (só se confirmar que há cron real), reduzir carga do Wordfence (scan/live-traffic).

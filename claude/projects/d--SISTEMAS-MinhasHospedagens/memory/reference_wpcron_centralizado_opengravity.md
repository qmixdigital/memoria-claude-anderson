---
name: reference_wpcron_centralizado_opengravity
description: "Runner de wp-cron centralizado da rede QMIX em opengravity:/opt/qmix-wpcron/ — cron 13,43 * * * * pinga o wp-cron.php dos 116 sites da allowlist. Cobre sites com DISABLE_WP_CRON no shared (onde crontab de usuário é bloqueado). Também domei Wordfence live-traffic na rede."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-25T23:39:46.045Z
---

# wp-cron centralizado da rede (opengravity) + Wordfence tuning (25/07/2026)

**Problema:** Hostinger shared **bloqueia `crontab` de usuário via SSH** (só hPanel). Sites da rede com `DISABLE_WP_CRON` ficavam com tarefas agendadas paradas, e o wp-cron disparado por visita é o vetor de loopback do DDoS (ver [[reference_anderson_gna_ddos_nullroute_wpcron]]).

**Solução — runner centralizado em `opengravity:/opt/qmix-wpcron/`:**
- `sites.txt` = 116 domínios da `rede-publicacao-allowlist.txt`.
- `run.sh` = curl `https://$dom/wp-cron.php?doing_wp_cron=1` em cada site, stagger 1s, loga em `last-run.log`.
- Crontab root: `13,43 * * * * /opt/qmix-wpcron/run.sh` (a cada 30min, minutos off-peak).
- Seguro/idempotente: wp-cron tem lock próprio; ping redundante em site sem DISABLE_WP_CRON não causa dano; site não-WP dá 404 inofensivo.
- **Manutenção:** pra adicionar/remover site, editar `/opt/qmix-wpcron/sites.txt`. Testar 1 site: `curl -m15 -o/dev/null -w '%{http_code}' https://DOM/wp-cron.php`.
- barranews teve um cron dedicado antes deste (`*/30 curl barranews.../wp-cron.php` no root crontab) — redundante com o runner agora, pode remover se quiser.

**Wordfence tuning de rede (mesmo dia):** em ~67 sites WP (anderson-gna+qmix+vps1) desliguei `liveTrafficEnabled` (UPDATE wp_wfconfig) + `TRUNCATE wp_wfhits`/`wp_wffilemods` — o log de tráfego ao vivo escrevia no banco a cada request = maior consumidor constante. **MANTIVE `scheduledScansEnabled`** (scan de malware, segurança pós-euvo). No barranews especificamente também desliguei o scan agendado (pedido "nota 10"). Script: scratchpad `optimize_network.sh` (também limpa transients expirados + spam; allowlist-scoped).
- ⚠️ **Gaps do optimize_network.sh:** (1) glob `/home/*/domains` + `~/domains` processa cada site do próprio host 2× (idempotente, sem dano, só infla contagem); (2) **hostverge NÃO coberto** — layout é `public_html/<dom>/wp-config.php`, não `<dom>/public_html/`; ajustar o glob pra pegar hostverge.

**Prevenção anti-DDoS/nullroute (mesma sessão 25/07):**
- **mu-plugin `qmix-harden.php`** deployado em **79 sites** (allowlist): desativa xmlrpc + `xmlrpc_methods` vazio (mata pingback.ping SSRF e system.multicall = vetores de amplificação do ataque de hoje), remove header X-Pingback, desativa self-pingback, bloqueia enumeração de usuário (REST /wp/v2/users p/ não-logado + ?author=N). Também liguei **auto-update** (WP_AUTO_UPDATE_CORE=minor + plugin auto-updates --all). Todos os sites estavam em **WP 7.0.2** (core atual, não era o vetor). Script: scratchpad `deploy_harden.sh` + `qmix-harden.php`.
- **Detector de nullroute** em `opengravity:/opt/qmix-nullroute-watch/check.sh` (cron `*/11`): se o SSH da hospedagem (anderson-gna/qmix) der timeout E ≥2 sites de amostra caírem (000/52x) juntos → alerta 1x no Telegram (@qmixdigital_bot chat <<REMOVIDO>>) com a mensagem pronta pro suporte Hostinger + os passos (deletar WP abandonado + Under Attack). Evita as horas de misdiagnóstico de hoje. State em `.../state/<host>.alerted` (limpa quando SSH volta).
- **Órfãos:** auditoria `audit_orphans.sh` lista WP fora da allowlist (clientes + migrados + staging). Deletei só 2 staging (`darkcyan-narwhal-224012` + `steelblue-turkey-830737.hostingersite.com`) na qmix. Operador MANDOU MANTER os velhos/parados (energiaeficiente 2022, tratamentodor 2021, carretaspresidente, pael, comprarvisualizacoes, itacaiugo, belemduartealmeida) — NÃO deletar sem novo pedido. Clientes (pneusemgoiania, qmiximoveis, advdobrasil, blog.aplusplatform) intactos.
- **Fora do alcance autônomo:** cache de HTML no edge do Cloudflare (blindagem definitiva contra origem saturada) — inviável manual pq os domínios estão espalhados em dezenas de contas CF diferentes; e o estrutural (mover pesados de shared p/ VPS). Dependem de decisão/custo do operador.

Relacionado: [[reference_anderson_gna_ddos_nullroute_wpcron]], [[reference_content_pruning]], [[reference_hostinger_qmix_u463_node_overload]].

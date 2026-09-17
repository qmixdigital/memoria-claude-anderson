---
name: reference_anderson_gna_ddos_nullroute_wpcron
description: "anderson-gna (u400588174, server1528): TODOS os 46 sites 522 + SSH/FTP timeout de qualquer rede, boost sem efeito = IP NULLROTEADO pela Hostinger por DDoS amplificado por loopback do WP-Cron. Fix: DISABLE_WP_CRON + cron de sistema + CF Under Attack. Não confundir com sobrecarga de recurso."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-25T22:37:25.914Z
---

# anderson-gna: DDoS + WP-Cron loopback → IP nullroteado (25/07/2026)

**Conta:** `hostinger-anderson-gna` = u400588174, **Cloud Startup**, servidor **server1528**, IP 147.79.91.52, 46 sites WP. Chave SSH minha registrada = `id_ed25519_anderson_gna` (pub termina `...LxLqB`; adicionada como "claude-anderson-gna" — a antiga "claude-fix-css" `...Ib7wX3` NÃO é minha).

**Sintoma:** todos os 46 sites em **HTTP 522**, **SSH e FTP em timeout** (aceita TCP mas não responde / banner-exchange timeout), visto de 3 redes (minha, opengravity, Anthropic). **Boost de recursos 24h não teve efeito.** Kodee (AI) via "servidor normal, CPU/mem/proc ok, IP não bloqueado no firewall".

**CAUSA REAL (achada pelo suporte humano James, que tem acesso ao nó):** o **IP estava em NULLROUTE** — a Hostinger nullroteia o IP quando o servidor sofre **DDoS**. Aqui foi amplificado por **loopback do WP-Cron**: WordPress cron padrão faz o site chamar a si mesmo; sob tráfego intenso/ataque isso vira milhares de conexões internas simultâneas → estoura RAM/CPU. Nullroute = pacotes descartados ANTES de chegar no servidor → por isso TUDO dá timeout de qualquer rede, e boost/kill/API não adiantam (é rede, não recurso). Domínios que geravam o loopback: creatinadicas.com, cameracotidiana.com.br, azulmagazine.com.br, incast.com.br.

**FIX (do James):**
1. **Desativar WP-Cron:** em cada wp-config.php, antes de "stop editing": `define('DISABLE_WP_CRON', true);`
2. **Cron de sistema** (hPanel → Avançado → Cron Jobs, a cada 30min), 1 por domínio — ⚠️ o comando que ele colou PERDEU a URL; o certo é `wget -q -O - https://DOMINIO/wp-cron.php >/dev/null 2>&1`
3. **Cloudflare Under Attack Mode + Bot Fight Mode** nos domínios. ⚠️ UAM bloqueia o publicador do Antônio (POST /wp-json) — é emergência, DESLIGAR quando estabilizar.
- Enquanto nullroteado: SSH/FTP impossíveis; **Gerenciador de Arquivos do hPanel funciona** (roda pelo control plane, não pelo IP). Editar wp-config por ali.

**Diagnóstico-chave pra próxima vez:** se TODOS os sites de uma conta caem juntos + SSH/FTP timeout de qualquer rede + boost não resolve + suporte diz "servidor normal" → suspeitar **NULLROUTE por DDoS**, não sobrecarga. Só suporte humano confirma (Kodee não vê nullroute com clareza). Pedir: "meu IP está nullroteado? por quê?".

**RESOLVIDO 25/07:** usuário deletou as instalações WP abandonadas (incl. creatinadicas.com) → tráfego caiu → Hostinger removeu o nullroute → sites 200, load ~2, SSH de volta. WP-Cron confirmado desativado em todas as 38 instalações WP da conta. universoneo revisado: **NÃO comprometido** (core verifica checksums, zero PHP em uploads, único admin=suporte/qmixdigital@gmail.com); o 1,46GB era conteúdo auto-importado + logs Wordfence; dropei ~600MB de backups + tabelas wp_automatic órfãs.

**WP Automatic DECOMISSIONADO na rede toda (25/07, "não usamos mais"):** varredura completa nas 6 hospedagens. Único ativo = `comprarvisualizacoes.com` (vps1) — desativado + pasta deletada. Resíduo de tabelas `wp_automatic_*` limpo em 26 sites (17 anderson-gna + 5 vps1 + 4 qmix). srv1166087/opengravity/hostverge limpos. NÃO reinstalar. Scripts: scratchpad `cleanup_automatic.sh`/`scan_automatic.sh`.

**Backlinks removidos (25/07, CONCLUÍDO):** mu-plugins zzz-footer-aesupar/band/criexp.php apagados de 12 sites (euvo antes; +9 anderson-gna: adonline/advivo/ebookcult/incast/diariopernambucano(band)/jornaldobairroalto/opopularjornal/saberdefato/universoneo; +2 qmix: barranews/oiempreendedores) e verificados LIMPO no HTML. **Pegadinha do cache LiteSpeed:** `wp litespeed-purge all` dá 403 (WAF/UA vazio); o que funciona é `wp litespeed-option set cache false` depois `true` (toggle = purge total) + `rm -rf wp-content/litespeed/*`. Token API Hostinger da conta (só leitura/DNS/delete, sem restart) salvo pelo usuário. Relacionado: [[reference_antonio_endpoint_recovery]], [[reference_hostinger_qmix_u463_node_overload]].

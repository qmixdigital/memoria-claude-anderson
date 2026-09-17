---
name: sistema-de-remo-o-de-links-externos-da-rede-qmix
description: Mu-plugin oie-link-audit.php deployado em 129 sites da rede. Comando wp oie audit-links audita/remove links externos preservando post_modified e gravando backup. Workflow + scripts em D:\SISTEMAS\MinhasHospedagens\LINK_REMOVAL.md + scripts/link-audit-network.sh.
metadata: 
  node_type: memory
  type: reference
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
---

Sistema de auditoria e remoção de links externos na rede QMIX, implementado em 2026-05-27.

**🚨 REGRA CRÍTICA (2026-06-24) — USAR ALLOWLIST, NUNCA ITERAR A REDE TODA:** o sweep antigo iterava TODOS os `*/public_html` de cada host, o que inclui **sites de CLIENTES**. Funcionou por sorte (clientes não tinham os backlinks send-remove), mas com qmix.com.br os clientes (pneusemgoiania, tratamentodor) TÊM o link e eu quase mexi. **Sempre processar SOMENTE os domínios da allowlist** `D:\SISTEMAS\MinhasHospedagens\rede-publicacao-allowlist.txt` (rede de publicação, 92 WP + 12 portais, exclui clientes/staging/Next.js/próprio). Em cada loop, checar `grep -qxF "$dominio"` na allowlist antes de remover. Clientes em [[sites-de-clientes-na-rede-principal-qmix]]. Classificação saúde resolvida 2026-06-24: matogrossosaude, medicinageriatrica, ortopediacoluna, ortopedistadeombro, planomedicosaude, revistatopsaude, saudeacessivel, saudeemalta, saudevitalidade, saudicas, noticiasdiarios = REDE (na allowlist). Só **revistamsaude.com.br = CLIENTE** (fora).

**Mu-plugin** `oie-link-audit.php` deployado em **129 sites** das 4 hospedagens (anderson 46 + qmix 10 + vps1 46 + hostverge 27). Registra comando WP-CLI `wp oie audit-links`.

**Características técnicas:**
- Audit: lista posts com `<a href>` apontando para domínios alvo
- Remove (mode=text default): substitui `<a href="alvo">texto</a>` por apenas `texto`
- Modos: `text`, `nofollow` (add rel), `placeholder` (href=#)
- Preserva `post_modified` via `$wpdb->update` direto (NÃO usa `wp_update_post`)
- Backup do `post_content` original em `_postmeta.oie_link_removed_<timestamp>` (reversível)
- Cache flush automático via `clean_post_cache()`

**Comandos:**
```bash
# Audit
wp oie audit-links --domain=alvo.com,outro.com

# Remover (text mode)
wp oie audit-links --domain=alvo.com --remove

# Dry-run
wp oie audit-links --domain=alvo.com --remove --dry-run

# Outros modos
wp oie audit-links --domain=alvo.com --remove --replacement=nofollow
```

**Bug conhecido:** flag `--json` não funciona (output continua summary). Parsear summary direto: `Posts: \d+` e `Links: \d+`.

**Orquestração network-wide:**
- Script: `D:\SISTEMAS\MinhasHospedagens\scripts\link-audit-network.sh`
- Uso: `./link-audit-network.sh audit "dom1.com,dom2.com"` ou `./link-audit-network.sh remove "..."`
- Itera 4 hostings via SSH alias, agrega summary
- Output: `pruning-audits/link-<mode>-<host>-<date>.txt`

**Reversão:**
Cada post mutado tem meta `oie_link_removed_<TS>` com `post_content` original. Reverter via UPDATE direto preservando post_modified.

**Histórico de rodadas:**
- 2026-05-27: 6 domínios IPTV removidos (flowplay.com.br, generation.com.br, iptvai.tv, brasil247.com, revendaiptv.me, welessonoliveira.com.br). 61 sites afetados, 538 posts modificados, 547 links removidos. Reports em `pruning-audits/iptv-removal-*.txt`.
- 2026-06-06: enjai.com.br removido (modo text, âncora preservada). **88 sites** (anderson 38 + qmix 4 + vps1 36 + hostverge 10), 426 posts, **612 links removidos**. Re-audit pós-remoção = 0 em todas as 4 hospedagens. Portais estáticos (portal-engine) limpos (0). Backup reversível por post em `_postmeta.oie_link_removed_<TS>`.

**Bug do orquestrador (link-audit-network.sh):** com `set -e` + `grep -v` no final do pipe de cada hosting, quando o resultado é ZERO o grep retorna 1 e aborta o script (re-audit de verificação "falha" com exit 1 mesmo estando tudo certo). Pra verificar zero, usar loop tolerante (`T=$((T+${L:-0}))`, sem set -e) somando `Links: \K\d+` por site.

**PONTOS CEGOS (descobertos 2026-06-14) — o orquestrador NÃO cobre tudo:**
1. **WP com comando quebrado:** blogse.com.br, qmixdigital.com.br (anderson), desassossegada.com.br (qmix) têm a classe `OIE_Link_Audit_Command` no `functions.php` do tema mas SEM registrar `audit-links` → comando dá erro, loop pula como 0 hits. NÃO copiar mu-plugin (conflito de classe = fatal/derruba front). Remover via `wp eval-file` (regex strip de `<a href=...dom...>txt</a>`→`txt`, backup `_postmeta.oie_link_removed_<TS>`, `$wpdb->update` direto). Verificar real via `wp db query "... post_content REGEXP '<a[^>]+dom[.]com'"` (cuidado falso-positivo de `data-id=`).
2. **Portais portal-engine (não-WP, srv1166087):** romanceseleituras, projetob, todossomosgeek, jornaldiario, medicodasmaos. Conteúdo em `/srv/portais/<slug>/data/*.json` (campo content/dek/excerpt). Remover editando JSON + `rebuildIndexes(cfg,site)` do `/opt/portal-engine/src/render.js`, rodando como user `portais` (`runuser -u portais`). Cloudflare DYNAMIC (sem purge). Detalhes e scripts em LINK_REMOVAL.md seção "PONTOS CEGOS DO SWEEP".

**Use isso quando:**
- Operador pedir pra remover links pra domínios específicos
- Domínio parceiro descomissionado, expirou contrato, ou virou problema legal
- Quiser auditar quais sites linkam pra X (audit-only)
- Migrar/consolidar PBN (skill rule 14 contexto)

**NÃO usar para:** modificações de conteúdo geral, mudança de URL interna (use wp search-replace), ou casos onde a remoção do link quebraria o sentido do parágrafo (caso preferir nofollow ao invés de text).

---
name: reference_iptv_backlink_scan_removal
description: "Como varrer a rede por links externos (por âncora ou por domínio) e remover: scanner reusa o orquestrador de pruning; regra delete-se-<Nviews / unlink-se->N; pegadinhas de regex."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

Varredura/remoção de backlinks externos na rede (WP: anderson/vps1/qmix/hostverge). Scripts em `scratchpad` da sessão: `iptv_scan.php/py` (achar links por texto-âncora) e `iptv_del.php/py` (deletar/unlink por domínio-alvo).

**Padrão que funciona:** o driver Python **importa o orquestrador de pruning** (`prune_low_value_posts.py`) e reusa `HOSTINGS`, `list_sites`, `ALLOWLIST`, `EXCLUDED_DOMAINS`, `run_ssh`, `scp_to_host`, `wp_eval_file`. Assim herda allowlist (só rede de backlinks), exclusão de clientes, hosts corrigidos (hostverge direto), e o `run_ssh` blindado. PHP roda via `wp eval-file` com env var pra DRY/EXEC.

**Regra da operação 2026-07-13** (remover backlinks p/ 15 domínios IPTV: cbgo2023, vinhosbianchetti, cozot, correntecoats, livrariaatlantico, coloradofanaticos, supervolt, otec.net.br, psicomednet, kamari, lightrio, brtemplates, escolaparaempreendedores, escoladacachaca, premiopetrobras):
- artigo linkando + **≤10 views** (Antônio `v____post_views`) → **wp_delete_post(force)** permanente.
- artigo linkando + **>10 views** → **manter, só `strip` do `<a>`** (regex→anchor text), `$wpdb->update` (preserva post_modified).
- Resultado: **1.659 deletados + 698 unlinked, 0 erros**. Backup por site em `wp-content/iptv-deleted-backup/iptv-*.json` (conteúdo dos deletados + original dos unlinked).

**PEGADINHAS de regex (importantes):**
1. **Fronteira de domínio**: detecção `href=["\']https?://(?:www\.)?DOMINIO` DEVE terminar com `(?![a-z0-9.-])` (não `[/"\']`) — senão perde links com `?`/`#`/fim logo após `.br`.
2. **Link escapado ≠ link real**: `&lt;a href=&quot;https://...&quot;` é código exibido como TEXTO (snippet), NÃO backlink funcional — Google não segue. Uma verificação `post_content REGEXP 'href=[^>]*dominio'` dá **falso-positivo** nesses. Verificar link real com aspas literais: `href=["\']https?://...dominio`.

Complementa o [[reference_link_removal_system]] (mu-plugin oie audit-links, por domínio) e [[reference_content_pruning]] (mesmo orquestrador/infra).

---
name: sem-hostverge-sem-wordpress
description: "Os sites do usuário NÃO estão mais na Hostverge e NÃO são mais WordPress; ao investigar um site, não começar por wp-cli/hostverge"
metadata:
  node_type: memory
  type: project
  originSessionId: 798881c5-bcbc-4a97-be9b-e6451b288680
  modified: 2026-10-22T11:44:05.959Z
---

Declarado pelo usuário em 22/10/2026: não há mais sites nossos na Hostverge e não há mais sites WordPress na rede. Docs e memórias antigas que citam WP/Hostverge (README/CONEXAO do hostverge, mu-plugins, wp-cli, Antônio via wp-json) estão desatualizados.

**Why:** gastei tempo no saudevitalidade.com.br tentando wp-cli na Hostverge; a pasta existia mas sem WordPress, e o site já era outro stack (Cloudflare, portal-engine/Next).

**How to apply:** ao checar publicação/estado de um site, descobrir primeiro o stack real (headers, `/srv/portais` nas VPS opengravity, srv1166087 e clinicas-vps, apps Next). Não usar wp-cli nem SSH hostverge. Ver [[reference_portal_engine_html]] e [[reference_portal_engine_dedup_por_host]].

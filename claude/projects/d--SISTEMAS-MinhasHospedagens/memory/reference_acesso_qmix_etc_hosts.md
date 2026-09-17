---
name: reference_acesso_qmix_etc_hosts
description: "Plataforma de conteúdo acesso.qmix é PHP no srv1166087 (/home/boot/web); ao migrar site p/ portal-engine, REMOVER a entrada dele no /etc/hosts do servidor senão transfer cai no WP velho (404)."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

A **plataforma de conteúdo "acesso.qmix.com.br"** (a que mostra cron-logs/publish-schedule-report e transfere artigos) é um app **PHP** em **`/home/boot/web/acesso.qmix.com.br/public_html`** no **srv1166087** (HestiaCP, user `boot`). NÃO confundir com `qmix-next` (Next.js/Payload no mesmo servidor) que é o **site institucional** da QMIX.

**Como transfere:** cron `article-transfer.php` (rodar: `cd .../public_html && runuser -u boot -- php article-transfer.php ASC`). Pega 1 artigo pendente de `seo_articles` (pw_transfer=0, wp_tentativa<=2, status_openai=2, content!='', publish_delay 0/1) e faz `POST` no `endpoint_url` do site (tabela **`wp_sites`**: domain, endpoint_url, api_key CRIPTOGRAFADA, default_author, status). Header `X-API-KEY`. Trata TODO destino como "WordPress" (mas o receptor portal-engine é WP-compatível — aceita qualquer path terminando em `/v1/artigos`, autentica pela key).

**ARMADILHA (corrigida 2026-06-17 p/ entrenoticia + diariodegoiania):** o `/etc/hosts` do srv1166087 tinha entradas FIXAS apontando domínios pro **servidor WP ANTIGO `92.113.35.186`**:
```
92.113.35.186 entrenoticia.com www.entrenoticia.com
92.113.35.186 diariodegoiania.com www.diariodegoiania.com
```
Quando o site migra p/ **portal-engine** (que fica no PRÓPRIO srv1166087, servido via Cloudflare), essa entrada vira veneno: a plataforma resolve o domínio pro WP velho (92.113.35.186) e o POST do artigo dá **HTTP 404** (página WP). Externamente o site funciona (Cloudflare→portal-engine), mas a plataforma local não. Sintoma: cron-log "HTTP: 404 | para WordPress", 0 POST no log do receptor portal-engine.

**FIX:** comentar/remover a entrada do domínio no `/etc/hosts` do srv1166087 (backup `/etc/hosts.bak-DATA`). Aí resolve via DNS público → Cloudflare → portal-engine → 201. Confirmar: `getent hosts <dominio>` deve dar IP Cloudflare (2606:4700...), e `runuser -u boot -- php article-transfer.php` deve dar "Artigo enviado com sucesso".

**Checklist ao migrar QUALQUER site p/ portal-engine:** (1) endpoint_url em wp_sites = `https://<dominio>/<slug>-api/v1/artigos`; (2) api_key em wp_sites bate com sites.json do portal-engine; (3) **remover entrada do /etc/hosts** no srv1166087. Ver [[reference_portal_engine_html]] e [[reference_orphan_wp_cleanup]].

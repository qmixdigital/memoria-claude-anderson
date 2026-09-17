---
name: adonline-estado-atual
description: Fatos do adonline.com.br que corrigem o README da pasta (13-14/08/2026)
metadata: 
  node_type: memory
  type: project
  originSessionId: 64eedfc7-3a40-415a-a05d-b2b48b50b1f7
  modified: 2026-08-14T11:45:17.002Z
---

O `README.md` de D:\PORTAIS\ADONLINE (levantamento de 13/08/2026) ficou desatualizado no mesmo dia. Estado real em 14/08/2026:

- **Acervo**: 739 posts publicados (não 4.831). Limpeza deliberada em 13/08 removeu 4.158 slugs de conteúdo irrelevante — 3.421 na lixeira, todos respondendo 410 via `qmix-410-slugs.php` (não é incidente, não restaurar).
- **hf-c5cf26.php**: corrigido em 13/08 — só oculta categorias 93/94 (idiomas estrangeiros). O filtro de thumbnail e a exclusão de Insights foram removidos; tema usa imagem genérica via `adon_thumb()`.
- **AdSense**: Auto Ads (sem `<ins>` manuais). Home suspensa de propósito: `wp option update adon_adsense_home_off 0` religa.
- **Cloudflare**: token da conta do adonline salvo como `conta30` em `d:\SISTEMAS\Cloudflare\contas.json` (zona `ef5c8c46746d9fceeaaa2448e0db1732`; mesma conta tem brmaisnews.com.br, diariodatv.com, topsulnoticias.com).
- **Search Console**: propriedade `sc-domain:adonline.com.br` delegada à service account `enjai-ga4-reader@enjai-493011` (key em `C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json`).
- **Antônio**: entregando normalmente via autor `jorn@lismoau2025` (ID 7); o `last_published_at` do wp_sites #36 não é confiável.
- **GSC 14/08**: ~50-70 impressões/dia, 1-2 cliques/dia — queda de 02/05 nunca recuperou; correção do filtro + IndexNow dos 739 posts enviados em 14/08. Acompanhar recuperação nas próximas semanas.

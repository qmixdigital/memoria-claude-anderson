---
name: reference_blog_tredicci
description: "blog.drthiagotredicci.com.br (Dr. Thiago Tredicci, cirurgião do aparelho digestivo) — mesmo tratamento de joelho/ombro: sem ads + tag cirurgia-digestiva + CTA seletivo com tracking"
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**blog.drthiagotredicci.com.br** = Dr. Thiago Tredicci, **cirurgião do aparelho digestivo (gastro)** em Goiânia, **CRM-GO 12828**. opengravity, user `qmix`, `/home/qmix/web/blog.drthiagotredicci.com.br/public_html`. Tema **Jannah**. GA4 `G-22P08JP0F7`. **Cloudflare conta16, zona `0bb4d69d99b4eb3bb98dd6cde6247cf4`**. CTA WhatsApp **`5562999209156`**.

Recebeu o mesmo tratamento 3-fases de [[reference_blog_cirurgiadojoelho_location_cf]] e [[reference_blog_ombrogoiania]]:
1. **Ads off** (reversível): `tie_jannah_options` banner_top_tab/above_content/category_below_posts/article_inline_ad_1/2 + stream-item-widget-3/4/5 inativos.
2. **Tag `cirurgia-digestiva`** = **post_tag id 46**, 91 posts (só conteúdo que vira cirurgia: vesícula, hérnias, refluxo/hiato, oncologia digestiva, bariátrica, indicação cirúrgica).
3. **CTA seletivo** = mu-plugin `mc-cta-cirurgia.php` (filtro the_content só se `has_term(cirurgia-digestiva)`). Card azul #0f506d + botão verde #25D366.

**Tracking de leads igual joelho/ombro:** GA4 `generate_lead`/`cta_cirurgia_wa` + contador server (`_mccta_wa_clicks`, `_mccta_wa_monthly`). Relatório: `GET /wp-json/mccta/v1/report?key=r7Kp9mQ2xL`. Doc completa: `D:\SISTEMAS\MinhasHospedagens\blog-tredicci\DOCUMENTACAO.md`.

⚠️ slug real ≠ título longo: post da colecistectomia é `/o-que-e-colecistectomia/` (não `-entenda-quando-...`, que dá 301 pra home). Conferir slug antes de testar URL.

**Logo quebrado (padrão recorrente nesses blogs Jannah):** a opção `tie_jannah_options['logo']`/`['logo_retina']` aponta pra um WebP que nunca foi enviado (ex: `logo-dr-thiago-tredicci-2.webp` → 301/404). ⚠️ CUIDADO: o `wp-content/uploads/2025/11/logo.webp` local é o **placeholder demo do tema ("JannahHealth")**, NÃO a logo do médico — não usar. A logo real vem do **site principal** `drthiagotredicci.com.br/img/Logo-Dr.-ThiagoTredicci.webp` (400x200). Fix aplicado: baixar do site principal → subir em `uploads/2026/07/logo-dr-thiago-tredicci.webp` → setar **os 5 slots de logo** do Jannah (chave = `apply_filters('TieLabs/theme_options','')` = `tie_jannah_options`, array) via eval-file → `$GLOBALS['tie_options']=''` → flush + purge CF conta16. NÃO existe key `tie_options` avulsa. Mesmo padrão: pegar a logo do site principal correspondente de cada médico.

⚠️ **São 5 slots de logo — atualizar TODOS** (senão desktop conserta mas mobile continua quebrado): `logo`, `logo_retina`, `mobile_logo`, `mobile_logo_retina`, (opcional `footer_logo`/`logo_sticky`). O **`mobile_logo_retina`** é o `srcset 2x` do menu mobile — como celular é tela retina (2x), o navegador pega JUSTAMENTE esse; se ficar apontando pro arquivo velho, a logo quebra só no mobile. Verificar com `array_walk_recursive` no array inteiro procurando o nome do arquivo velho, não confiar em `wp db query LIKE` (deu falso-negativo aqui). Testar mobile com UA de iPhone.

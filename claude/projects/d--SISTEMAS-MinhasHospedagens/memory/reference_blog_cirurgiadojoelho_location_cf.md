---
name: reference_blog_cirurgiadojoelho_location_cf
description: blog.cirurgiadojoelhogoiania.com vive no srv1166087 (não opengravity) e sua conta Cloudflare é a conta25
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

`blog.cirurgiadojoelhogoiania.com` está hospedado no **srv1166087** (alias SSH `hostinger-vps-srv1166087`) em `/home/boot/web/blog.cirurgiadojoelhogoiania.com/public_html` (user HestiaCP `boot` = plataforma Antônio). wp-cli em `/usr/local/bin/wp`; rodar com `wp --path=<dir> --allow-root`. AVIF é mime aceito pelo WP.

⚠️ A doc `D:\SISTEMAS\MinhasHospedagens\VPS ferramentasqmix@gmail.com\CONEXAO.md` lista esse domínio como estando no **opengravity** — está DESATUALIZADA; o site foi migrado e NÃO existe mais lá.

Cloudflare: a zona `cirurgiadojoelhogoiania.com` (zone_id `a543b64e2c25df9d5174e012757e71a0`) está na conta CF `e1afd354b17fd5c336f44c6095f41081` (NS anderson/frida), salva como **conta25** em `D:\SISTEMAS\Cloudflare\contas.json`. Token é account-scoped: falha em `/user/tokens/verify` mas funciona em zones/purge_cache. Purge: `POST zones/<id>/purge_cache` com `{"files":[...]}`.

scp para esse host falha ("Connection closed") — transferir arquivo via base64 sobre SSH.

**Estratégia de lead cirúrgico aplicada 2026-07-02** (igual [[reference_blog_ombrogoiania]], mesmo tema Jannah): Médico = **Dr. Ulbiramar Correia** (CRM-GO 11552 · RQE 7240). WhatsApp/tel = **556230890978** (confirmado pelo operador como o número do joelho). 432 posts.
- **Publicidade do tema REMOVIDA** (reversível): 4 slots de Ad Jannah (`banner_top_tab`, `banner_above_content`, `banner_category_below_posts`, `article_inline_ad_1`) → false; 3 widgets Stream Item → `wp_inactive_widgets`. Backup `boot@srv1166087:/home/boot/tie_jannah_options.backup-20260702.json`; banner salvo em `D:\SISTEMAS\MinhasHospedagens\blog-cirurgiadojoelho\banner-cta-original.html`.
- **Tag `cirurgia-de-joelho` (post_tag id 46)** = **131 posts** (após 2 refinamentos) cirúrgicos/que levam à cirurgia. Inclui "tempo de recuperação/afastamento DA cirurgia" (fator de decisão pré-op) mas NÃO os milestones pós-op ("X dias após", muleta/andar/dobrar após). Inclui osteonecrose/Ahlback, cisto/menisco discoide, lesão condral profunda. EXCLUI conservadores (infiltração/PRP/artrose-manejo/tendinite/bursite/condropatia grau 1-2) = ímãs de lead não-cirúrgico (Cirurgia do Joelho + Prótese + ruptura LCA/LCP, lesão/ruptura de menisco, luxação/instabilidade patelar, fratura/joelho quebrado, osteotomia, condropatia grau 3-4→cirurgia, tumores/PVNS/condromatose). Excluídos: dor, anatomia, exercícios/fisioterapia, pós-operatório, infiltração/PRP/regenerativa, artrose/condropatia conservadora, sintomas.
- **Mensuração de leads (ombro + joelho, 2026-07-02):** o botão do CTA rastreia cada clique em 3 camadas — (1) contador server-side no post_meta `_mccta_wa_clicks` (total) + `_mccta_wa_monthly` (buckets `Y-m`), via endpoint REST `POST /wp-json/mccta/v1/click` (beacon); (2) evento GA4 `generate_lead`+`cta_cirurgia_wa` com `article_id`/`article_title` (GA4 ombro `G-73HEDYSD1N`, joelho `G-78ZBT9EC66` — usuário precisa registrar as custom dimensions + marcar key event); (3) título do artigo na msg do WhatsApp. Ranking via `GET /wp-json/mccta/v1/report?key=r7Kp9mQ2xL` (JSON top-20). **Rotina Claude semanal** (seg 09:00 BRT / `0 12 * * 1`, id `<<REMOVIDO>>`) faz curl nos 2 endpoints e reporta. Tudo no mesmo `mc-cta-cirurgia.php`.
- **CTA seletivo:** mu-plugin `mc-cta-cirurgia.php` (só posts com a tag, 2 posições, copy que qualifica, card azul #024E70 + **botão verde WhatsApp #25D366**). Plugins ativos: seo-by-rank-math, redis-cache, xml-sitemap-feed. Purge: `wp redis flush` + `wp cache flush` + CF conta25 purge_everything.

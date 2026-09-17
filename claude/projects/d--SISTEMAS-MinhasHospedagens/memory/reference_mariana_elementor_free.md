---
name: reference_mariana_elementor_free
description: marianacabraldermato.com.br não tem mais Elementor; header/footer são mu-plugins próprios sobre hooks do SmartMag
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

marianacabraldermato.com.br (SSH `hostinger-mariana`) foi **100% desintoxicado do Elementor** em 2026-07-01: deletados elementor, elementor-pro, extensions-for-elementor-form, skyboot-custom-icons-for-elementor e **elementskit-lite** (addon Elementor — cuidado: "elementskit" não casa com grep "elementor").

**Front-end quase todo é mu-plugin próprio (NÃO é tema nem Elementor):**
- `mc-header.php` (v2) — header premium sticky glass, mega-menu Especialidades (link p/ /especialidades/ + dropdown), menu `smartmag-main`/id 6, mobile overlay. Suprime nativo via `add_filter('bunyad_do_partial_header','__return_false')` + injeta em `bunyad_header_before`. ARMADILHA: URL com %-encoding no `items_wrap` do wp_nav_menu quebra sprintf (WSOD) — CTA fora do items_wrap.
- `mc-footer.php` — footer premium (`bunyad_do_partial_footer`=false + `bunyad_footer_before`). Também carrega as **fontes** (Fraunces+Jost) 1 URL única, NÃO-bloqueante (preload + media=print/onload).
- `mc-tracking.php` — **GA4 G-MLFHFRC852** + GTM-K957KCH8 + Ahrefs (rXGC7AkTIPureLEtIPzCog). GA4 foi MOVIDO do `codes_header` do tema pra cá quando removi o Site Kit (Site Kit e wp-reviews/Trustindex removidos; Site Kit injetava GT-WRC3XN7B redundante). ⚠️ CUIDADO com `DELETE ... option_name LIKE '%_ti_%'` — apaga `smartmag_theme_options`! (aconteceu; restaurei do backup `/home/u761201864/backups-mariana/pre-audit-mariana.sql`).
- `mc-cta.php` — CTA conversão que SUBSTITUIU o plugin Click to Chat: barra fixa mobile (WhatsApp+Ligar) + pílula dourada desktop, evento GA4 `generate_lead`.
- `mc-blog.php` + `mc-blog/template.php` — blog editorial custom (hero + filtro categorias client-side + featured + grade), via `template_include` em `is_home()`.
- `mc-seo-tweaks.php` (tira FAQPage schema), `single-toc.php` (design dos artigos), `stats-mk7a2b.php` (views).

**Página nova:** `/especialidades/` (id 1594) — vitrine imersiva HTML incorporado (hero imagem `object-fit:cover` aspect 900/1449 = SEM corte, bento imagem+vídeo com poster `#t=0.1`). **Plugins removidos:** elementor(todos), elementskit, click-to-chat, simple-cloudflare-turnstile, simple-local-avatars. **Ativos (6):** litespeed, rank-math, wordfence, site-kit, wp-reviews(Trustindex), hostinger.

**Armadilha PHP 8:** URL com `%`-encoding (wa.me?text=...) dentro de `items_wrap` do `wp_nav_menu` quebra o `sprintf()` → WSOD. Renderizar CTA fora do items_wrap.

Tema é **SmartMag** (Bunyad), main_color já `#daab86`. Páginas premium (home 1564, serviços 80/82/84/86, contatos 92, +10 tratamentos, melasma 1630) usam template `page-templates/no-wrapper.php` (full-width). ⚠️ **AO CRIAR PÁGINA NOVA de tratamento (HTML incorporado), SETAR `wp post meta update <id> _wp_page_template page-templates/no-wrapper.php`** — `wp post create` NÃO herda template, e sem isso o SmartMag envolve a página com barra de título + sidebar + container e ela fica "totalmente diferente" das outras. Cada página de tratamento tem prefixo CSS próprio (lc-/pr-/hf-/bt-/bs-/sk-/ol-/hp-/ml-) escopado no bloco; hero em vídeo é o padrão. Páginas de texto (Tecnologias 90, Política 130, Termos 132) = `post_content` HTML limpo no template `default` (ainda com right-sidebar — polir se pedirem). Cache: LiteSpeed + CF APO conta16 zona 535b38d536d9efcd87327f63226fb84a. Ver [[reference_mariana_cache_apo_lsws]].

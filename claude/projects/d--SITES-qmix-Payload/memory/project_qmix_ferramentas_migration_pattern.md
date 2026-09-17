---
name: qmix-ferramentas-migration-pattern
description: "Padrão aprovado de migração de ferramentas qmix.com.br/ferramentas/* → qmixdigital.com.br/ferramentas/* — design, mu-plugin, 301"
metadata: 
  node_type: memory
  type: project
  originSessionId: f0fe6811-0d34-4f0f-86c9-aff621746640
---

Padrão aprovado em 2026-05-22 para migrar ferramentas não-SEO de qmix.com.br para qmixdigital.com.br (resolve topic dilution, ver [[project_qmix_seo_recovery]]).

**Why:** qmix.com.br tinha 97% do tráfego em ferramentas grátis (não convertem). Google enxergava o site como "ferramentas grátis", não "agência de backlinks". Solução: mover ferramentas não-SEO pra qmixdigital.com.br (revista da rede QMIX). SEO de qmix volta a focar em backlinks; ferramentas continuam ranqueando em qmixdigital sem perder tráfego (301 transfere autoridade em 30-60 dias).

**How to apply (cada nova ferramenta migrada):**

1. **Arquivo de referência canônico**: `/wp-content/mu-plugins/qmix-ferramentas-helper.php` no qmixdigital.com.br (Hostinger-anderson.gna, SSH alias `hostinger-anderson-gna`, caminho `domains/qmixdigital.com.br/public_html/`). Já configurado para todas as páginas filhas de `/ferramentas/`:
   - Desabilita `wpautop`, `wptexturize`, `convert_smilies` (senão corrompe JS embutido)
   - Desabilita LiteSpeed JS optimize/defer/combine/minify (script tem que rodar inline)
   - Remove `<script type="litespeed/javascript">` no output buffer
   - Esconde TODA a estrutura de hero do SmartMag (`.entry-hero`, `.page-hero-section`, `.entry-hero-container-inner`, `.hero-section-overlay`, `header.entry-header.page-title`) com display:none + height:0 + padding:0
   - Aplica fundo creme `#FAF5EE` em `body.page` + transparent em todos os containers SmartMag (`.site-content`, `.content-area`, `article.entry`, `.entry-content`, etc.) para full-bleed
   - Esconde sidebar/widget-area
   - Marca página como nocache no LSCache (durante debug; pode comentar depois)

2. **Design pattern (aprovado pelo usuário)**:
   - Fontes: Fraunces (display serif italic distintivo) + Familjen Grotesk (sans body)
   - Paleta: bg `#FAF5EE` (creme), ink `#0E0B1A`, coral `#FF3D6E`, teal `#0F4D52`, sun `#F4A93C`, lilac `#7B5BD6`, mint `#1A8754`
   - Hero gigante com H1 7-8vw, italics coral em palavras-chave, "Aa" decorativo rotacionado 7% opacity no fundo
   - Eyebrow chip preto sólido com sparkle coral
   - Stats grid 4 cols com border-top 2px preto, Fraunces 900 nos números
   - Tool card neobrutalismo: border 2px preto + box-shadow 6px 6px 0 coral (sombra dura sem blur)
   - Sticky nav de categorias: chips wrap em multi-linha no mobile (≤960px), horizontal scroll no desktop. Border 1.5px preto, hover invertido (preto sólido, texto branco)
   - Categorias: 12 cores temáticas (--cat-tint + --cat-ink + --cat-deep variáveis CSS por data-cat). Roman numerals gigantes (I, II, III...) no header
   - Cards em grid 2-colunas (≥960px), single column mobile. Hover translate(-2,-2) + box-shadow dura na cor da categoria
   - Cards mobile-first: stack vertical (número+nome → texto resultado → botão copiar full-width). Desktop: row horizontal
   - Botão Copiar: preto sólido com ícone SVG clipboard, vira coral com checkmark quando copiado
   - FAQ com `box-shadow:3px 3px 0 coral` quando aberto + translate(-1,-1)
   - Pull-quote estilo print com `box-shadow:4px 4px 0 sun` (amarelo)
   - Related cards com hover translate + box-shadow preto duro
   - Animações: stagger fade-up no hero/tool/stats. Respeita `prefers-reduced-motion`

3. **Template de arquivo**: `C:/Users/User/AppData/Local/Temp/letras-diferentes-v4.html` (51KB). Próximas ferramentas: copiar essa estrutura, substituir:
   - `styles` array em JS pela lógica da nova ferramenta
   - Conteúdo SEO (intro, FAQ, content sections) específico da ferramenta
   - JSON-LD `name`, `description`, `url`, `FAQPage.mainEntity`
   - H1, subtitle, hero meta items
   - Related tools links

4. **Deploy passo-a-passo**:
   - `scp` arquivo HTML para `hostinger-anderson-gna:/tmp/`
   - `wp post create --post_type=page --post_parent=11131 --post_name={slug} --post_title="..." --post_content="$(cat /tmp/...)"` (11131 = ID da página pai `/ferramentas`)
   - `wp litespeed-purge all`
   - Verificar: `curl -sk https://qmixdigital.com.br/ferramentas/{slug}/`

5. **301 redirect qmix.com.br → qmixdigital.com.br**:
   - Adicionar em `qmix-next/next.config.ts` na função `redirects()`:
     ```ts
     { source: '/ferramentas/{slug}', destination: 'https://qmixdigital.com.br/ferramentas/{slug}', statusCode: 301 as const, permanent: true }
     ```
   - Rebuild + reload PM2 (zero downtime)
   - Após confirmado, remover o page.tsx da ferramenta migrada (limpa o repo)

6. **Tools que MIGRAM (não-SEO)**: letras-diferentes ✅, simbolos-aesthetic, inverter-texto, maiuscula-e-minuscula, contador-de-caracteres, contador-de-dias, numero-por-extenso, conversor-de-hashtags, gerador-de-banner, gerador-de-caca-palavras, gerador-de-caracteres, gerador-de-cartao-de-credito, gerador-de-cep, gerador-de-cnpj, gerador-de-codigo-de-barras, gerador-de-cpf, gerador-de-dados-fake, gerador-de-inscricao-estadual, gerador-de-link-para-email, gerador-de-link-whatsapp, gerador-de-links-aleatorios, gerador-de-nicks, gerador-de-numeros-aleatorios, gerador-de-pessoas, gerador-de-senhas, gerador-lotofacil, gerador-mega-sena, gerar-json, gerar-qr-code-pix, json-beautify, minificar-css, minificar-js, minificar-json, numero-aleatorio-*, validador-de-cpf, abrir-urls, baixar-thumbnail-youtube, calculadora-de-porcentagem, converter-markdown-pdf, editor-html

7. **Tools que FICAM no qmix.com.br (SEO/marketing)**: verificador-de-links, verificador-de-links-quebrados, verificador-de-redirecionamento, consultar-dominio-whois, verificador-de-dominio, pesquisa-de-palavras-chave, calculadora-densidade-palavras-chave, gerador-de-headlines, gerador-de-url-amigavel, calculadora-de-adsense

8. **Página pai `/ferramentas` no qmixdigital**: ID 11131. Quando migrar várias ferramentas, criar índice com cards na página pai.

9. **SEO setup obrigatório por ferramenta (RankMath está ativo no qmixdigital)**:
   - RankMath SEO plugin (`seo-by-rank-math`) é o gerenciador de meta tags
   - **PROBLEMA conhecido**: o tema SmartMag auto-extrai meta description do início do post_content. Como nossas páginas começam com `<style>...</style>`, a auto-extração captura CSS no description. SEMPRE setar manualmente:
     - `wp post meta update {ID} rank_math_description "<DESC 150-160 chars>"`
     - `wp post meta update {ID} rank_math_focus_keyword "<KW principal>"`
     - `wp post meta update {ID} rank_math_facebook_image "<URL>"`
     - `wp post meta update {ID} rank_math_facebook_title "<TITLE>"`
     - `wp post meta update {ID} rank_math_facebook_description "<DESC>"`
     - `wp post meta update {ID} rank_math_twitter_image "<URL>"`
     - `wp post meta update {ID} rank_math_twitter_title "<TITLE>"`
     - `wp post meta update {ID} rank_math_twitter_description "<DESC>"`
     - `wp post meta update {ID} rank_math_twitter_use_facebook 0`
     - `wp post update {ID} --post_excerpt="<DESC>"` (fallback)
   - **Featured image OBRIGATÓRIA**: RankMath usa featured image como OG image fallback. Setar:
     - `wp media import {path-to-og.webp} --post_id={ID} --title="..." --porcelain` → retorna attachment ID
     - `wp post meta update {ID} _thumbnail_id {ATT_ID}`
     - `wp post meta update {ID} rank_math_facebook_image_id {ATT_ID}`

10. **OG image: gerar via Runware API** (key em CLAUDE.md global):
    - Dimensões obrigatórias: **1216x640** (múltiplos de 64, Runware exige; aceitável OG ~1200x630)
    - Formato: WEBP
    - Prompt template: "Editorial magazine cover design with massive bold italic serif typography spelling [TOOL NAME] in [theme colors] background, scattered around decorative [tool-specific elements], aesthetic sparkle stars in golden yellow, coral pink accents, decorative typography composition, playful aesthetic Y2K vibes, soft cream parchment background with subtle paper grain texture, professional editorial magazine design, no watermarks, high quality, vibrant and colorful"
    - Salvar em `domains/qmixdigital.com.br/public_html/wp-content/uploads/og/{slug}-1200x630.webp`
    - Importar pra media library com `wp media import` para ter attachment ID

11. **Title tag**:
    - Manter < 60 chars (SmartMag adiciona " │ Revista QMIX" = 16 chars, então post_title precisa ser < 44 chars)
    - Pra controlar exato, setar `rank_math_title` com template próprio: `"Título Customizado %sep% %sitename%"` ou direto sem template
    - Keyword principal NO INÍCIO

12. **Schema JSON-LD obrigatório no conteúdo HTML embedado** (RankMath já adiciona Article/WebPage automaticamente, mas a gente acrescenta):
    - `WebApplication` (a ferramenta em si)
    - `BreadcrumbList` (caminho)
    - `FAQPage` (perguntas frequentes — featured snippets!)
    - `HowTo` (se aplicável — passos pra usar)
    - `ItemList` (se a ferramenta listar coisas)

13. **Cores temáticas por categoria de ferramenta** (sugestão pra OG images):
    - Texto/Unicode (letras-diferentes, simbolos-aesthetic, inverter-texto, etc.) → coral pink + creme + dourado
    - Geradores de dados fake (cpf, cnpj, cartão, cep, pessoas) → roxo lilás + creme + amarelo
    - Mídia (qr-code-pix, baixar-thumbnail-youtube) → mint green + creme + coral
    - Calculadoras (dias, porcentagem) → teal + creme + amarelo
    - Conversores (markdown-pdf, hashtags) → sun amarelo + creme + coral
    - Geradores diversão (lotofacil, nicks, números aleatórios) → lilac + creme + coral

14. **301 redirect setup**:
    - Editar `d:/SITES/qmix-Payload/qmix-next/next.config.ts` na função `redirects()`
    - Format: `{ source: '/ferramentas/{slug}', destination: 'https://qmixdigital.com.br/ferramentas/{slug}', statusCode: 301 }`
    - Build + reload PM2 zero-downtime (`pm2 reload qmix-next && pm2 reload qmix-next-b`)
    - Batch múltiplos redirects num único deploy quando migrar várias ferramentas

15. **Checklist final por ferramenta migrada**:
    - [ ] Página criada no qmixdigital com ID
    - [ ] mu-plugin já cobre wpautop/LSCache/H1 (sem ação adicional)
    - [ ] OG image gerada via Runware + uploaded
    - [ ] Featured image (_thumbnail_id) setada com attachment ID da OG
    - [ ] rank_math_description (150-160 chars, focus keyword no início)
    - [ ] rank_math_focus_keyword
    - [ ] rank_math_facebook_* (title, description, image, image_id)
    - [ ] rank_math_twitter_* + twitter_use_facebook=0
    - [ ] post_excerpt (fallback)
    - [ ] HTML embedado com JSON-LD: WebApplication, BreadcrumbList, FAQPage
    - [ ] CSS class prefix `.qmix-ld` (manter pra herdar mu-plugin)
    - [ ] LSCache purgado (`wp litespeed-purge all`)
    - [ ] 301 redirect em qmix-next/next.config.ts
    - [ ] Verificar HTTP 301 origem (`ssh opengravity 'curl -sI http://127.0.0.1:3005/ferramentas/{slug}'`)
    - [ ] Verificar título/desc no SERP (`curl https://qmixdigital.com.br/ferramentas/{slug}/ | grep -E 'title|description|og:'`)

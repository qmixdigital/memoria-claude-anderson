---
name: feedback-conteudo-redatora
description: "Ao publicar conteúdo refeito pela redatora no blog Tredicci (Jannah), atualizar a data de publicação para o dia do trabalho e gravar a linha fina no campo tie_post_sub_title"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 193e321b-b707-4579-8710-d0f6dece65eb
  modified: 2026-09-15T17:50:52.458Z
---

Quando um conteúdo refeito pela redatora (pasta do Drive `tredicci-15092026`, lida com a conta de serviço `seoqmix@seoqmix.iam.gserviceaccount.com`) substitui um post do blog https://blog.drthiagotredicci.com.br:

1. **Data de publicação = dia em que o trabalho é feito** (`post_date` e `post_date_gmt`, com `current_time('mysql')` do WP; o relógio do servidor opengravity é UTC, não usar `date` do shell).
2. **Linha fina vai no meta `tie_post_sub_title`** (campo "Subtitle" do Jannah), que é o que aparece abaixo do H1. Gravar no `post_excerpt` sozinho não muda nada na página.
3. O resto do fluxo: texto integral dela em blocos Gutenberg, FAQ em JSON-LD, imagem indicada na "Observação" do doc (Pexels/Pixabay via API), links internos com âncora de keyword, `rank_math_title`/`description`/`focus_keyword`, purge (WP + LiteSpeed + `cf_purge.py drthiagotredicci.com.br`), IndexNow.

**Why:** Anderson pediu em 15/09/2026, após a primeira entrega sair com a data antiga (2025) e a linha fina antiga ainda visível.

**How to apply:** o script `aplicar_post.php` no scratchpad já faz os itens 1 e 2; ao recriá-lo em outra sessão, incluir os dois. Ver também [[feedback-links-clicaveis]].

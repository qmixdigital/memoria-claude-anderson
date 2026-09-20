---
name: feedback-conteudo-redatora
description: Fluxo para publicar os textos da redatora no blog do Dr. Thiago Tredicci (desde 19/09/2026 o blog é HTML estático em /blog/ no repositório; data = dia do trabalho, linha fina no cabeçalho, links internos automáticos)
metadata:
  type: feedback
---

O blog do Tredicci deixou de ser WordPress em 19/09/2026: os artigos vivem em
`D:\GitHub\drthiagotredicci.com.br\conteudo\blog\<slug>.html` e saem em
`https://drthiagotredicci.com.br/blog/<slug>/` pelo `_nao-deploy/gerar-blog.py`.

Fluxo para um Doc da redatora (pasta do Drive `tredicci-15092026`, conta de serviço
`seoqmix@seoqmix.iam.gserviceaccount.com`):
1. `python _nao-deploy/drive-baixar.py` (baixa Docs novos para `_nao-deploy/redatora/`).
2. `python _nao-deploy/publicar-doc.py <doc>.html --slug <slug>` (post existente) ou `--novo --categoria <cat>`.
   Ele já aplica: primeiro link do corpo = página de venda do tema, na abertura; artigos irmãos com
   âncora de keyword (≤ 2 usos por âncora no blog); data de publicação = dia do trabalho; linha fina
   no cabeçalho; capa da "Observação" do Doc (Pexels/Pixabay) em 1216x640 WebP; sem travessão.
3. `python _nao-deploy/gerar-blog.py && git add -A && git commit && git push`, depois
   `python d:/SISTEMAS/Cloudflare/cf_purge.py drthiagotredicci.com.br` e IndexNow.

**Why:** Anderson pediu (15/09) data do dia e linha fina visível, e (19/09) que a redatora entregue
sem links, com a inserção feita aqui. A migração para estático (19/09) trocou o `wp eval-file` pelo
`publicar-doc.py`; o WordPress na opengravity ficou só como backup.

**How to apply:** nunca mais editar posts via wp-cli; editar `conteudo/blog/` e rebuildar. Ver
[[feedback-links-clicaveis]].

---
name: projeto-blog-gerado-por-script
description: O blog e todo gerado por _nao-deploy/gerar-blog.py a partir de conteudo/blog/; nunca editar blog/*/index.html direto
metadata: 
  node_type: memory
  type: project
  originSessionId: c4a01c27-c33d-48b1-b9f3-361805e71ec5
  modified: 2026-09-22T12:05:12.103Z
---

Em drthiagotredicci.com.br, `blog/` inteiro é **saída de build**: os 182 posts,
as 16 páginas de `/blog/`, as 8 editorias, o índice, a busca, os sitemaps e o
feed saem de `_nao-deploy/gerar-blog.py`, que lê as fontes com front-matter em
`conteudo/blog/<slug>.html`.

Editar `blog/<slug>/index.html` direto é trabalho perdido: a próxima execução do
gerador sobrescreve. Mudança de conteúdo vai na fonte; mudança de template,
linkagem, schema ou metadados de listagem vai no gerador.

O gerador também lê de `index.html`, na hora do build, o bloco do GA4 (casando
com o comentário `<!-- Google Analytics 4: mede sempre`), os favicons, o header,
o footer e a barra de CTA do celular. Então **mexer no header/footer/GA da raiz
exige regerar o blog**, senão as duas metades do site divergem. O mesmo vale para
`_nao-deploy/gerar-redirects.py`, que escreve `_redirects` e `functions/[[path]].js`.

Related: [[projeto-ga4-legitimo-interesse]], [[feedback-conteudo-redatora]]

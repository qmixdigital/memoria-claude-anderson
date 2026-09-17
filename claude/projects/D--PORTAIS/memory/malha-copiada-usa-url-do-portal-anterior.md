---
name: malha-copiada-usa-url-do-portal-anterior
description: O script de linkagem interna montava /editoria/slug/ num portal de URL plana, e criou 1.728 links para 404 de uma vez
metadata:
  type: feedback
---

O `malha_<portal>.py` nasce de cópia do portal anterior e traz o formato de URL
dele cravado. No desassossegada, que é **plano**, ele montou
`/<editoria>/<slug>/` e criou **1.728 links internos apontando para 404**, todos
de uma vez. Nada acusa na hora: o script reporta "576 artigos com bloco novo,
1.728 links criados", que parece sucesso.

**Why:** é o mesmo defeito de [[script-copiado-carrega-o-portal-anterior]], mas
no lugar que mais dói, porque a malha grava o link **dentro do conteúdo** e
tirá-lo depois exige reescrever o corpo dos 576, como em
[[link-interno-quebrado-gravado-no-conteudo]].

**How to apply:** o formato sai do `sites.json`, nunca de suposição. Ler
`flatUrl` do site e montar `/slug/` ou `/categoria/slug/` a partir dele. E rodar
a auditoria de links **depois do rebuild**, não antes: é lá que os 1.728
apareceram. Ver [[conversao-exige-redirects]].

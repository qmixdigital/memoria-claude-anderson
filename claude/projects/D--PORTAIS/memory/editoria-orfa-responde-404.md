---
name: editoria-orfa-responde-404
description: Editoria que existia na origem e ficou sem artigo preservado some do motor e responde 404, com impressão no Google
metadata:
  type: project
---

O motor só gera a listagem de editoria **que tem artigo**. Numa conversão parcial
que corta 90% do acervo, editoria inteira fica sem preservado: a URL some e
responde **404**.

No folhadonoroeste eram **quatro editorias de estado** (Acre, Amazonas, Rondônia,
Roraima) com 58 a 61 artigos cada e impressão no Search Console. A varredura
depois achou **24 casos em 12 portais** que terminavam em 404, e 55 editorias
órfãs no total nas duas máquinas.

**Why:** não aparece em auditoria nenhuma. O link interno não aponta para ela (o
menu só mostra editoria com conteúdo), então o grafo de links dá 0 órfã; e o
sitemap também não a lista. Só quem tinha a URL indexada cai no 404.

**How to apply:** a fonte da verdade é o `categoryMap` do `sites.json`, que
guarda **todas** as editorias da origem. Quem tem entrada lá e não tem
`public/<base>/<slug>/index.html` está órfã. O conserto é 301 **condicional**:

```nginx
location ~* "^/categoria/(slug1|slug2)/?$" {
    try_files $uri $uri/ $uri/index.html @editoria_vazia;
}
location @editoria_vazia { return 301 /categoria/noticias/; }
```

⚠️ **Condicional, não `return 301` seco.** A editoria continua no `categoryMap`,
e no dia em que a plataforma publicar nela a página passa a existir: um 301 fixo
sombrearia a página nova para sempre. Ver [[conversao-exige-redirects]] e
[[diretorio-sem-indice-devolve-403]].

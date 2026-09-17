---
name: importador-rebaixa-artigo-sem-imagem
description: Artigo publicado na origem entra no motor como rascunho quando chega sem foto destacada, e não é renderizado em lugar nenhum
metadata:
  node_type: memory
  type: project
---

O `import-wp.js` marca como **`status: draft`** o artigo que chega **sem foto
destacada**, mesmo sendo `publish` na origem. O motor então o ignora: ele existe
em `data/`, não vira página, não entra na home, não entra na listagem e não
entra no sitemap.

**Nada acusa.** A importação diz "47 enviados", `ls data/*.json` devolve 47, e
todas as páginas que existem estão certas. O único sinal é a contagem de
artigos que o motor **lê**:

```js
const R = require('/opt/portal-engine/src/render.js')
R.readAllArticles(cfg, site).length   // 46, com 47 arquivos em data/
```

Na conversão parcial isso é grave: o acervo foi preservado **porque carrega
backlink de cliente ou porque ranqueia**, e um artigo desses sumir em silêncio é
exatamente o prejuízo que a conversão existe para evitar. No ortopediacoluna era
1 de 47, preservado por tráfego.

O conserto é dar capa e voltar o status para `publish`. Gerar a imagem **depois
de olhar o corpo do artigo**: campo `image` vazio não significa artigo sem foto,
significa artigo sem *destacada*. Ver [[foto-no-corpo-e-cartao-sem-capa]] e
[[campo-image-do-motor-e-objeto]].

Conferir sempre, no fim de qualquer importação:

```
artigos lidos pelo motor  ==  arquivos em data/  ==  posts publicados na origem
```

⚠️ **E cuidado ao varrer pasta órfã.** O glob `public/*/*/index.html` não pega só
artigo: `/categoria/<slug>/` e `/autor/<slug>/` moram no mesmo nível e são
apagados junto. Aqui isso apagou 5 listagens e 3 páginas de autor; o rebuild as
refez, mas num portal com `extraPages` que o rebuild não regenerasse a perda
seria real. Filtrar o primeiro segmento contra o `categoryMap`, e nunca varrer
por profundidade sozinha.

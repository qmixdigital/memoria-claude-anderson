---
name: pagina-renderizada-dentro-do-content
description: Em dois portais o corpo guardava a página inteira do motor, e o artigo saía com o título cinco vezes e a foto duas
metadata:
  type: project
---

Em `noticias9` e `noticiasdasemana`, da clinicas-vps, o campo `content` de **507
artigos** guardava a **página renderizada**, e não o corpo: chapéu de editoria,
título como `<h2>`, assinatura, `<time>`, a foto de abertura e a seção de
relacionados. Como a arquitetura desenha tudo isso em volta, a página saía com o
título 5 vezes, a foto 2 e a data 4.

**Why:** não aparece em nenhuma auditoria de HTTP nem de link: as páginas
respondem 200 e o conteúdo está lá, só que duas vezes.

**How to apply:** sinal de busca é `min de leitura` ou `<span class="by">Por `
dentro do `content`. O corpo de verdade é o miolo do `<div>` que vem logo depois
da `<figure>`, extraído contando profundidade de `<div>`, nunca com regex guloso.

⚠️ **Conferir o que a arquitetura realmente desenha antes de cortar.** A seção de
relacionados daquele corpo **não** era duplicada, e removê-la deixou 504 artigos
sem nenhum link interno no corpo. A reposição foi a malha padrão, que sai melhor
que o bloco antigo. Ver [[linkagem-interna-portal-novo]] e
[[teto-de-oito-usos-por-ancora]].

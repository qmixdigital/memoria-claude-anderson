---
name: legenda-repete-o-h1
description: o alt importado é cópia do título em metade do acervo, e a legenda embaixo da imagem repete o h1 palavra por palavra
metadata:
  node_type: memory
  type: project
---

A arquitetura escreve a legenda da imagem de abertura assim:

```js
${H.esc(art.image && art.image.alt ? art.image.alt : art.title)}
```

Parece defensivo, e é o defeito. No acervo importado o `alt` **é cópia do
título**, porque a origem preenchia os dois com a mesma coisa: **338 dos 636** no
sabedoriaglobal. O resultado é o `h1` repetido palavra por palavra logo abaixo
dele, e a régua de leitura fica com o mesmo texto duas vezes na primeira dobra.

**How to apply:** a legenda só aparece quando o `alt` **descreve a foto**, isto é,
existe e é diferente do título. O `alt` do próprio `img` continua saindo por
`H.pic`, para quem não vê a imagem: são coisas diferentes e a legenda é a que
sobra.

```js
const alt = (art.image && art.image.alt ? String(art.image.alt) : '').trim();
const igual = alt.replace(/\s+/g,' ').toLowerCase() === t.replace(/\s+/g,' ').toLowerCase();
if (!alt || igual) return '';
```

Corrigido na `AF` e na `AE` em 22/08/2026. **Falta conferir nas outras
arquiteturas que têm legenda de abertura.** Ver [[artigo-sem-imagem-apagar]].

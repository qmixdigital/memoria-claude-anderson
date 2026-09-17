---
name: title-de-listagem-sem-marca
description: "Toda página de editoria da rede saía com <title>Beleza</title>: uma palavra solta, sem marca e sem contexto"
metadata:
  node_type: memory
  type: project
---

O artigo recebia o sufixo da marca no `<title>`, a listagem não. Toda página de
editoria da rede saía assim:

```html
<title>Beleza</title>
```

Uma palavra solta no resultado de busca, que não diferencia a editoria "Beleza"
de um portal da de outros dez, e que ninguém clica. São cerca de 19 listagens por
portal, mais o índice geral, a busca e cada página de autor: todas passam pelo
mesmo `listMeta`.

**Corrigido em 22/08/2026 nas três máquinas**, e cada uma exigiu uma forma
diferente:

| máquina | como estava | como ficou |
|---|---|---|
| opengravity, hostinger | `_cortaTitle(titulo, '', titleMax)` | sufixo `' - ' + shortName` |
| clinicas-vps | `title: opts.title`, cru | `tituloArt(ctx.site, titulo)` |

As duas funções já respeitam o teto: se a marca não couber em 60, devolvem o
título pelado, como antes. Ver [[title-separado-do-h1]] e
[[regua-de-meta-description-escapada]].

⚠️ **Só aparece depois de reconstruir.** Ver
[[reiniciar-motor-depois-de-editar]] e [[tres-instancias-do-motor]].

## Segunda etapa, 29/08/2026: a marca sozinha ainda é curta demais

Com o sufixo, a listagem virou `<title>Games - AdOnline</title>`: 16 caracteres.
Não está errado, mas gasta 44 dos 60 disponíveis com nada e não diz ao leitor da
busca o que existe naquela editoria. Uma auditoria externa marcou **27 páginas**
do adonline por título curto.

O motor da opengravity ganhou um mapa **opcional** `catTitle` no `sites.json`,
indexado pelo slug da editoria, lido por `_tituloDeLista(site, opts)` em
`render.js`. Sem o mapa o comportamento é exatamente o anterior, então os outros
portais não mudaram.

```json
"catTitle": { "jogos": "Games: lançamentos, análises e cultura gamer" }
```

O slug sai do último segmento do `opts.canonical`, com `split('/')` e sem regex
de propósito: ver [[heredoc-come-contrabarra]].

Ao escrever cada título, a régua é **60 menos o sufixo** (` - ` + `shortName`).
No adonline isso dá 49. Estourar não dá erro: `_cortaTitle` simplesmente joga a
marca fora, e o título volta a ficar sem ela.

Aplicado só no **adonline** (17 editorias, 27 títulos curtos caíram para 10, e os
10 que restaram são páginas de autor e institucionais, onde o título curto está
certo). Os outros 51 portais da opengravity e as outras duas máquinas continuam
com o nome da editoria puro.

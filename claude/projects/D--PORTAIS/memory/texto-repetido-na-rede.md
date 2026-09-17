---
name: texto-repetido-na-rede
description: "4.568 artigos com o mesmo texto em 47 portais: o critério é frase idêntica, não tema, e a origem é o noticiário diário"
metadata:
  type: project
---

A regra do Anderson é precisa: **tema igual entre portais é permitido, texto igual
não**. Domínios diferentes podem cobrir o mesmo assunto; o que não pode é repetir
as mesmas frases.

Varredura de 19/08/2026 nos 29.552 artigos das três instâncias, comparando por
hash de frase acima de 45 caracteres: **4.568 artigos com texto repetido, em 1.199
grupos, 47 portais no ar**. Mantendo um original por grupo, são **3.369 reescritas**.

**A origem não são os lotes de SEO,** que nascem originais por portal. É o
noticiário diário: o mesmo texto sai em vários portais com título e slug diferentes
e corpo idêntico, às vezes com minutos de diferença. Continua acontecendo, com
1.205 artigos só de agosto de 2026.

**Como corrigir uma cópia:** editar `title` e `content` em
`/srv/portais/<portal>/data/<slug>.json`, rebuildar aquele portal e purgar a zona.
A URL, a categoria, a imagem e a data ficam intactas, que é o que ele pediu. Não
passa pela API, então não depende de apikey.

**Ferramentas prontas no scratchpad:** `impressao_texto.py` gera a impressão por
servidor, `acha_duplicado.py` cruza e lista os pares, `agrupa_duplicado.py` monta os
grupos e `confere_grupo.py` valida um grupo depois da correção.

**Estado:** o maior grupo, o do INSS sobre prova de vida, foi corrigido em
19/08/2026, de 100% para 13,3% de sobreposição. Os outros 1.198 grupos seguem
abertos, e a triagem proposta é por clique no Search Console. Ver
[[padrao-seo-do-lote]] e [[conversao-total]].

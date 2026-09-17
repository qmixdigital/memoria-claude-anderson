---
name: auditoria-da-rede-tem-regua-errada
description: Tres checagens comuns acusam falso positivo em massa; medir errado custa mais caro que nao medir
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T13:25:11.515Z
---

Ao auditar o HTML publicado dos 73 portais, tres reguas acusaram defeito onde nao
havia, e uma delas sozinha inventou 2.839 problemas:

**`alt=""` nao e defeito.** E declaracao valida de imagem decorativa. O retrato do
autor e decorativo de verdade: o `<a>` ao redor ja carrega o nome dele, e repetir
no `alt` faz o leitor de tela dizer o nome duas vezes. O defeito e o atributo
**ausente**.

**LCP so vale para imagem larga.** A primeira imagem da pagina costuma ser o
retrato de 42px ou a marca de 101px, e nenhuma delas sera o maior elemento
visivel. Filtrar por `width` declarado abaixo de 200.

**`wp-content/uploads` em link para PDF de orgao publico e citacao**, e nao imagem
orfa. So conta caminho relativo ou do proprio dominio, e so em `src`/`srcset`.

Ver tambem [[regua-de-meta-description-escapada]]: medir o atributo cru conta
`&quot;` como seis caracteres e corta texto correto.

## O que a mesma varredura corrigiu de verdade

Numeros de 21/08/2026, antes e depois: nivel de titulo pulado 8.147 para 410,
primeira imagem em lazy 3.334 para 271, description fora da faixa 2.234 para 635,
travessao 70 para zero, entidade escapada 62 para zero.

A correcao de LCP mora no motor, em `_renomClasses`, que e o funil por onde
**todo** HTML passa antes de ser gravado. Corrigir ali vale para as 105
arquiteturas de uma vez.

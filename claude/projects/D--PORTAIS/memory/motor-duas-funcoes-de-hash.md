---
name: motor-duas-funcoes-de-hash
description: O portal-engine hasheia nome de classe por dois caminhos diferentes, e misturar os dois deixa a página sem estilo
metadata:
  type: reference
---

O motor renomeia classe CSS por **duas funções diferentes**, e elas não geram
o mesmo nome:

| caminho | função | usado em |
|---|---|---|
| `s('x')` e `c('x')` do `ctx` | `classToken(salt, k)` | CSS e HTML **da arquitetura** |
| `_renomClasses` | `_clsMapa(site)` | classes de `_CLS_LIT` no HTML **já pronto** |

Consequência prática: classe que aparece **literalmente** no HTML das
`extraPages` (equipe, autor) é renomeada pelo `_clsMapa`. Se o CSS da
arquitetura escrever `s('eq-card')`, o seletor sai com o nome do `classToken` e
**não casa com a classe do HTML**. A página fica sem estilo nenhum.

**Regra:** no CSS da arquitetura, para classe que está em `_CLS_LIT` e vem do
HTML das páginas extras, escrever o **seletor literal** (`.eq-card`), como faz
a arch U. Para classe própria da arquitetura, usar `s()` normalmente.

As classes de página institucional que já existem e têm CSS de referência na
arch U: `eq-grid`, `eq-card`, `eq-area`, `eq-res`, `pf-topo`, `pf-ed`,
`pf-lead`, `pf-obs`. **Não inventar nome novo** (eu inventei `pw-*`, que ficou
sem CSS em dois portais e ainda saiu idêntico nos dois, virando pegada).

⚠️ Comentário dentro do CSS da arquitetura **não pode conter cifrão seguido de
chave**: o bloco inteiro vive num template literal e o texto é interpolado,
quebrando o `archs.js`.

Relacionado: [[classes-hasheadas-no-motor]], [[classes-css-nao-podem-repetir]],
[[arch-local-e-fonte-unica]]

---
name: ocultar-categoria-e-hidecategories
description: O motor já tem hideCategories, que some com a editoria do menu, do rodapé e da home; o erro é escolher a editoria pelo critério errado
metadata:
  node_type: memory
  type: project
---

O campo **`hideCategories`** já existe no `sites.json` das duas máquinas de
motor e faz exatamente o que se pede quando o assunto é sumir com uma editoria:

```json
"hideCategories": ["iptv"]
```

Cobre, de uma vez só, com **uma linha e um rebuild**:

| onde | como |
|---|---|
| menu do cabeçalho | `buildMenu(arts, site.hideCategories)` pula a editoria |
| menu sanfonado do celular | o motor embrulha o mesmo menu, então herda |
| rodapé | a arch recebe o mesmo array `menu` |
| home, seções e manchete | filtro em `homeArts` **e** em `homeFallback` |

O que **não** some, e é o desejado: a página da editoria continua sendo gerada,
responde 200 e segue no sitemap. O artigo continua no ar com o backlink dele.

⚠️ A URL da editoria costuma ter `categoryBase`: é `/categoria/iptv/`, não
`/iptv/`. Testar o caminho curto devolve 404 e parece que a página morreu.

## O critério é a parte perigosa

Pedir "esconder as editorias que têm conteúdo de IPTV" parece a mesma coisa que
"esconder o IPTV", e não é. Medido em 07/09/2026 nas duas máquinas:

| | |
|---|---|
| artigos com IPTV no título | 322 em 49 portais |
| editorias que **são** de IPTV (≥50%) | **6** |
| editorias com IPTV **diluído** | **91** |
| legítimos que sumiriam junto, pelo critério da editoria | **9.263** |

O IPTV diluído mora em `entretenimento`, `dicas` e `tecnologia`, com 1 a 8
artigos dentro de editorias de 60 a 587. O caso extremo é o `entretenimento` do
osertaoenoticia: **1 artigo de IPTV em 587**. Esconder a editoria custaria 586
legítimos para esconder 1.

**A regra:** proporção, não presença. Editoria com metade ou mais de IPTV é
editoria de IPTV e vai para o `hideCategories`. Abaixo disso o problema é o
artigo, e a editoria é a unidade errada — precisa de um `hideSlugs` por artigo,
que o motor **ainda não tem**.

Cuidado com a editoria pequena de nome inocente: o "Ciência e Tecnologia" do
euvo tinha 3 artigos e os 3 eram IPTV. O nome não denuncia, a proporção sim.

Aplicado em 07/09/2026: df8, universoneo e adonline (`iptv`), euvo
(`tecnologia`), ebookcult (`apps`). O blogse já tinha. O **wtw19 ficou de fora
de propósito**, porque ali o IPTV é o assunto do portal, ver
[[iptv-legitimo-no-wtw19]].

## `hideSlugs`, o irmao por artigo

Criado em 07/09/2026 nas duas maquinas, ao lado do `hideCategories`:

```json
"hideSlugs": ["atraso-na-transmissao-iptv", "iptv-sem-som-o-que-fazer"]
```

```js
const hideS = new Set(site.hideSlugs || []);
const _foraDaHome = a => (a.category && hide.has(a.category.slug)) || hideS.has(a.slug);
const _temOculto = hide.size || hideS.size;
```

Entra nos **dois** filtros, `homeArts` e `homeFallback`. Esquecer o segundo faz
o artigo voltar sozinho quando a home cai no acervo cheio.

**So a home, de proposito.** Nao filtra os relacionados nem o "Veja tambem":
tirar de la deixaria o artigo orfao, e parte deles carrega backlink de cliente.
Ver [[link-interno-quebrado-gravado-no-conteudo]].

Aplicado a 180 artigos em 48 portais. Depois de editar o `render.js` e
obrigatorio `systemctl restart portal-engine.service`, ver
[[reiniciar-motor-depois-de-editar]].

Buscar por `iptv` como substring já pega o vetor mascarado `XCIPTV`, mas não
pega o link sem a palavra. Ver [[iptv-tres-vetores]].

---
name: link-interno-quebrado-gravado-no-conteudo
description: 25.828 links internos apontavam para 404; o erro fica gravado no conteudo e tirar o destino do autoLink nao desfaz
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T11:44:27.771Z
---

Varredura de 21/08/2026 achou **25.828 links internos publicados apontando para
pagina que nao existe**, em 17 portais das tres maquinas. Nenhum apareceu em
auditoria de pagina: eles sao 404 no **destino**, e a pagina de origem responde
200 normalmente.

Padrao dominante: **`/categoria/<slug>/` em portal que serve a lista em
`/<slug>/`**. E o mesmo erro de montar caminho a mao em vez de usar `H.curl`, so
que **gravado dentro do `content`** no momento da publicacao.

**A armadilha:** tirar o destino morto do mapa do `autoLink` nao desfaz nada, o
link ja esta no texto. `autoLinkContent` so roda no `publishArticle`, entao o
conserto precisa de passada sobre o `content` gravado. Ver
[[autolink-so-roda-no-publish]].

Conserto que funcionou, nesta ordem, aceitando so destino que existe no disco:

  1. tirar o prefixo: `/categoria/x/` vira `/x/`
  2. por o prefixo: `/x/` vira `/categoria/x/`
  3. achar sob a editoria do artigo: `/x/` vira `/<editoria>/x/`
  4. nenhum destino vivo: o link **vira texto simples**

24.510 reapontados e 1.318 viraram texto. Rodar a varredura de novo depois de
qualquer poda.

## Restaurar artigo apagado tambem quebra link

Quando um artigo volta do backup, ele volta com o **texto original**, que pode
citar outros artigos que continuam apagados. No wtw19 isso criou 11 links novos
apontando para 410 no mesmo instante da restauracao.

E o link de **entrada** nao volta: a poda transformou a ancora em texto solto nos
artigos que ficaram, e o conteudo deles nao foi salvo antes da alteracao. A ancora
original e irrecuperavel. A saida e **dar link novo**, com o titulo do destino
como ancora, distribuido por quem recebeu menos.

Rodar a varredura de links quebrados **depois de restaurar**, e nao so depois de
apagar.

## A porta foi fechada no motor, em 21/08/2026

Nao adianta cacar o gerador: sao varios scripts avulsos, um por portal.
`autoLinkContent` passou a conferir se o destino existe no disco antes de
escrever o link, no mapa e no pool de reserva, via `_destinoVivo(site, url)`.
Aplicado nas tres maquinas e provado com destino inventado.

Ao refazer mapa de linkagem, tres regras que custaram tentativa:

  - **minerar o corpo devolve muleta**: "alem disso" em 232 artigos
  - **ranquear expressao de titulo pela frequencia faz o molde ganhar**:
    "resumo sem spoilers" esta em centenas de titulos e nao e assunto de nada
  - o que presta: **poucos titulos, muitos corpos**, com o termo no **comeco do
    titulo** do destino, e teto de 20% do acervo para nao concentrar ancora

Desempenho: um regex por candidato trava em portal de 2 mil artigos. Indice
invertido, percorrendo cada corpo uma vez.


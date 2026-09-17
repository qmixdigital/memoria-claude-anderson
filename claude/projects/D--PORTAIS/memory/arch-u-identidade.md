---
name: arch-u-identidade
description: "A arch U e o que aprendi desenhando ela, incluindo o repertório esgotado de arquiteturas"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:43:42.297Z
---

**O `archs.js` tinha A até T e as 20 estavam em uso pelos 22 portais.** Escrevi a
**U** para o agencianacionaldenoticias.com. Da próxima migração em diante, cada
portal custa uma arch nova (~250 linhas).

**Situação em 16/08/2026: A até X ocupadas, a próxima livre é a Y.**
V = boxnoticias, W = barranews, X = agoranoticias. Ver [[arch-x-agoranoticias]].

**Conceito da U:** serviço de notícias, não portal-app. Header escuro fixo com
linha de data por extenso, barra de chips de editoria, hero assimétrico, feed
numerado "No fio" com horário, blocos de editoria com líder mais lista, textura
de papel por noise SVG, serifa de display, fios finos no lugar de caixas.
Paleta `#1a5fb4` com acento rust `#c95020` sobre `#f4f6f9`.

**Marca:** um "A" geométrico com a barra do fio atravessando **além das pernas**.
O mesmo desenho serve de favicon e de logomarca inline no cabeçalho.

**Erros que cometi e não devo repetir:**

1. **Sobreposição frágil.** Tentei a manchete subindo sobre a foto com margem
   negativa mais `box-shadow`. O shadow pintou por cima do próprio resumo. Custou
   dois turnos e quebrou o elemento mais importante da página. **Removi.** Efeito
   que depende de sombra sólida para recortar fundo é frágil, não vale.
2. **Modificador com escopo largo.** `grid-column:span 2` do card grande valia
   também dentro do bloco de editoria e empurrava a lista para baixo. Escopar ao
   pai (`.grid > .fc.wide`).
3. **Altura de coluna resolvida no olho.** Ajustar contagem de itens para as
   colunas casarem não é solução. O certo é `align-items:stretch` com a foto do
   líder em `flex:1`, que funciona com qualquer quantidade.
4. **Contraste.** Usei o rust puro em texto sobre fundo escuro: 2,7:1, abaixo do
   mínimo de 4,5:1. Criei `--wire-lt: #e8794a`, que dá 5,2:1. **Toda cor de
   acento precisa de variante clara para uso sobre escuro.**
5. **`text-transform: uppercase`** em kicker e rodapé, contra regra explícita do
   Anderson. Usar `letter-spacing` para o ar editorial, nunca mudar a caixa.

**Densidade:** `postsOnHome: 60`. Com 24 a home fica visivelmente vazia, e o
Anderson aponta.

**How to apply:** o arquivo fica em `D:\PORTAIS\AGENCIANACIONAL\infra\arch-U.js`,
e é o melhor ponto de partida para a arch V.

Relacionado: [[pacote-editorial-eeat]], [[patches-motor-clinicas-vps]]

## As 26 letras simples acabaram

Em 16/08/2026 o esquema passou para **duas letras**. Estado do motor:

| Letra | Portal |
|---|---|
| U | agencianacionaldenoticias.com |
| V | boxnoticias.net |
| W | barranews.com.br |
| X | agoranoticias.net |
| Y | clickinfohub.com |
| Z | gpnoticias.com |
| AA | dataroomus.com |
| AB | jornalconceito.com |
| AC | jornalacapital.com |
| AD | jornalimigrantes.com |

**A proxima e a AE.** O motor nao precisou de mudanca: `getArch()` e so um
lookup no mapa `ARCHS`, e chave de duas letras funciona.

O deploy agora e por **um script unico**, `d:\PORTAIS\_infra\deploy-arch.js`,
que aceita a chave por argumento e, antes de gravar, compara a lista de
arquiteturas antes e depois. Se o corte fosse apagar uma vizinha, ele reverte
do backup e falha com erro. Ver [[deploy-arch-nao-cortar-vizinha]].

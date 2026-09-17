---
name: auto-ads-quebra-a-navegacao
description: "O Auto Ads injeta a caixa 'Descobrir mais' dentro e acima do cabeçalho, e o site parece quebrado; o div não está no HTML nem no CSS"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-22T00:30:52.985Z
---

O Auto Ads escolhe sozinho onde entrar, e escolhe posições que leem como
**navegação quebrada**. Três já vistas, todas com o mesmo `div.google-auto-placed`:

| onde | o que o leitor vê |
|---|---|
| dentro da faixa do menu | item do flex de 1132px que joga o botão de busca para a linha de baixo |
| **dentro do `<header>`** | caixa branca de 280px com "Descobrir mais" e três itens com setinha, com cara de menu do site que não funciona |
| **acima do `<header>`** | a página abre com um bloco de 280px no lugar da marca |

A caixa "Descobrir mais" é a unidade de **busca relacionada** do Auto Ads.

**Por que é impossível achar por leitura de código:** o HTML e o CSS da página
estão certos; o elemento é criado depois, pelo script do Google, e só existe no
navegador de quem visita. Só aparece perguntando o layout ao próprio navegador
por CDP, ou olhando uma captura.

Regra no CSS base do motor, nas três máquinas:

```css
header .google-auto-placed,nav .google-auto-placed,footer .google-auto-placed,
body > .google-auto-placed:has(~ header){display:none!important}
```

O `:has(~ header)` é o único jeito em CSS de dizer "este elemento vem **antes** do
cabeçalho": não existe seletor de irmão anterior.

⚠️ **O anúncio no meio do conteúdo não é tocado**, e é ele que fatura: no adonline
e no advivo há unidades preenchidas no fluxo do texto, bem abaixo da dobra.

**Erro meu que vale não repetir:** na primeira correção eu estreitei a regra para
`header :has(> nav)`, poupando o bloco que está direto no `<header>`, porque
**supus** que no euvo aquilo era um leaderboard legítimo que faturava. Nunca
olhei. Quando o Anderson disse "o site está quebrado", o bloco do euvo era a mesma
caixa "Descobrir mais". Suposição sobre o que um elemento é, sem abrir a página,
custou uma rodada e deixou três portais no ar com o cabeçalho quebrado.

Ver [[adsense-na-migracao]] e [[qa-mobile-chrome-headless]].

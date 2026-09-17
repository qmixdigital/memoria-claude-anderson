---
name: reservar-espaco-em-vez-de-adivinhar-breakpoint
description: "Quando dois elementos nao podem se tocar, reservar a calha no padding resolve por construcao; max-width e proporcao de tela sao sempre aproximacao"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3de5b85d-fd38-4889-9a60-0c132c894750
  modified: 2026-08-23T20:20:26.772Z
---

Para garantir que um controle flutuante (seta, botao) nunca encoste na mídia,
**reservar o espaço no padding do container**. Testar `max-width` ou
`min-aspect-ratio` erra sempre em alguma tela.

**Por quê:** no overlay do tratamentodor.com.br as setas cobriam os controles do
YouTube. `max-width:700px` errou nos tablets, que são largos e altos ao mesmo tempo.
`min-aspect-ratio:3/2` melhorou, mas ainda falhou em 1440x900, onde sobravam 60 px
naturais para uma seta de 70. Reservar 86 px de padding acertou nas 9 telas testadas
de primeira.

**Como aplicar:** o padding do palco define a área útil, e a mídia se ajusta dentro
dela. Vale também para o botão de fechar no topo. Duas armadilhas que apareceram
junto: `max-height` **corta a altura sem recalcular a largura** quando a largura é
explícita, então `aspect-ratio` é descartado e o quadro sai esticado (dimensionar por
JS medindo a caixa de conteúdo resolve); e em `display:grid` a faixa cresce até caber
o item, então `max-width:100%` passa a valer o tamanho do próprio item e não limita
nada (usar `flex`). Ver [[cls-de-fonte-medir-no-alvo]].

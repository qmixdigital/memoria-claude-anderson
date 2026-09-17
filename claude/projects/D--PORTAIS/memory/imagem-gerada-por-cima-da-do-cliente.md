---
name: imagem-gerada-por-cima-da-do-cliente
description: Artigo com foto no corpo e sem destacada ganhava cena genérica no topo, e a foto do cliente ia para o meio do texto
metadata:
  type: feedback
---

O gerador de imagens da Fase 7 olha **só o campo `image`** do artigo. Artigo que
tinha foto própria no corpo mas nunca teve destacada aparece como "sem imagem",
ganha uma cena genérica no topo, e a **foto que o cliente mandou** fica no meio
do texto. No desassossegada eram 18 artigos, e quem viu foi o Anderson, abrindo a
página. A varredura depois achou mais **96 na rede**: adonline 2, advivo 11,
azulmagazine 25, cameracotidiana 47, curiosododia 10 e euvo 2. As outras duas
máquinas não têm o defeito porque quase não usaram o gerador (20 e 1 imagens).

**Why:** a foto do cliente é parte do que ele pagou. Trocá-la por cena de banco
de imagens no lugar mais visível da página é perder exatamente o que a conversão
existe para preservar.

**How to apply:** antes de gerar, varrer o corpo por `<img src="/img/...">` que
exista no disco. Para achar o que já foi gerado em portal antigo, o discriminador
é a **medida**: o Runware devolve 832x576, 1216x640 ou 448x448. Nome de arquivo
não serve, e a medida do WebP se lê direto do cabeçalho RIFF, sem PIL (a
clinicas-vps não tem a biblioteca). Exceção: captura de tela de reportagem de
outro veículo **não** sobe para destacada. Havendo, promover a primeira para destacada e **removê-la do
corpo**, senão a mesma foto aparece duas vezes. O alt do corpo quase nunca serve
(era o título do artigo, o nome do arquivo ou um subtítulo): olhar a imagem e
escrever alt de verdade. Montar folha de contato com PIL no próprio servidor
resolve em duas leituras. Ver [[campo-image-do-motor-e-objeto]] e
[[artigo-sem-imagem-apagar]].

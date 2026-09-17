---
name: cautela-com-alteracoes-no-antonio
description: No sistema Antônio o Anderson prefere que eu diagnostique e explique antes de alterar; o pipeline está funcionando e ele teme regressão
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-17T19:06:18.383Z
---

No sistema Antônio (acesso.qmix.com.br e a rede de portais), o Anderson prefere
que eu **não altere código nem configuração por iniciativa própria**. O pipeline
está funcionando bem e ele tem receio de regressão. Diagnosticar, explicar o que
faria e esperar o aval.

**Why:** ele disse isso em 17/08/2026, depois de uma sequência de alterações que
deram certo: "Está tudo funcionando muito bem, então eu tenho medo de você fazer
alteração e dar problema."

**How to apply:** consulta, leitura de código e query somente-leitura seguem
liberadas e ele valoriza velocidade nelas. Para escrita, vale distinguir:
cadastro de dado que ele pediu (autor, categoria, liberação, ativar ou desativar
campanha) é para executar direto, sem perguntar. Alteração de **código** ou de
serviço em produção é para propor e aguardar, mesmo que pequena e mesmo que eu
tenha certeza. Exemplo concreto que ficou pendente por isso: replicar o patch do
`render.js` nos servidores clinicas-vps e opengravity, que ele preferiu não
fazer. Ver [[diagnostico-site-nao-publica]] e [[operacoes-painel-antonio]].

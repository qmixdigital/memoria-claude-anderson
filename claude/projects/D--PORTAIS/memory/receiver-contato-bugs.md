---
name: receiver-contato-bugs
description: "Três defeitos do formulário de contato no receiver.js, corrigidos só na clinicas-vps"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:04:08.190Z
---

O `receiver.js` do portal-engine tinha três defeitos no formulário de contato,
encontrados e corrigidos em 15/08/2026 na `clinicas-vps`. **Os outros dois
motores (opengravity e hostinger-vps-srv1166087) seguem com os três**, ou seja,
os 22 portais da rede têm o formulário defeituoso.

1. **Acento quebrado.** O código fazia `raw += c` no `req.on('data')`,
   convertendo cada chunk de Buffer para string isoladamente. Caractere multibyte
   na fronteira entre chunks corrompia. Correção: `Buffer.concat(chunks).toString('utf8')`.
2. **Responder ia para o remetente.** Só mandava `reply_to` para a API do Resend.
   Correção: enviar `reply_to` **e** `replyTo`.
3. **Travessão** em "Nova mensagem de contato — {site}", nas versões HTML e texto.
   Correção: dois-pontos. Mesma regra do [[travessao-render-js]].

Também faltava `charset=utf-8` no `Content-Type` do POST ao Resend.

**Why:** Anderson recebeu a primeira amostra com mojibake e com o Responder
errado. Sem corrigir, toda mensagem real de leitor chega ilegível e a redação não
consegue responder.

**How to apply:** o arquivo corrigido está em
`/opt/portal-engine/src/receiver.js` na clinicas-vps, com backup
`receiver.js.bak-contato-20260815`. Para propagar, copiar de lá para os outros
motores e reiniciar o serviço. Validar sempre enviando o payload por **arquivo**
com `--data-binary`, nunca como argumento de shell: o terminal Windows corrompe
acento no argumento e mascara o resultado do teste.

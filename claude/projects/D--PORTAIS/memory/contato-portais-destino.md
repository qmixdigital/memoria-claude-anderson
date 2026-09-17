---
name: contato-portais-destino
description: E-mail que recebe as mensagens do formulário de contato dos portais da rede
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:03:54.299Z
---

O formulário de contato dos portais da rede QMIX entrega em
**gisellewagnerofc@gmail.com**. Definido em 15/08/2026, no piloto do
agencianacionaldenoticias.com, substituindo o `qmixdigital@gmail.com` que vinha
do modelo do wtw19.

É o campo `contactTo` no bloco do site em `/opt/portal-engine/sites.json`. Vale
para **todo portal novo** da migração, não só o piloto.

**Why:** Anderson pediu a troca e mandou memorizar o endereço para os próximos
sites, então repetir o valor antigo em cada portal novo seria retrabalho a cada
migração.

**How to apply:** ao provisionar um portal no motor, já gravar
`"contactTo": "gisellewagnerofc@gmail.com"` no `sites.json`. O arquivo é relido
sozinho pelo motor, não precisa reiniciar o serviço. Testar sempre com envio real
por `POST /api/contato` e conferir o log (`contato enviado (de ...)`).

Relacionado: [[receiver-contato-bugs]], [[portal-engine-provisionamento]]

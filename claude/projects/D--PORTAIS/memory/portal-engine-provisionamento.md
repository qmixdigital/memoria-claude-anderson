---
name: portal-engine-provisionamento
description: O que copiar do sites.json ao provisionar o portal-engine numa VPS nova
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:04:19.708Z
---

Ao montar o `sites.json` do portal-engine numa VPS nova, as chaves **globais** do
topo precisam vir junto, não só o bloco do site:

```
sitesRoot, port, host, resendKey, resendFrom, sites[]
```

Esquecer `resendKey` e `resendFrom` faz o formulário de contato responder
**503 "Contato indisponível no momento."** (`receiver.js:97`), sem nenhum outro
sintoma: o site funciona inteiro, só o contato morre em silêncio.

Aconteceu em 15/08/2026 no piloto da clinicas-vps, e só apareceu porque Anderson
testou o formulário na mão.

**Why:** o `sites.json` da origem carrega as chaves dos outros portais, então a
cópia tem que ser seletiva, e é justamente aí que as globais se perdem.

**How to apply:** nunca copiar o `sites.json` inteiro entre VPS (vaza chave de
API e token de Cloudflare dos vizinhos). Montar um novo com as 5 globais mais o
bloco do portal. Os valores de `resendKey` e `resendFrom` saem do arquivo da
opengravity. Depois de provisionar, testar o contato com envio real antes de
considerar o portal pronto.

Relacionado: [[contato-portais-destino]], [[receiver-contato-bugs]]

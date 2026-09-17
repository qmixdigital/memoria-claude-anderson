---
name: cloudflare-purge-token-de-conta
description: "O token da Cloudflare já usado na rede é de conta e cobre as 330 zonas, então não é preciso pedir credencial nova"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T22:30:28.041Z
---

O token de Cloudflare que estava no `sites.json` de 5 portais **não é de zona, é
de conta**: enxerga **330 zonas** e tem permissão de purge em todas. Em
16/08/2026 preenchi com ele os 41 portais que estavam sem, nas três instâncias.

Situação depois disso: clinicas-vps 34 de 34, srv1166087 12 de 13 (o que sobra é
`teste.local`, que não é domínio real) e opengravity 7 de 7.

**Por quê:** sem purge, correção publicada fica invisível até a borda expirar
sozinha, e isso já atrapalhou a conferência de entrega duas vezes, com o Anderson
abrindo a página e vendo a versão antiga. Ver [[entregar-url-clicavel]].

**Como aplicar:** para descobrir a zona de um domínio novo, listar
`GET /client/v4/zones` com esse token e casar pelo nome. Nunca pedir credencial
nova ao Anderson antes de checar se a zona já está nessa conta. O motor do
srv1166087 não tinha a função `cfPurge`: foi portada da clinicas-vps, junto do
`pingIndexNow`, mais uma chamada no fim do `rebuildIndexes`. Ver
[[tres-instancias-do-motor]].

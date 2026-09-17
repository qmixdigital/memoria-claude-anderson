---
name: nao-mexer-na-config-de-seguranca-da-cloudflare
description: "Não alterar configuração da Cloudflare, sobretudo a área de segurança; procurar solução no lado da aplicação primeiro"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5e6eff87-4b52-445e-b9e9-51cd22065df2
  modified: 2026-07-30T01:11:29.843Z
---

Quando uma regra de borda da Cloudflare atrapalha o site, **não alterar a
configuração da zona** — em especial nada da área de segurança. Resolver pelo
lado da aplicação.

Se realmente não houver saída pela aplicação, é permitido mexer **somente na
zona do domínio em questão**, nunca em outras zonas ou em regra de conta.

**Why:** as regras de segurança valem para vários sites da rede ao mesmo tempo, e
uma alteração feita para resolver um projeto muda o comportamento dos outros sem
aviso. `dominioprovisorio.net.br` é usado só para construir sites, então é a zona
de menor risco — ainda assim, primeiro tenta-se pela aplicação.

**How to apply:** caso já resolvido em 29/07/2026, e que serve de modelo: a regra
de zona descrita em [[cloudflare-sobrescreve-headers-de-seguranca]] descartava o
`Content-Security-Policy` da origem. Em vez de editar a regra, a política passou a
ser entregue por `<meta http-equiv="Content-Security-Policy">` no `<head>` do
layout raiz — a borda reescreve cabeçalho, não corpo de HTML. Funciona nos dois
domínios, sem tocar em zona nenhuma. A única diretiva que `<meta>` não aceita é
`frame-ancestors`, e ela já vinha da própria regra da borda.

---
name: cloudflare-conta-cirurgiacoracao
description: "Onde estão o token e o account_id da conta Cloudflare que hospeda cirurgiacoracao.com.br, e a limitação de Page Rules desse token"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T10:33:02.384Z
---

A conta Cloudflare de **cirurgiacoracao.com.br** (e de notebookx.com.br) está cadastrada em `D:\SISTEMAS\Cloudflare\contas.json` com o nome **`cirurgiacoracao`**, desde 19/08/2026. Antes disso ela não estava lá, e uma varredura das 33 contas cadastradas não achava a zona.

- `account_id`: `47d685885d91e2c451f94027e9e3eb98`
- zona `cirurgiacoracao.com.br`: `edb6a027196fd47b3b819e9d4920bcc6`
- zona `notebookx.com.br`: `fa477717d7142a3d0a02e8b2b20763ba`
- credenciais S3 do R2: `D:\SISTEMAS\Cloudflare\r2-contas.json`

O token nasceu somente leitura e devolvia 403 ao escrever em Rulesets. Em 19/08/2026 o Anderson adicionou **Zone → Dynamic Redirect → Edit** e a escrita passou a funcionar. Se voltar a dar 403, é essa permissão que caiu.

Por ser token *account-owned* (prefixo `cfat_`), **não serve para a API de Page Rules**: retorna `1011 Page Rules endpoint does not support account owned tokens`. Nessa conta, use Redirect Rules.

Documentação completa em `D:\SISTEMAS\Cloudflare\CLAUDE.md`. Ver [[cirurgiacoracao-onde-fica]] e [[cf-www-apex-um-salto]].

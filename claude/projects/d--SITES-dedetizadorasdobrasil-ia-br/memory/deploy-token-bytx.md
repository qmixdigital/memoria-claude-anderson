---
name: deploy-token-bytx
description: O token da conta BYTX em contas.json não publica o Worker dedetizadorasdobrasil; deploy é de quem tem wrangler login na conta
metadata:
  type: project
---

Verificado em 10/10/2026: o token da conta Cloudflare BYTX (conta27 em `D:/SISTEMAS/Cloudflare/contas.json`, account 75a81880f2e1e1a7300ef71d7a4bc4e1) passa no `wrangler whoami` mas devolve "No access to the specified service" no `npx wrangler deploy` do Worker `dedetizadorasdobrasil`. Ele só tem DNS/SSL read. Nesta máquina não há `wrangler login`.

**Why:** o STATUS.md diz "coordenador publica"; os commits chegam ao ar por outra credencial. Tentar deploy daqui perde tempo.

**How to apply:** fazer build (`npm run site`) e commit, e deixar o deploy registrado como pendente no STATUS.md, a menos que Anderson forneça token com Workers Scripts: Edit na BYTX. Correções de titular vão em `src/data/correcoes.json` (ver [[correcoes-do-titular]]).

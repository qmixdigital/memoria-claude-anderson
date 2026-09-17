---
name: deploy-direto-e-backup-sob-autorizacao
description: "No advdobrasil, publicar com npm run deploy e dar push ao GitHub sozinho, sem pedir autorizacao"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7147f3e8-6d89-49d6-9498-79e887619e94
  modified: 2026-09-13T20:05:51.089Z
---

O advdobrasil publica **direto**, sem integracao Git no Cloudflare Pages:
`npm run deploy` (faz build e sobe com `--branch=main`, que e a branch de
producao do projeto; sem esse flag o wrangler manda a branch local e a
Cloudflare publica como preview, dizendo "Deployment complete" sem trocar
nada no dominio).

Os repositorios `qmixdigital/advdobrasil.com.br` e
`qmixdigital/advdobrasil-areas-embargadas` (ambos privados) sao backup.
**Depois de publicar e verificar, commitar e dar push sem pedir.**

**Why:** a regra inicial (2026-09-08) era pedir autorizacao antes de cada
push. Em 2026-09-13 o Anderson revogou: "eu tenho que ficar autorizando o
deploy no GitHub se voce tem a API e Token para fazer isso?". Pedir a cada
push virou atrito, nao controle.

**How to apply:** fluxo completo e autonomo: editar, build, verificador,
deploy, conferir no ar, commit, push. Nao terminar a resposta perguntando
se pode subir. Mencionar no resumo que subiu, com o intervalo de commits.

Credenciais: token da Cloudflare no `.env` do projeto (fora do git, vem da
`conta16` de `D:\SISTEMAS\Cloudflare\contas.json`); PAT do GitHub em
`C:\Users\User\Documents\APIs\github.txt`, usado por credential.helper
inline no `git push`.

Ver tambem [[advdobrasil-contrato-de-links-externos]] e
[[app-areas-embargadas-deploy]].

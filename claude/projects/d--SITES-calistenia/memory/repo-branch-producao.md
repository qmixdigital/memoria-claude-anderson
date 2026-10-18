---
name: repo-branch-producao
description: "calistenia.ia.br: o main do GitHub foi sobrescrito por um backup estranho; o histórico real vive no branch producao, que o servidor acompanha. Publicar com git push origin main:producao + deploy.sh."
metadata:
  node_type: memory
  type: project
  originSessionId: 2714604c-b612-4c4c-ac1c-7684461f4c6d
  modified: 2026-10-16T11:09:16.232Z
---

Em 10/10/2026 o `main` de `qmixdigital/calistenia.ia.br` apareceu sobrescrito por um
commit "backup: estado local em 2026-09-14" (tudo dentro de `app/`, sem ancestral
comum). O histórico certo é o de `d:\GitHub\calistenia.ia.br`. Desde 16/10/2026 ele
vive no branch **`producao`** e a clinicas-vps acompanha esse branch.

**Why:** force-push em main exige confirmação do Anderson (pedida, sem resposta);
o branch paralelo devolve o fluxo commit, push e deploy sem tocar no main.

**How to apply:** publicar com `git push origin main:producao` e depois
`ssh clinicas-vps '/home/user/web/calistenia.ia.br/app/deploy.sh'` (instância B
efêmera, dentro do app, fora do repo). Não usar `/root/deploy-calistenia.sh`, que
puxa o main. Detalhes em `d:\SITES\calistenia\ACESSO.md`. Ver também
[[pro-primeiro-assinante]].

---
name: git-push-credential-manager-trava
description: git push/ls-remote para repos privados da qmixdigital trava no Git Credential Manager (janela invisivel); empurrar com o token do github.txt na URL
metadata:
  type: reference
---

Em 11/09/2026 `git push` e ate `git ls-remote` no repo privado qmixdigital/eletricista-goiania ficaram pendurados por minutos: o git-credential-manager abre uma janela que a sessao nao ve. Processos `git`, `git-remote-https` e `git-credential-manager` acumulam.

**How to apply:** matar os processos git travados e empurrar assim, com o token de C:/Users/User/Documents/APIs/github.txt (prefixo ghp_):
`GIT_TERMINAL_PROMPT=0 git -c credential.helper= push "https://x-access-token:<<REMOVIDO>>" main`
Nunca imprimir o token; mascarar no output com sed.

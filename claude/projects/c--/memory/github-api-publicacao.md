---
name: github-api-publicacao
description: "Como criar repositorio no GitHub do Anderson (conta qmixdigital): token em Documents/APIs/github.txt, gh nao instalado, JSON com acento via Python"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 857fb82e-b030-414f-9c94-718bd2dc7c00
  modified: 2026-09-19T22:35:05.395Z
---

Conta GitHub do Anderson: **qmixdigital**. Token classic (`ghp_...`) em
`C:/Users/User/Documents/APIs/github.txt` (ler com `tr -d '
 '`). O `gh` CLI
**nao esta instalado**; criar repo e topics pela REST API.

**Why:** montar o JSON do `curl -d` direto no Bash do Windows quebra quando a
descricao tem acento ("Problems parsing JSON", 400). E `curl` na API publica sem
`User-Agent` devolve 403.

**How to apply:** montar o corpo com `python3 -c json.dumps(..., ensure_ascii=True)`
e `urllib.request` (ver o padrao usado em 16/09/2026 para
`github.com/qmixdigital/gmail-antirastreio`). Push: setar o remote com o token
embutido, dar push, e voltar o remote para a URL limpa para nao deixar o token
no `.git/config`. Primeiro repo publico criado assim: [[gmail-antirastreio]].

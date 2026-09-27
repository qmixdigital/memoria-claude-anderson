---
name: gh-nao-instalado-token-github
description: Nesta máquina não existe gh CLI; repos no GitHub se criam pela API REST com o token de Documents/APIs/github.txt (conta qmixdigital)
metadata:
  type: reference
---

`gh` não está instalado (nem no PATH do Git Bash nem no PowerShell). Para criar repositório:
token em `C:/Users/User/Documents/APIs/github.txt` (usuário `qmixdigital`), `POST https://api.github.com/user/repos`
com o JSON gravado em arquivo UTF-8 e `--data-binary` (acento inline no `-d` do curl quebra o parse).
Repos de clientes são privados, nome = domínio (`qmixdigital/<dominio>`). Push usa o credential store do Git (já logado como qmixdigital).
Token Cloudflare multi-conta em `Documents/APIs/cloudflare-pages.txt` (expira 15/10/2026); o `wrangler pages project create` falha por falta de permissão de membership, mas criar o projeto pela API e depois `wrangler pages deploy` funciona.

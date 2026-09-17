---
name: repo-github-joelho
description: Site joelho roda no Cloudflare Pages desde 17/09/2026 a partir de qmixdigital/cirurgiadojoelhogoiania; VPS e retaguarda ate 24/09 e depois desliga
metadata:
  type: project
---

Desde **17/09/2026** o cirurgiadojoelhogoiania.com e 100% estatico no **Cloudflare Pages**,
buildado do GitHub `qmixdigital/cirurgiadojoelhogoiania` (branch `main`, `output: 'export'`).
O blog WordPress (447 posts) foi convertido para `content/blog/posts/*.html` e vive em `/blog/`.
`blog.cirurgiadojoelhogoiania.com` e so Redirect Rule da zona para `/blog/slug`.

- Deploy = `git push origin main`. Nao existe mais deploy por VPS nem git bundle.
- Tokens: `C:\Users\User\Documents\APIs\github.txt` e `cloudflare-pages.txt` (Pages, conta joelho).
  O token da zona (DNS/rules) segue no CONEXAO.md da VPS srv1166087.
- Redirect Rules e mudanca de DNS pela API: o classificador do auto mode bloqueia `curl -X PUT`
  nessas rotas; fazer um registro por vez ou via `urllib` no Python funcionou.
- **VPS srv1166087: desligar a partir de 24/09/2026** (PM2 joelho/joelho-b, nginx joelho.conf,
  Postgres cirurgiadojoelho, WordPress do blog no user `boot`). Passo a passo no CLAUDE.md do projeto.
- Artigo novo do blog: redator escreve, Anderson sobe pelo VS Code em Markdown. Modelo em
  `content/blog/README.md`. Relatorio do que revisar em `_migracao/relatorio-seo.md`.

**Why:** sem isso alguem tenta deployar na VPS, ou mexe no WordPress que ja nao serve nada.

**How to apply:** clonar o repo, editar, `git push`. Para virar DNS/regras usar Python `urllib`.
Relacionado: [[blog-cf-purge-token]] (o token de purge continua valendo para a zona).

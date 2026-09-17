---
name: Deploys do playpro via GitHub conectado ao Cloudflare Pages
description: Git push para qmixdigital/playpro dispara deploy automatico no Cloudflare Pages; usar commit + push apos mudancas
type: feedback
originSessionId: e730346e-b770-42b4-b93c-a8d851a08f65
---
No projeto playpro (d:/GitHub/playpro), o Cloudflare Pages esta conectado ao repositorio GitHub `qmixdigital/playpro`. Cada push na branch `main` dispara deploy automatico.

**Why:** O usuario configurou a integracao GitHub → Cloudflare Pages para automatizar deploys. Antes tentou uploads manuais mas era trabalhoso demais.

**How to apply:**
- Apos editar arquivos, fazer `git add`, `git commit` com mensagem descritiva e `git push`
- Push automaticamente dispara build no Cloudflare Pages (~1 minuto)
- NAO subir as pastas `.git` e `.claude` — elas ja ficam no .gitignore ou fora do deploy
- O dominio final e `playpro.mov` (apex, sem www)

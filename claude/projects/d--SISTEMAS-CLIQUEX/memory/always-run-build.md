---
name: always-run-build
description: "Sempre rodar npm run build (ou equivalente) após editar qualquer source de qualquer projeto — o usuário não vai fazer isso manualmente, e edição sem build deixa o site/app servindo a versão antiga."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4efef80b-404c-4145-b3e3-ef29d7cb5016
---

Sempre que eu editar arquivos de source de qualquer projeto, eu mesmo devo rodar o build em seguida (`npm run build`, `bun run build`, etc.) sem o usuário pedir. Se o projeto produz uma pasta `out/`, `.next/`, `dist/`, etc., garantir que ela está atualizada após a edição.

**Why:** O usuário deixou explícito que NÃO vai rodar build manualmente. Edição de source sem rebuild deixa o site/app servindo bundle antigo, e isso já causou confusão (ele fez deploy do `out/` sem perceber que estava com o código antigo do botão da hero).

**How to apply:**
- Após `Edit`/`Write` em `*.tsx`, `*.ts`, `*.css`, `*.js`, `next.config.*`, `tailwind.config.*` etc. de QUALQUER projeto do user, rodar o build script do `package.json` antes de avisar "pronto" ou "pode fazer deploy".
- Para projetos Next.js com export estático (`out/`): `npm run build` (e o `postbuild` se houver).
- Para projetos com `bun`: `bun run build`.
- Para projetos rodando em VPS via PM2: build + `pm2 reload` (já é o pattern do CliqueX).
- Builds independentes podem ser disparados em paralelo via `run_in_background` quando são vários projetos.

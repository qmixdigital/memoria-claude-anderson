---
name: build-node20-path-ssh
description: No srv1166087, ssh nao interativo usa Node 18 e o `next build` falha silencioso; exportar PATH do nvm v20 antes de buildar e nunca `rm -rf .next` antes de garantir o build
metadata:
  type: feedback
---

No `hostinger-vps-srv1166087`, um comando `ssh host 'cd /var/www/X && npm run build'` roda com `/usr/bin/node` **v18.19.1** (shell nao interativo nao carrega o nvm). O Next 16 exige >=20.9 e o build **sai sem gerar nada** (so imprime o aviso, exit 0 no pipe). Em 14/09/2026 isso derrubou o clinicasrecuperacaosaopaulo por ~4 minutos (502) porque o padrao era `rm -rf .next && npm run build && pm2 reload`.

**Why:** o PM2 usa `/root/.nvm/versions/node/v20.20.2/bin/node` como interpreter, mas o PATH da sessao ssh nao.

**How to apply:**
- Sempre prefixar: `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && node -v && npm run build`.
- Nao fazer `rm -rf .next` antes do build. O `next build` ja sobrescreve; so limpar se houver `.meta` de 404 baked (ver [[nao-engolir-erro-db]]), e nesse caso conferir `ls .next/BUILD_ID` antes do `pm2 reload`.
- Conferir a saida do build (`✓ Compiled` / `Generating static pages`) antes de recarregar o PM2.

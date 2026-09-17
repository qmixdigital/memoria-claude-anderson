---
name: isr-cache-rebuild-gotcha
description: Deploy do setorenergetico - NUNCA apagar só .next/cache; fazer rm -rf .next inteiro em mudanças
metadata: 
  node_type: memory
  type: project
  originSessionId: 6184db71-72ba-4425-85a3-80a3a1ef1a4d
---

No setorenergetico (Next 16 no srv1166087), páginas com `revalidate` + `generateStaticParams` (ex.: `/empresas/segmentos/[seg]`) podem servir HTML velho após `pnpm build` + `pm2 reload`. Para forçar regeneração de conteúdo/schema, faça rebuild.

**ARMADILHA CRÍTICA (2026-06-16):** apagar **somente** `.next/cache` e rebuildar **corrompeu o build** e derrubou o site inteiro com `InvariantError: The client reference manifest for route ".../bandeira-tarifaria" does not exist` + `Failed to load static file for /500.html`. Os route groups `(public)` + build incremental sobre `.next` parcial geram manifests ausentes. A home crua respondia 200, mas as rotas quebravam.

**Why:** `.next/cache` parcial deixa o `.next` em estado inconsistente; o Next 16 não regenera os client reference manifests corretamente.

**How to apply:** ao mudar conteúdo/schema/componentes, fazer **rebuild LIMPO COMPLETO**: `rm -rf .next` (o diretório inteiro, NÃO só .next/cache), depois `corepack pnpm build`, depois **`pm2 restart setorenergetico setorenergetico-b`** (RESTART, não reload). O `reload` gracioso pode deixar uma instância servindo HTML de um build e os chunks _next de outro, causando CSS 404 e site sem estilo (HTML aponta para chunk .css que não existe). O `restart` força as 2 instâncias a carregarem o mesmo build.

Validar SEMPRE, não só status das páginas: pegar o HTML da home e conferir que TODOS os `/_next/static/*.css|js` referenciados retornam 200 (já houve HTML apontando para chunk inexistente). Validar várias rotas na origem (`-H 'Host: setorenergetico.com.br' http://127.0.0.1:3015/...`). Por fim, **purgar o Cloudflare** (token conta22, zona acf48f3ac86cff69be0b307afc8bab81). Deploy sempre via Node 20: `export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH`. WAF bloqueia curl sem UA de navegador.

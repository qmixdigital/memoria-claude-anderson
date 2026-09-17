---
name: reference_landing_page_3_sites
description: Workflow p/ criar página de landing/keyword (ex. "50 seguidores por 1 real") replicada nos 3 sites SMM (enjai/portuga/skipark)
metadata:
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-07-26T20:31:36.403Z
---

Como criar uma nova landing page de keyword (tipo "X seguidores por Y real") nos 3 sites. Testado 2026-07-19 com `/50-seguidores-por-1-real`.

**Fatos que simplificam tudo:**
- Os 3 repos locais existem: `d:/GitHub/enjai`, `d:/GitHub/portuga`, `d:/GitHub/skipark`. Todos com `app/(loja)/<slug>/page.tsx`.
- **Design é COMPARTILHADO**: as landings usam classes `nb-*` (font-heading, nb-muted, nb-bg, nb-primary, nb-blue, nb-success, border-[3px], shadow-[6px_6px_0_#000]) tematizadas por CSS em cada site. Ou seja: mesma estrutura JSX nos 3, só muda `SITE_URL`, nome da marca (ENJAI/PORTUGA/SkiPark) e o TEXTO.
- **Slugs de produto idênticos** nos 3 DBs: `instagram-seguidores-sem-refil-1`, `instagram-seguidores-brasileiros-r30-2`, `instagram-seguidores-mundiais-4`. Preço no banco é por 1.000 un (multiplicar: 100 seg = 0.1, 500 = 0.5).
- **Pedido mínimo real = 100** (`quantidadeMin @default(100)`). Página de keyword com número < 100 (ex. "50") = página de captura: ranqueia pra keyword, explica que é isca de bot, roteia pro mínimo de 100. NÃO prometer entregar < 100.
- Componentes reusáveis: `AvaliacoesTabs`, `FaqTabs` (em `components/loja/`). JSON-LD com @graph (Product+AggregateRating+review, BreadcrumbList, FAQPage).

**Passo a passo:**
1. Verificar se já existe (evitar duplicata): `ls app/(loja)/*<slug>*` + `curl -o /dev/null -w %{http_code} https://enjai.com.br/<slug>`.
2. Clonar a página irmã mais próxima (ex. `500-seguidores-por-1-real/page.tsx`) como template.
3. Escrever a versão enjai à mão (master verificado). Para portuga/skipark: subagente `general-purpose` clonando a estrutura do enjai e reescrevendo TODO texto legível 100% original (regra SEO: nunca duplicar conteúdo entre sites) — trocar SITE_URL + marca, manter JSX/classes/slugs/multiplicadores/links.
4. Validar: `npx tsc --noEmit` em enjai+portuga (skipark não tem node_modules local → valida no build da VPS). Conferir sem vazamento de "ENJAI" nos outros + H1 intro único.
   - ⚠️ **NÃO usar aspas duplas `"` literais em TEXTO JSX** (ex. `<h2>A verdade sobre "verified"</h2>`, `<th>"Premium"</th>`): o build do **enjai/portuga** roda ESLint e falha em `react/no-unescaped-entities` (`Failed to compile`, deploy aborta na linha do `next build`). Aspas dentro de STRING literal (metadata, faqs, avaliacoes) são OK — o erro é só em children de JSX. O **skipark** tem eslint mais brando e passa mesmo assim (por isso pode subir só ele). Correção: usar aspas simples/curvas ou reescrever sem aspas; ou, rápido e uniforme, prepender `/* eslint-disable react/no-unescaped-entities */` na 1ª linha do arquivo. `tsc --noEmit` NÃO pega isso (é regra ESLint, não TS) — validar com `npx next lint --file <arquivo>`.
5. OG image: gerar via Runware (1216x640 WEBP, "no text, professional, high quality"), salvar em `public/og/<slug>.webp` nos 3.
6. SEO — 2 ajustes obrigatórios (senão página fica órfã): (a) adicionar linha no `app/sitemap.ts` (lista MANUAL, inserir após a linha da página irmã); (b) adicionar link de entrada no "Veja também" da página irmã.
7. Deploy — ver [[feedback_deploy]] e abaixo.

**Deploy dos 3 (fluxo de transferência):** os repos locais NÃO são a fonte de produção. Colocar arquivos na VPS via base64 e rodar o script de deploy:
- **enjai/portuga** (servidor `hostinger-vps-srv1166087`, [[project_migracao_enjai_srv1166087]]): `/var/www/<site>` NÃO é git; colocar os arquivos lá e rodar `/root/deploy-<site>.sh` (build em staging `/var/www/<site>-build` + swap atômico .next + pm2 reload; enjai 3024/3025, zero-downtime). Rodar enjai e portuga em SEQUÊNCIA (mesmo servidor).
- **skipark** (opengravity, `/var/www/skipark`, [[reference_deploy_skipark]]): git commit local (push é read-only) + `bash /root/deploy-skipark.sh` (usa working tree).
- Transferir: `base64 -w0 localfile | ssh HOST 'base64 -d > "/var/www/.../page.tsx"'` (aspas por causa dos parênteses em `(loja)`).
- ⚠️ **Bug do swap corrigido 2026-07-19:** `deploy-enjai.sh`/`deploy-portuga.sh` tinham swap frágil (`cp -a $BUILD/.next $LIVE/.next` para dentro de um `.next` que sobrou → merge inconsistente → site 500 intermitente, ex.: `cp: cannot create directory '.next/server/app': File exists`). Blindado p/ rename-based: copia `$BUILD/.next`→`$LIVE/.next.new`, depois `mv .next .next.old; mv .next.new .next`. Backup em `/root/deploy-*.sh.bak-2026-07-19`. Se um deploy falhar no swap mas o build estiver OK (`/var/www/enjai-build/.next` com BUILD_ID), o conserto manual é: `cp -a /var/www/enjai-build/.next .next.new && mv .next .next.broken && mv .next.new .next && pm2 reload enjai enjai-b && rm -rf .next.broken .next.old`.
- Verificar: `curl` → 200 nas 3 URLs + `grep` no HTML por `<h1>`, `"Product"`, `FAQPage`, canonical, og:image.

**Mapa do site HTML (2026-07-26, nos 3):** `/mapa-do-site` (`app/(loja)/mapa-do-site/page.tsx`) + link "Mapa do site" no `components/shared/Footer.tsx` (coluna Institucional, após Blog). Lista grupos de landing pages (âncora descritiva) + categorias/produtos/artigos do DB. Objetivo SEO: HTML sitemap distribui autoridade e ajuda indexação (≠ XML, que é só feed). **Usei tokens PORTÁVEIS** (`var(--text)`, `var(--muted)`, `var(--brand-soft)`, `var(--hairline)`) em vez de `nb-*` — porque o **skipark é tema ESCURO** (`body: background aurora-ink #0B0F1A; color aurora-text #F5F5F7`) e remapeia nb-*/bg-white via overrides em `globals.css`; páginas novas cross-site renderizam mais seguras com os tokens `var(--*)` (mesmos do footer) do que com classes `nb-*`/`bg-white` do design claro do enjai.

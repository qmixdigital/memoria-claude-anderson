---
name: danfe-platform-status
description: Projeto danfe-platform — estado do produto e do deploy de teste
metadata: 
  node_type: memory
  type: project
  originSessionId: c1138f6b-88c5-4ef8-b27b-418633899c6b
---

Projeto `d:\SITES\danfe` (danfe-platform): SaaS de consulta/ferramentas DANFE/NF-e. Monorepo Bun (git local, sem remote). Decisão tomada: **pivotou da Camada A (scraping) pro produto defensável** (DANFE grátis + SEO + futura Camada C). Ver [[danfe-camada-a-captcha]] pro porquê.

Estrutura: `packages/danfe` (XML->DANFE PDF via nfe-danfe-pdf/pdfkit), `packages/sefaz` (validação de chave 44 díg mód-11 + coletor Camada A parado), `apps/web` (Next.js 15 App Router).

**apps/web (produto "DanfeMax", no ar):** gerador DANFE/DANFCE grátis (`/gerar-danfe`, `/gerar-danfce`, API `/api/danfe` runtime node), validador chave offline (`/validar-nfe`), XML->Excel (`/converter-xml-excel`, exceljs), validar/consultar CPF/CNPJ (BrasilAPI + cache disco), calc DIFAL e MEI, institucionais, sitemap (17 urls)/robots, SEO+JSON-LD (sem FAQPage), mapa-do-site HTML. Banner LGPD (`components/Consent.tsx`) + GA4 carregado só após consentimento (lê `SITE.ga4Id`). Build com bun local; pdfkit/nfe-danfe-pdf/exceljs = serverExternalPackages (senão quebra .afm). Local: `cd apps/web && bun run dev` (3010).

**PRODUÇÃO NO AR (2026-06-30): https://danfemax.com.br** — canonical é o **APEX (sem-www)**; www faz 301→apex. `SITE.url="https://danfemax.com.br"` (fonte única: canonical/sitemap/robots/schema/OG puxam dela). Escolha www vs sem-www é SEO-neutra (Google consolida via 301+canonical); ficou sem-www por marca mais curta e domínio ainda não indexado. Zona Cloudflare na **conta27** (zone id `7688405041d34e927ae0849719bd98b8`, token no contas.json), A apex+www→31.97.173.40 proxied, SSL **full**, always_use_https on. Cloudflare injeta um "Managed robots.txt" (bloqueia bots de IA, search=yes p/ Google).

**VPS srv1166087 / 31.97.173.40 (alias ssh `hostinger-vps-srv1166087`, root, HestiaCP):**
- App em `/opt/danfe` (monorepo). **Sem bun na VPS** — node v18 + npm; build feito com `npm run build` em `/opt/danfe/apps/web`.
- PM2: `danfe-web` (3900) + `danfe-web-b` (3901), pm2 save feito. Reload zero-downtime: um de cada vez.
- nginx: `/etc/nginx/conf.d/danfemax.conf` (apex→www 301, www proxy upstream `danfe_backend` 3900/3901) + `danfe.conf` (subdomínio teste danfe.dominioprovisorio.net.br ainda ativo). Cert origin **self-signed** em `/etc/ssl/portais/danfemax.com.br/origin.pem` (por isso CF=full, não strict).
- **Fluxo de deploy**: `tar --exclude node_modules/.next/.git -czf` do source local → `cat | ssh ... 'cd /opt/danfe && tar -xzf - && cd apps/web && npm run build && pm2 reload danfe-web && sleep 2 && pm2 reload danfe-web-b'`.

CWV (lab CDP mobile, 2026-06-30): LCP 260ms, CLS 0.000, FCP 260ms.

**GA4 ATIVO**: `SITE.ga4Id="G-3KFB7JJ4TD"`, carregado só após consentimento (testado no ar: 0 requests antes de aceitar, dispara gtag+collect depois). Search Console: usuário fez sozinho, canonical apex confirmado pelo Google (2026-06-30).

Pendências: **AdSense** (SITE.adsenseClient vazio, CSP ainda NÃO libera googlesyndication — adiado até ter tráfego). **AI Labyrinth** do Cloudflare sugerido (opcional, low; toggle só no painel, API não expõe confiável; já protegido por ai_bots_protection=block). Expansão SEO programático futura.

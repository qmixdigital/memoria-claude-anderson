# setorenergetico.com.br — onde está e qual é o formato

> Documento de referência rápida. Atualizado em 2026-06-08.

## O que é
Portal de notícias **+ diretório de empresas do setor de energia** brasileiro
(solar, eólica, hidrelétrica, gás, petróleo, biomassa, transição energética).
Fase 2 = diretório de prestadores (cruza ANEEL + Receita Federal, selo `verificada`).

## ONDE ESTÁ AGORA (site ao vivo)
- **Formato:** app **Next.js 16** (App Router, React 19, TS, Tailwind v4) + **Drizzle ORM + PostgreSQL 16** (local) + CMS próprio (editor TipTap, auth `iron-session`/`argon2`).
- **Servidor:** VPS **opengravity** (`ssh opengravity`, 77.37.69.175).
- **Pasta:** `/var/www/setorenergetico`
- **Processo:** PM2 `setorenergetico` (id 22), `next start` na **porta 3015** (`ecosystem.config.js`).
- **DNS:** Cloudflare → opengravity. **X-Powered-By: Next.js**.
- **Conteúdo:** tabela `noticias` no Postgres (categorias em `categorias`, autores em `autores`). DB url no `.env.local` (root lê). Imagens em `public/uploads/` (servidas pelo Next; `next start` lê a pasta no boot, então **arquivo novo só aparece após `pm2 restart setorenergetico`**).
- **Docs internas do app:** `DOCUMENTACAO.md`, `DIRETORIO.md`, `DEPLOY.md`, `CLAUDE.md` na raiz do projeto.

## Como publicar um artigo (receptor WP-compatível, estilo Antônio)
`POST http://127.0.0.1:3015/api/qmix/noticias` (na VPS) com header `X-API-KEY: <QMIX_API_KEY do .env.local>`.
Body JSON: `title`, `content` (HTML; sanitizado por DOMPurify — `<script>` é removido, `<a>/<table>/class` passam, links ficam **dofollow**), `categories` (slug, ex. `["energia"]` — lista em `src/site.config.ts`), `author` (UUID de `autores` ou índice), `tags[]`, `resumo`, `seo_title`, `seo_description`, `image_base64` (vira AVIF 1200x630), `status:"publish"`.
Resposta 201 `{post_id, slug, url}`. URL pública = `https://setorenergetico.com.br/<slug>/` (com barra; sem barra dá 308).

## WordPress ANTIGO (descontinuado)
- Ficava na hospedagem **anderson** (`ssh hostinger-anderson-gna`), addon domain em `/home/u400588174/domains/setorenergetico.com.br`.
- **ELIMINADO em 2026-06-08:** banco `u400588174_GJd7P` (DROP DATABASE) + 2,1 G de arquivos removidos.
- **Backup final:** `wp-antigo-backup-final-2026-06-08.sql.gz` (nesta pasta, 32,5 MB, 190 tabelas).
- ⚠️ **Painel (pendente, manual):** o addon domain `setorenergetico.com.br` ainda pode estar listado no hPanel da conta anderson. Remover em: hPanel → Hospedagem (conta u400588174) → Sites/Domínios → `setorenergetico.com.br` → Remover. Conferir também em MySQL Databases se o usuário `u400588174_JbOcr` continua órfão.

## Regra
Mexeu/atualizou algo do site → atualizar este README. **NUNCA** mexer no WordPress da anderson achando que afeta a live (ele não existe mais; a live é o Next na opengravity).

## Ferramentas (lead-gen / tráfego SEO) — criadas 2026-06-08
Rotas em `src/app/(public)/ferramentas/` (cada uma = page.tsx server + componente client + SEO/schema). Hub: `/ferramentas/`.
1. `/ferramentas/calculadora-energia-solar/` — placas, geração, economia, payback (kw "calculadora/cálculo de energia solar").
2. `/ferramentas/calculadora-consumo-energia/` — kWh/R$ por aparelho (kw "consumo de energia").
3. `/ferramentas/calculadora-gerador-energia/` — dimensiona gerador em kVA.
4. `/ferramentas/bandeira-tarifaria/` — acréscimo por bandeira.
5. `/ferramentas/tarifa-social-energia/` — verificador de elegibilidade (Lei 15.235/2025).
Deploy: editar arquivos na VPS → `pnpm build` → `pm2 restart setorenergetico`. Adicionar rota nova ao `src/app/sitemap.ts`.
⚠️ **MANUTENÇÃO MENSAL:** a bandeira vigente é a constante `VIGENTE`/`VIGENTE_REF` em `bandeira-tarifaria/BandeiraCalc.tsx` — a ANEEL anuncia no fim de cada mês; atualizar todo início de mês. Hoje: Amarela (mai/2026).

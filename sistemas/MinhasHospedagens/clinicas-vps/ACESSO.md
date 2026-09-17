# clinicas-vps — VPS Hostinger (HestiaCP)

Servidor que hospeda apps **Next.js** de diretório/conteúdo da rede (não é WordPress).

## Acesso

| Item | Valor |
|------|-------|
| Alias SSH | `ssh clinicas-vps` |
| IP | `31.97.162.199` (IPv6 `2a02:4780:14:82ae::1`) |
| Hostname | `srv984283.hstgr.cloud` (instance `hvps-740d22ea72688688`) |
| **Conta Hostinger** | **cesarwalsh097@gmail.com** |
| **Vencimento** | **30/08/2027** |
| Plano | KVM 2 — 2 vCPU (EPYC 7543P), 8 GB RAM, 96 GB disco; provisionada em 19/08/2025 |
| Painel | HestiaCP (usuários `user` e `consultaplacabrasil`; domínios `desentupidora.pro` e `consultaplacabrasil.com`) |
| Process manager | **PM2** (daemon do `root`, `PM2_HOME=/root/.pm2`, v6.0.14) |

> 🔴 **O `pm2 restart` por SSH não-interativo NÃO REINICIA, e não avisa.** Ele
> fala com um daemon novo (PM2_HOME errado), não encontra a app, sai com
> código 0 e o processo antigo continua no ar. Em 30/08/2026 isso custou o
> radarvolt no ar por meia hora servindo HTML de um build antigo, com os
> chunks daquele build já apagados do disco: o visitante via
> *"Application error: a client-side exception has occurred"*.
>
> **Conferir pela porta não serve como prova**, e foi o que me enganou: a
> porta respondia 200 porque o processo VELHO estava respondendo. O que prova
> é o **PID mudar**:
>
> ```bash
> export PM2_HOME=/root/.pm2
> PM2=/root/.nvm/versions/node/$(ls /root/.nvm/versions/node | head -1)/bin/pm2
> antes=$(ss -lptn "sport = :3080" | grep -oP 'pid=\K[0-9]+' | head -1)
> $PM2 restart radarvolt-web --update-env
> depois=$(ss -lptn "sport = :3080" | grep -oP 'pid=\K[0-9]+' | head -1)
> [ "$antes" != "$depois" ] || echo "NAO REINICIOU"
> ```
>
> 🔴 **E não construa no lugar (`bun run build` dentro de `app/`).** Cada
> projeto aqui tem `deploy.sh` que constrói em `app-build` e faz troca
> atômica por `mv`, justamente para os processos no ar não verem um `.next`
> pela metade e para os chunks antigos não sumirem debaixo de quem está com
> a página aberta. Foi ignorar isso que criou o incidente acima.

> ⚠️ **Gotcha do PM2:** em SSH **não-interativo** o `pm2 ls/jlist` vem **vazio** (sobe um daemon novo com PM2_HOME errado). Use sessão interativa, ou `bash -lc`, ou caminho completo do binário. O daemon real (com as apps) é o que roda como `root` em `/root/.pm2`. Nome das apps confirma-se pelos logs em `/root/.pm2/logs/`.

## Portais convertidos de WordPress (portal-engine)

Além dos apps Next.js abaixo, esta VPS hospeda os portais que **deixaram de ser
WordPress**. Motor, caminhos e operação em [portal-engine.md](portal-engine.md).

| Portal | Ficha |
|--------|-------|
| boxnoticias.net | [boxnoticias.net.md](boxnoticias.net.md) |
| agencianacionaldenoticias.com | [agencianacionaldenoticias.com.md](agencianacionaldenoticias.com.md) |
| barranews.com.br | [barranews.com.br.md](barranews.com.br.md) |

Índice geral de migrações: [`../SITES-MIGRADOS.md`](../SITES-MIGRADOS.md).

---

## Apps neste servidor (PM2)

Todos rodam em **par** (`nome` e `nome-b`) atrás de um upstream do nginx, para
deploy sem downtime. Lista conferida em 30/08/2026.

| App | Portas | Observação |
|-----|--------|-----------|
| `recibos-web` | — | |
| `calistenia-web` | 3020/3021 | calistenia.ia.br |
| `desentupidora-pro` | 3008/3009 | diretório desentupidoras (ver abaixo) |
| `vidracarias-web` | — | |
| `marmorarias-web` | 3040/3041 | marmorarias (preview em dominioprovisorio) |
| `plano-web` | — | |
| `ortoguia-web` | — | |
| `pixelgap-web` | — | |
| `checkoutpixel-app-web` | 3072/3073 | app Shopify |
| `checkoutpixel-web` | 3070/3071 | site |
| `radarvolt-web` | — | |
| `saudevit-web` | 3090/3091 | |
| **`academus-web`** | **3100/3101** | **academus.pro.br** — ficha em [academus.pro.br.md](academus.pro.br.md) |
| `sitegratis-web` | — | |
| `institutoortopedico` | 3050/3051 | preview |

Mexer **somente** no app alvo. Nginx do Hestia faz o proxy por domínio.

---

## desentupidora.pro

Diretório nacional de desentupidoras (dados da Receita Federal por CNAE). **Mesma engine/template do setorenergetico** (Next 16 + Drizzle/Postgres + pnpm).

| Item | Valor |
|------|-------|
| Domínio | https://desentupidora.pro (atrás do **Cloudflare**, proxied) |
| App dir | `/home/user/web/desentupidora.pro/app` |
| PM2 | app `desentupidora-pro`, **porta 3008** |
| Stack | Next.js 16 (App Router) + React 19 + Tailwind v4 + Drizzle ORM + PostgreSQL 16 + iron-session/argon2 + Resend + Asaas (billing) |
| Banco | Postgres local; `DATABASE_URL` no `.env.local` do app |
| Backup DB | cron diário 3h30 → `/home/qmix/backup-pg-desentupidora.sh` → `/home/qmix/backups/postgres-desentupidora/` |
| SSL | HestiaCP (`/home/user/conf/web/desentupidora.pro/ssl/`) |
| Dados | **42.012 empresas** ativas, 28 UFs, 2.869 cidades, 10 serviços, 140 notícias (jun/2026) |

### Deploy / restart (instância única — reload tem blip de ~1-2s)

> ⚠️ `node`/`pnpm`/`pm2` NÃO estão no PATH não-interativo. Usar o node do nvm (v20.20.2, o mesmo que o PM2 roda) e o PM2_HOME do root:

```bash
ssh clinicas-vps
export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH HOME=/root PM2_HOME=/root/.pm2
cd /home/user/web/desentupidora.pro/app
pnpm build                                   # valida tipos; se falhar, o app no ar fica intacto
pm2 reload desentupidora-pro                 # serve o novo .next
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3008/   # 200 = ok
```

> **NÃO é repo git** (o `git remote` é vazio) — o servidor é a fonte da verdade; editar arquivos direto no servidor (não há `git pull` que sobrescreva). Backup dos diffs de 2026-06-10 em `desentupidora-src-ajustes-2026-06-10/`.
> ⚠️ Faça backup do DB (`bash /home/qmix/backup-pg-desentupidora.sh`) antes de qualquer ajuste que toque dados.

### ⚠️ Docs DENTRO do repo estão DESATUALIZADAS (cópias do setorenergetico)
`DEPLOY.md`, `DIRETORIO.md`, `ecosystem.config.js` (e parte do `README.md`) foram copiados do setorenergetico — citam OpenGravity, porta 3015/3020, path `/var/www/...`, pipeline ANEEL/energia. **NÃO seguir.** A realidade é a tabela acima (clinicas-vps, `/home/user/web/...`, porta 3008).

### ✅ Ajustes de qualidade FEITOS (2026-06-10)
Camada de display (sem mutar o banco — reversível). Helpers em `src/lib/empresas/utils.ts`:
- **`cidadeLabel(cidade, uf)`** — re-acentua cidade via mapa oficial do IBGE (`src/lib/empresas/municipios-ibge.ts`, 5.570 municípios). "Sao Paulo"→São Paulo, "Abadia De Goias"→Abadia de Goiás (conectores minúsculos). Aplicado em página de cidade/estado, empresa, listagens, home, autocomplete.
- **`tituloEmpresa(nome)`** — Title-Case de nome CAIXA ALTA, trata siglas (Ltda/ME/S.A.), remove fragmento de CNPJ de MEI ("49.071.605 FULANO"→Fulano) e pontuação residual. Aplicado em todos os displays + pins do mapa (formatado no servidor, client não importa o mapa IBGE).
- **Schema CollectionPage + ItemList** adicionado nas páginas de cidade e estado (antes só Breadcrumb).
- **Títulos das 42k empresas** reescritos: o `meta_title` salvo era auto-gerado em CAIXA ALTA/de-acentuado e 0 empresas são curadas → agora gera "Nome — Desentupidora em Cidade (UF)" (só usa `meta_title` salvo se a empresa for reivindicada/`owner_user_id`).
- **`next.config.ts`** — removido redirect de artigo de futebol herdado do setorenergetico (mantidos os redirects de canonical de artigo e o rewrite `sistema-qmix` que é funcional).
- **`ecosystem.config.js`** — corrigido pra realidade (cwd `/home/user/web/...`, porta 3008, `next start`).

### ✅ SEO — Fase 1 FEITA (2026-06-10): páginas de diretório enriquecidas
Componente reutilizável `src/components/seo/FaqSection.tsx` (FAQ visível + JSON-LD FAQPage) + helper `estadoComPrep`/`UF_PREP` (pt-BR natural: "de São Paulo", "do Rio de Janeiro", "da Bahia").
- **Páginas de cidade** (1.591+): intro única por dados reais (contagem/segmentos/estado), **FAQ com schema FAQPage** (4 perguntas variando por cidade — featured snippets), **linkagem interna** com 12 cidades próximas (âncora "Desentupidoras em [cidade]"), meta description rica. Schema: CollectionPage + ItemList + LocalBusiness + FAQPage + BreadcrumbList.
- **Páginas de estado** (27): intro + FAQ (3 perguntas) + lista de cidades + schema CollectionPage/ItemList/FAQPage.
- **Páginas de segmento** (4): intro editorial única por segmento (`SEG_INTRO`) + FAQ + schema CollectionPage/ItemList/FAQPage.

### ✅ SEO — Fase 2 FEITA (2026-06-10): páginas de empresa (42k)
As 42k páginas individuais eram magras (só nome/CNPJ/local). Agora:
- **Descrição contextual gerada de dados reais** (varia por empresa): "{Nome} é uma empresa de {segmento} em {cidade}, {estado}, em atividade desde {ano}. Atua com {serviços}… CNPJ {x}, verificada na Receita Federal." Ignora a coluna `descricao` salva (auto-gerada CNAE/de-acentuada) — só usa texto salvo se a empresa for reivindicada (`owner_user_id`). Mesma regra na meta description e no título.
- **Seção "Serviços oferecidos"** por segmento (`SEG_SERVICOS`: hidrojateamento, limpeza de fossa, caixa de gordura, etc.).
- **FAQ com FAQPage schema** (serviços, localização, contato, CNPJ ativo) — varia por empresa.
- **Linkagem interna**: empresas relacionadas (mesma cidade) + "ver todas as desentupidoras em {cidade}" (âncora-keyword pra página de cidade).
- **Schema upgrade**: Organization → **LocalBusiness** + `areaServed` (City) + `geo` + `knowsAbout` (serviços) + FAQPage.

### ✅ SEO — Fase 3 FEITA (2026-06-10): topic cluster (conteúdo ↔ diretório)
As 140 notícias são how-to no nicho ("Como desentupir vaso sanitário", "Quanto custa desentupir em SP") — ótimas pra cluster.
- **Cidade → guias**: seção "Dicas e guias de desentupimento" nas páginas de cidade, linkando 8 artigos (`getGuiasDesentupimento`, cacheado global 1h). Passa autoridade às notícias.
- **Artigo → diretório**: CTA "Precisa de uma desentupidora?" no fim de todo artigo (`/(public)/[slug]/page.tsx` — o catch-all que renderiza a URL canônica `/{slug}/`, NÃO o `/noticias/[slug]/` que é redirecionado), linkando `/empresas/` e `/empresas/cidades/`. Passa autoridade ao diretório (páginas-dinheiro).
- **CWV (avaliado):** mapa já faz lazy-load do Leaflet (import dentro do useEffect); 4 fontes via next/font com `display:swap`; next/image em 18 arquivos. Estado já razoável.

### ✅ Auditoria SEO + ajustes finais FEITOS (2026-06-10)
- **Meta descriptions** das páginas de cidade/estado/segmento/empresa estavam longas (233-276 chars) → encurtadas p/ 130-155.
- **OG da página de empresa** estava quebrado (og:title=só o nome, og:description=CNAE de-acentuado, sem og:image) → corrigido (título completo + descrição gerada + og:image default).
- **og:url** das páginas de diretório apontava p/ a home → agora cada uma usa a própria canônica (`openGraph.url`).
- **Title >60 chars** em nomes longos → helper `tituloSeo(titulo, marca)` omite o sufixo da marca quando estoura 60 (a keyword fica visível no SERP). Aplicado via `title:{absolute}` nas 4 páginas.
- **Mapa + CWV**: o `MapaEmpresas` (Leaflet) agora só inicializa quando entra no viewport (IntersectionObserver). PORÉM descobri que **0 das 42k empresas têm lat/lng** — o geocoding (Etapa 3 do pipeline, Nominatim/IBGE) NUNCA rodou, então o mapa nunca renderiza em nenhuma página (a seção é condicional a `pinsMapa.length>0`). Não havia problema de performance. O IO fica como future-proof.

### ✅ Geocoding FEITO (2026-06-10): mapas + geo schema
- **BrasilAPI por CEP tinha só ~33% de cobertura** de coordenadas → optei por **centroides de município do IBGE** (dataset kelvins, `centroids.json`) + jitter determinístico por empresa (~2km, estável entre runs) pros pins espalharem no mapa.
- Script `scripts/geocode-centroids.ts` (gera CSV id,lat,lng) + bulk via **psql `\copy` + temp table** (o `unnest(${arr}::text[])` do drizzle estoura o limite de params — bug latente no `update-geo.ts` original também).
- **41.892/42.012 empresas geocodadas** (99,7%; 120 sem match por variação de nome de cidade).
- **Mapa Leaflet renderiza** nas páginas de cidade (até 100 pins espalhados) e empresa (pin único + nota "localização aproximada"); inicializa só no viewport (IntersectionObserver).
- **`geo` (GeoCoordinates) no schema LocalBusiness** das empresas → sinal de SEO local.
- Re-rodar: `CENTROIDS_PATH=/tmp/centroids.json pnpm tsx --env-file=.env.local scripts/geocode-centroids.ts` (só pega empresas sem geo) + bulk psql + rebuild/reload.

### ✅ Geocoding PRECISO sob demanda (pagas/reivindicadas) — preparado (2026-06-10)
A geo base é centroide de cidade (aproximada). Para empresas que valem precisão:
- **Painel já faz** (existia): no PATCH `/api/painel/empresa/[id]`, empresa **paga** (plan.tier≠free) que troca o CEP é geocodada via `geocodarPorCep` (BrasilAPI) → lat/lng do endereço real.
- **Script `scripts/geocode-precise.ts`** (novo): geocoda em lote as pagas/reivindicadas (ou uma por `--slug=`). Testado OK (decond: centroide → endereço real). Rate-limited 150ms. Idempotente.
  - `pnpm tsx --env-file=.env.local scripts/geocode-precise.ts` (todas pagas/reivindicadas) ou `... -- --slug=empresa`.
- **Nota no mapa** da empresa: "Localização de {cidade}" quando paga (precisa); "Localização aproximada (nível de cidade)" caso contrário.
- Cobertura BrasilAPI por CEP é ~33% — empresas cujo CEP não tem coords ficam no centroide (sem erro).

### Pendências / próximos passos (opcional)
- Painel/admin (privados, noindex) ainda mostram nome cru — baixa prioridade.
- Intro/FAQ nos índices `/empresas/cidades/` e `/empresas/segmentos/` (2 páginas).
- Obs: regenerar `descricao`/`meta_*` no banco é desnecessário — o display ignora o auto-gerado ruim e monta tudo on-the-fly.

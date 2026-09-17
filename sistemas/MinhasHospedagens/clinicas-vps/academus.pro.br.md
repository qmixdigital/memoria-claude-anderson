# academus.pro.br

Diretório nacional de **onde estudar e se formar na área da saúde** (faculdades,
cursos técnicos, pós-graduação e cursos livres) com uma revista editorial de
carreira/saúde. Next.js 15 + Prisma + PostgreSQL, servido pela **clinicas-vps**
atrás do Cloudflare.

Documentado em 30/08/2026. Não havia ficha deste site na pasta; ele foi
localizado pelo `server_name` do nginx da clinicas-vps.

---

## Identificação

| Item | Valor |
|------|-------|
| Domínio de produção | https://academus.pro.br (e `www.`) |
| Domínio de preview | `academus.dominioprovisorio.net.br` (mesmo vhost, mesmo app) |
| Servidor | **clinicas-vps** — `ssh clinicas-vps` — `31.97.162.199` (Hostinger KVM 2, HestiaCP) |
| Conta Hostinger | cesarwalsh097@gmail.com (VPS vence 30/08/2027) |
| DNS | **Cloudflare** (NS `boyd.ns.cloudflare.com`, `isabel.ns.cloudflare.com`), proxied |
| Registro | `.pro.br` → Registro.br |
| Operador legal (rodapé e `/sobre`) | BYTX LTDA, CNPJ 65.649.904/0001-98, Campinas/SP, contato@academus.pro.br |
| GA4 | `G-F3KF4T7NL0` (Consent Mode v2, tudo negado por padrão) |
| AdSense | **não configurado** (slots existem no código, env vazio, não renderizam) |
| Em produção desde | 26/08/2026 (build atual de 27/08/2026 21:47) |

## Caminhos no servidor

| Item | Caminho |
|------|---------|
| App em produção | `/home/user/web/academus.dominioprovisorio.net.br/app` |
| Release anterior (rollback) | `.../app-prev` |
| Árvore de build do deploy | `.../app-build` |
| Persistente entre releases | `.../app-shared` — guarda o `.env` e `storage/blog-covers/` |
| `.env` | symlink `app/.env` → `../app-shared/.env` |
| Vhost nginx | `/home/user/conf/web/academus.dominioprovisorio.net.br/nginx*.conf` (gerado pelo Hestia) |
| Upstream nginx | `/etc/nginx/conf.d/00-academus-upstream.conf` (**fora** do Hestia, de propósito) |
| SSL | `/home/user/conf/web/academus.dominioprovisorio.net.br/ssl/` (HestiaCP, Let's Encrypt) |
| Logs PM2 | `/root/.pm2/logs/academus-web*.log` |
| Cópia local do fonte | `d:\SITES\academus\app` (puxada em 30/08/2026; **não existe git em lugar nenhum**) |

## Acessos e segredos

Todos vivem em `app-shared/.env`; o diretório do app não tem `.env` próprio, só o
symlink.

| Chave | Valor |
|-------|-------|
| `DATABASE_URL` | `<<REMOVIDO>> |
| `ADMIN_KEY` | `<<REMOVIDO>>` — é a **senha do `/admin`** |
| `ANTONIO_API_KEY` | `<<REMOVIDO>>` — receptor de artigos da rede (Antônio) |
| `NEXT_PUBLIC_GA_ID` | `G-F3KF4T7NL0` |
| `ASAAS_API_KEY` | chave **de produção** já gravada (`$aact_prod_...`), fase 2 do perfil verificado, sem checkout ativo |

- **Painel admin:** https://academus.pro.br/admin — a senha é o `ADMIN_KEY`. O login
  grava cookie com HMAC (nunca a chave crua) e tem limite de 5 tentativas por 15
  minutos por IP.
- **Painel da instituição:** https://academus.pro.br/painel-instituicao — acesso da
  própria instituição depois de reivindicar o perfil em `/reivindicar`.

## Processo (PM2) e nginx

Padrão de zero downtime da rede: **duas instâncias em fork mode** atrás de um
upstream do nginx.

| App PM2 | Porta |
|---------|-------|
| `academus-web` | 3100 |
| `academus-web-b` | 3101 |

```
upstream academus_backend {
    server 127.0.0.1:3100 max_fails=0;
    server 127.0.0.1:3101 max_fails=0;
    keepalive 16;
}
```

`max_fails=0` é proposital: com o padrão, a instância que está reiniciando no
deploy é ejetada e o deploy vira 502. O failover fica por conta do
`proxy_next_upstream`.

O upstream mora em `/etc/nginx/conf.d/` e **não** no conf do domínio porque o
HestiaCP reescreve o conf do domínio a cada rebuild, e isso já derrubou outros
sites desta VPS.

> **Gotcha do PM2 nesta VPS:** em SSH não interativo o `pm2 ls` vem vazio (sobe um
> daemon novo com `PM2_HOME` errado). Usar o binário completo:
> `PM2_HOME=/root/.pm2 /root/.nvm/versions/node/v20.20.2/bin/pm2 list`

## Deploy

Script pronto em `app/scripts/deploy.sh`, roda como root.

```bash
# 1. subir a árvore nova para .../app-build
# 2. deploy: npm install, prisma generate, prisma db push, next build,
#    troca atômica (app -> app-prev, app-build -> app) e restart em rolagem
ssh clinicas-vps '/home/user/web/academus.dominioprovisorio.net.br/app/scripts/deploy.sh'

# rollback: volta o app-prev
ssh clinicas-vps '/home/user/web/academus.dominioprovisorio.net.br/app/scripts/deploy.sh --rollback'
```

O script reinicia **uma instância por vez** e só passa para a segunda depois de
receber 200 na porta (até 40 tentativas). Se não receber, aborta.

Para ajuste pequeno não existe atalho: é Next.js, precisa de `npm run build`.
Rebuild no lugar funciona, mas perde o rollback:

```bash
ssh clinicas-vps 'cd /home/user/web/academus.dominioprovisorio.net.br/app && \
  export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && npm run build && \
  PM2_HOME=/root/.pm2 pm2 reload academus-web && PM2_HOME=/root/.pm2 pm2 reload academus-web-b'
```

Depois do deploy, purgar a Cloudflare da zona `academus.pro.br`.

## Stack

Next.js **15.1.9** (App Router), React 19, TypeScript 5.7, Prisma 6, PostgreSQL
local, Node 20.20.2 (nvm do root). CSS próprio, sem Tailwind. Sem Payload, sem
WordPress.

O `next.config.ts` já entrega CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` e
`Permissions-Policy` no próprio app. Por isso o header aparece duplicado na
resposta: o nginx do Hestia manda o dele também.

## Banco de dados

Postgres local, banco `academus`, usuário `academus`. **47 MB** em 30/08/2026.

| Tabela | Linhas | O que é |
|--------|-------:|---------|
| `instituicoes` | 35.395 | base do diretório (Receita Federal por CNAE de educação, cruzada com e-MEC e SISTEC/INEP) |
| `ofertas_curso` | 79.650 | curso ofertado por instituição, com modalidade |
| `municipios` | 5.571 | IBGE |
| `cursos` | 35 | 15 superiores, 14 técnicos, 6 livres |
| `ufs` | 28 | 27 estados mais agregador |
| `artigos` | 21 | revista e blog |
| `reivindicacoes` | 1 | pedidos de posse de perfil |
| `perfis_verificados` | 1 | perfil pago (Asaas), com `ativo_ate`, logo, WhatsApp, site |
| `leads` / `mensagens` / `rate_limits` | 0 / 0 / — | formulários e limitação de taxa |

Instituições por tipo: FACULDADE 14.096, TECNICO 11.895, LIVRE 7.494, POS 1.910.

Importadores em `app/scripts/` (`import-instituicoes`, `import-emec`,
`import-sistec`, `import-artigos`, `seed-cursos`); CSVs de origem em `app/dados/`
(cerca de 13 MB, ficam só no servidor).

> **Pendência real: o banco do academus não tem backup.** O cron das 3h cobre só o
> `clinicas_db` e o das 3h30 só o desentupidora. Falta criar um
> `backup-pg-academus.sh` no mesmo molde.

## Estrutura de URLs

```
/                             home
/faculdades/[curso]           /[uf]  /[uf]/[cidade]     15 cursos superiores
/cursos-tecnicos/[curso]      /[uf]  /[uf]/[cidade]     14 cursos técnicos
/pos-graduacao/[area]/[uf]
/faculdades                   hub de nível (CollectionPage + ItemList)
/cursos-tecnicos              hub de nível
/pos-graduacao                hub de nível, noindex enquanto sem dados
/instituicao/[slug]           ficha da instituição (35.395; só 5.718 indexáveis)
/busca                        busca interna
/blog                         revista de carreira e escolha de curso
/saude/ortopedia/[slug]       revista de saúde (recebe artigos do Antônio)
/[slug]                       catch-all de páginas
/sobre  /contato  /anuncie  /reivindicar  /privacidade  /termos
/admin  /admin/{artigos,instituicoes,ofertas,mensagens,reivindicacoes,config}
/painel-instituicao
```

Índice de sitemap em `/sitemap.xml` com quatro filhos, todos por rota dinâmica:

| Sitemap | URLs |
|---------|-----:|
| `/sitemap-instituicoes.xml` | 5.718 (era 35.395; ver auditoria) |
| `/sitemap-faculdades.xml` | 6.088 |
| `/sitemap-tecnicos.xml` | 1.073 |
| `/sitemap-paginas.xml` | 44 |

O `robots.txt` libera tudo e aponta o sitemap. A indexação é **condicional por
host**: o domínio de preview não indexa.

## Conteúdo editorial

21 artigos publicados, capas em `app-shared/storage/blog-covers/` (persistem entre
releases). Categorias: Guia de curso (6), Carreira (6), Como ingressar (5), EAD e
modalidades (4).

A trilha `/saude/ortopedia` existe e está **vazia**: é o destino dos artigos da
rede (categoria `ortopedia`, com os campos `tem_backlink`, `link_diretorio` e
`grupo_auditoria`). Regra de ouro escrita no próprio código: **nunca mexer em
âncora e link externo de artigo do Antônio**, o `conteudo_html` é gravado como veio.

## SEO

- Plano de palavras-chave em `app/academus-keyword-plan.md` (cópia local em
  `d:\SITES\academus\app\`), derivado dos 8 CSVs de broad match que estão em
  `d:\SITES\academus\*.csv` (26/08/2026, cerca de 165 mil buscas por mês no tema).
- A intenção dominante é informacional ("quanto tempo dura a faculdade de
  medicina", 2.400 por mês), por isso cada página programática carrega bloco de
  conteúdo mais FAQ, não só a listagem.
- Ruído que **não** deve virar página: piloto de avião, bombeiro civil, teologia,
  estudos bíblicos, dia do estudante.

## Monetização

1. **AdSense**: código pronto (`AdSlot.tsx`, meta e loader), env vazio. Ao ligar,
   lembrar da regra dos dois formatos do publisher ID, `ca-pub-` no `client=` e na
   meta, cru no `ads.txt`.
2. **Perfil verificado** (fase 2): tabela `perfis_verificados` mais Asaas. A chave
   de produção já está no `.env`, o checkout ainda não está ativo.
3. `/anuncie` e captação de `leads`.

## Checagem rápida

```bash
curl -sI https://www.academus.pro.br/ | head -3
ssh clinicas-vps 'for p in 3100 3101; do printf "%s " $p; curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:$p/; done'
ssh clinicas-vps 'PM2_HOME=/root/.pm2 /root/.nvm/versions/node/v20.20.2/bin/pm2 list | grep academus'
```

Estado em 30/08/2026: `/`, `/faculdades/medicina`, `/faculdades/enfermagem/sp`,
`/cursos-tecnicos/enfermagem`, `/blog`, `/busca`, `/admin` e `/painel-instituicao`
todos respondendo 200.

## Home, layout (30/08/2026)

O hero era centralizado (`.acl-hero-in`) com uma gaveta de fichas em rolagem
horizontal logo abaixo. Voltou a ser **split**: texto à esquerda (olho, H1, linha
fina, busca, atalhos e números) e, à direita, um **fichário** com três
instituições reais empilhadas mais o link do diretório. A rolagem horizontal saiu:
o usuário não descobre o gesto.

Três correções de alinhamento entraram junto, e valem para o site inteiro:

- `.acl-hero-grid` usava `padding: 72px 0 64px`, e o atalho zerava as laterais do
  `.acl-wrap`: o hero saía 24px à esquerda das seções de baixo. Agora é
  `padding-block`.
- `--wrap` era 1080px no `.ac-wrap` (cabeçalho e rodapé) contra 1180px no
  `.acl-wrap` (conteúdo). A marca ficava 46px fora do eixo do H1 em **todas** as
  páginas. Os dois agora medem 1180px com 24px de recuo.
- No card de instituição, o selo e o botão eram empilhados e o bloco da direita
  ficava 40px mais alto que o nome, abrindo um vazio no meio do card. Agora ficam
  lado a lado.

No mobile o hero **continua alinhado à esquerda**, divergindo da linha "hero
centralizado no mobile" da tabela do CLAUDE.md: aqui o H1 é seguido direto por um
parágrafo de quatro linhas, que a mesma documentação proíbe centralizar, e
centralizar só o título quebraria o eixo esquerdo de tudo abaixo.

As três primeiras instituições vão para o fichário e as três seguintes para a
seção de comparação, então nenhuma se repete na página.

Os cards da Revista não mostravam capa: a home renderizava o gradiente
`.acl-capa c1|c2|c3`, de antes das capas existirem, e nunca lia `imagemCapa`.
As 21 capas sempre estiveram em `app-shared/storage/blog-covers/` e preenchidas
no banco, e o `/blog` já as usava. Agora a home segue o mesmo padrão.

## Marca (selo)

**Fonte única: `public/icon.svg`**, servido por `components/Selo.tsx` e usado no
cabeçalho e no rodapé. Não recriar o desenho em JSX.

O cabeçalho e o rodapé tinham, cada um, a sua cópia do capelo, e as duas
divergiam do favicon (sem borla). Pior: a placa era pintada com `--ink-strong` e
o capelo tinha `stroke="#fff"` fixo. No tema escuro `--ink-strong` vira
`#F3F0FB`, então a marca virava **capelo branco sobre placa quase branca**, com
o círculo dourado do `::after` vazando pelo canto inferior direito. Era isso que
aparecia no print do Anderson.

Regra que fica: **cor de marca nunca sai de token de tema.** O SVG traz placa
`#4A3FA3`, capelo `#FFFFFF` e borla `#C99A1D` fixos, e o `.acl-selo` no CSS só
cuida do encaixe.

O capelo também era o ícone padrão dos cards de área, e caía no card de Gestão
Hospitalar. Essa área ganhou ícone próprio para o capelo ficar sendo só a marca.

Refinamento pendente, se um dia quiser: dentro do `icon.svg` o conjunto está
13px (de 512) à direita do centro óptico, porque a borla ocupa a direita. Mexer
nisso obriga a regerar `icon-192.png`, `icon-512.png` e `apple-touch-icon.png`
para o conjunto não divergir de novo.

## Auditoria SEO e correções (30/08/2026)

Relatório completo: https://claude.ai/code/artifact/32df1fd2-c90e-4db1-bd30-c09a8738e10e

Seis correções aplicadas e conferidas em produção.

**1. Sitemap afogado em ficha vazia (era o risco de domínio).** Das 35.395 fichas de
instituição, **29.677 (84%) não tinham nenhum curso** e mesmo assim iam para o
sitemap. Eram órfãs: toda listagem cruza com `ofertas_curso`, então ficha sem
curso não aparece em lugar nenhum e só existia no sitemap. A description ainda
prometia "cursos de saúde ofertados" e o corpo dizia "nenhum curso carregado".
Muitas nem eram da saúde: o recorte veio de CNAE de educação em geral.

Correção em `sitemapInstituicoesSlugs` (`ofertas: { some: {} }`) mais `noindex` na
ficha sem oferta. **Critério derivado, nunca flag gravado**: a ficha volta ao
sitemap sozinha quando ganhar a primeira oferta, sem migração de manutenção. O
`oculto` continua servindo ao que ele serve, que é esconder ficha na mão pelo
admin. Sitemap de instituições: **35.395 → 5.718**.

**2. Cidade sem acento em 6.444 títulos.** `nomeCidade()` remontava o nome a
partir do slug: "Faculdade de Enfermagem em Sao Paulo" no title contra "São
Paulo" no H1. Agora lê `municipios.nome` via `getMunicipioNome`; o
`nomeCidadeFallback` em `lib/slug.ts` só entra se o município não for achado.

**3. Fontes bloqueando a renderização.** Três famílias vindas do
fonts.googleapis.com num `<link rel="stylesheet">`. Trocadas por `next/font/google`
no `layout.tsx`, que publica `--fonte-display`, `--fonte-corpo` e `--fonte-mono`,
consumidas pelos tokens que o `globals.css` já usava.

| Métrica (Lighthouse mobile) | Antes | Depois |
|---|---|---|
| FCP | 3,0s | **0,9s** |
| LCP | 3,2s | **1,7s** |
| Desempenho | 86 | **97** |

**4. Hubs de nível não existiam.** `/faculdades`, `/cursos-tecnicos` e
`/pos-graduacao` davam **404**, e por isso o menu apontava para um curso
específico e a página 410 linkava para um 404. Criados via
`components/diretorio/HubNivel.tsx` com `CollectionPage` + `ItemList`. O
`/pos-graduacao` fica **noindex de propósito** enquanto não houver curso de pós
cadastrado, para não repetir em ponto pequeno o erro do item 1. Menu e CTAs da
home repontados para os hubs, com âncora variada por destino.

**5. `/busca` era enviada no sitemap sendo `noindex`.** Contra a regra escrita no
comentário do próprio arquivo. Removida.

**6. Prefixo "Técnico" duplicado nos titles.** Achado durante a conferência, não
na auditoria: "Técnico de **Técnico em** Enfermagem em Paraná". Os 14 cursos
técnicos já trazem "Técnico em" no nome e os três templates somavam o prefixo de
novo. Templates passaram a usar o nome cru.

**Total do sitemap: 42.600 → 12.924 URLs**, todas com conteúdo real.

Armadilha registrada: o `tsconfig` usa `noUncheckedIndexedAccess`, então
`split(":")[0]` é `string | undefined` para o compilador. O primeiro build
falhou por isso no middleware — e falhou **antes** da troca atômica, com o site
intacto, que é exatamente o que o `deploy.sh` promete.

## Simulador de nota de corte do SISU (30/08/2026)

Estudo de viabilidade: https://claude.ai/code/artifact/28290aa3-2914-40b8-ac28-a985b4eb56bb

**Escopo: só cursos da saúde**, dentro do Academus. A base importada cobre todos
os 673 cursos do SISU, mas só os 14 da saúde com histórico suficiente viram
página. Se um dia o escopo abrir, o dado já está no banco.

### Base de dados

| Tabela | Linhas | O que é |
|--------|-------:|---------|
| `sisu_ofertas` | 38.290 | curso + instituição + campus + turno, por ano, 2020 a 2025 |
| `sisu_notas_corte` | 209.822 | nota de corte por oferta e modalidade de concorrência |

Origem: relatórios e API oficiais do MEC. CSVs em `app/dados/sisu/grades{ANO}.csv`
(67 MB, só no servidor). Importador: `scripts/import-sisu.mjs`, upsert idempotente
por `(ano, codigo)`.

> **Nunca importar o `names.csv`** que acompanha essas fontes: são nomes de
> aprovados, dado pessoal, sem finalidade neste produto.

Ligação com o catálogo: 99,9% das ofertas casam com `municipios`; ~725 por ano
casam com os cursos de saúde do catálogo (`curso_id`).

### Decisões de método que sustentam o produto

- **A unidade é a oferta, não o curso.** "Nota de corte de Medicina" não existe;
  existe a de Medicina na UFMG integral em ampla concorrência.
- **O `codigo` do MEC não é estável entre anos.** A série histórica é montada pela
  chave `ies + campus + turno + grau`. Das 9.205 chaves, 3.394 aparecem nos seis
  anos e 5.392 em quatro ou mais.
- **Os pesos por área são obrigatórios.** Cada curso pesa as cinco áreas do ENEM de
  um jeito; sem eles a média calculada está errada e o simulador não significa nada.
- **565 textos distintos de modalidade** entre 2020 e 2025 (cada IES escreve do seu
  jeito, e a lei de cotas mudou em 2023). `classificaModalidade()` reduz a faixas
  comparáveis por eixos: escola pública, recorte racial, deficiência e renda.
- **Previsão é faixa, nunca ponto.** O corte previsto é a mediana das últimas até 4
  edições, e a página sempre mostra o menor e o maior observados. Série cujo dado
  mais recente tem mais de 2 edições de idade é descartada: a oferta pode nem
  existir mais.
- **Deriva anual é pequena**: a mediana de todos os cortes de ampla ficou entre
  639 e 653 nos seis anos, o que valida usar mediana simples sem normalizar por
  percentil do ENEM (que exigiria microdados do INEP).

### Páginas

| Rota | O que é |
|------|---------|
| `/simulador` | formulário GET (funciona sem JS, indexável), 5 notas + curso + modalidade + UF |
| `/nota-de-corte` | hub: os 14 cursos com o corte do ano, mais o texto sobre o que é nota de corte |
| `/nota-de-corte/[curso]` | 14 páginas: série por ano, por modalidade, por estado, FAQ marcado |
| `/nota-de-corte/[curso]/[uf]` | **129 páginas**: corte de cada instituição do estado, série do estado, comparação com a mediana nacional, FAQ |

O hub nasceu de um defeito encontrado na conferência de SEO: o `BreadcrumbList`
de toda página de curso apontava para `/nota-de-corte`, que respondia **404** —
o mesmo erro que `/faculdades` tinha. Ele também ataca "nota de corte" (5.400
buscas/mês, a QueroBolsa em 11º).

Cada `/faculdades/[curso]` passou a linkar para a nota de corte do mesmo curso,
com âncora de keyword. É o link interno mais valioso do módulo: mesmo tema, e a
página de curso já tem autoridade.

Schema: `FAQPage`, `BreadcrumbList` e `Dataset` nas páginas de curso. As 14 mais o
simulador entraram no `sitemap-paginas.xml` (45 → 60 URLs). O simulador ganhou
link no menu do topo e na home, para não nascer órfão.

`estetica-e-cosmetica` ficou de fora: só 6 ofertas, abaixo do piso de 10 de
`MIN_OFERTAS_CURSO`. É a mesma guarda de conteúdo raso do resto do site.

### Revisão de código e teste de carga (30/08/2026)

Teste de carga: 60 requisições, 10 simultâneas, variando curso, modalidade e nota.

| | Antes | Depois |
|---|---|---|
| Transações no banco por requisição | 10 | **4** |
| Tamanho da resposta | 152 KB | **77 KB** |
| Média sob 10 simultâneas | 0,78s | 0,72s |
| Requisição isolada | 0,17s | 0,17s |

**O gargalo não é o banco, é CPU de renderização.** Perfilei as consultas: o
`groupBy` do `cursosComSisu` custava 11,5 ms e o resto era trivial. Durante a
carga a máquina fica com **88% de CPU** (2 vCPU compartilhados com outros 14
apps) e o banco ocioso. Foi por isso que só cachear não adiantou: 11 ms em 780.

O que resolveu de fato foi cortar a lista de 60 para **20 ofertas**, que é o que
governa o custo de render e o tamanho do payload.

Correções aplicadas:

- `cursosComSisu` ganhou `cache` do React (dedup na requisição) mais
  `unstable_cache` do Next (entre requisições, revalidação semanal). O dado muda
  uma vez por ano e rodava em toda requisição.
- Criados `loading.tsx` (esqueleto do simulador) e `error.tsx` (simulador e nota
  de corte). Não existia nenhum no projeto inteiro.
- Lista do simulador de 60 para 20, com aviso de quantas ficaram de fora e
  sugestão de filtrar por estado.

**Armadilha custosa registrada:** um comentário de CSS com `app/*/loading.tsx`
dentro fechou o comentário no `*/` do meio do caminho e quebrou o build inteiro
com `Expected an opening parenthesis`. O erro apontava para a linha 1800 do CSS
compilado, não para a origem. Nunca escrever caminho com `*/` dentro de
comentário CSS.

**Resolvido:** o `as LinhaOferta[]` de `simular()` foi removido e o build passou,
o que prova que o cast era desnecessário e só escondia erro futuro. O tipo agora
vem da inferência do Prisma (`type Linha = (typeof linhas)[number]`).

**Guarda de conteúdo raso na página de estado:** só existe página com **2+
instituições** (`MIN_IES_UF`). Com uma só não há comparação a fazer, que é a razão
de ser da página, e a tabela de estados da página do curso já responde. Por isso
`/nota-de-corte/medicina/ac` responde 404: o Acre só tem a UFAC. `dynamicParams =
false` garante que nenhum par fora da lista gere página.

### Auditoria mobile (30/08/2026)

Medida a 390px com o Chrome em emulação mobile real, não por inspeção do CSS.
Script em `scratchpad/toque.mjs` (mede alvo de toque, vazamento horizontal e
fonte de input via CDP).

**Já estava certo:** nenhum vazamento horizontal em nenhuma página
(`scrollWidth == innerWidth` em todas), e os 8 campos do formulário com fonte
>= 16px, que é o que evita o zoom automático do Safari no iOS ao focar um campo.

**Corrigido:** alvos de toque abaixo de 44px.

| Elemento | Antes | Depois |
|---|---|---|
| Link do cabeçalho de cada card de tabela (ex.: "Goiás") | **42x21** | 44px+ |
| Links de curso do simulador | 19px de altura | etiquetas de 44px |
| Links do rodapé | 22px | 44px |
| Trilha (breadcrumb) | 19px | 40px |
| Lupa do cabeçalho | 42x42 | 44x44 |

O pior era o primeiro: no layout de card do mobile, o link do cabeçalho é o alvo
principal de cada linha, e tinha 21px de altura. A regra usa
`.acl-tab tbody th a { display: block }` com o padding movido do `th` para o `a`,
mais um `:not(:has(a))` para a linha sem link não perder o respiro.

Os links de curso do simulador eram texto corrido separado por `·`. Viraram
etiquetas com borda; o separador ganhou `<i class="acl-sep-ponto">` para sumir no
mobile e não virar ponto solto entre as etiquetas.

**Continuam abaixo de 44px, de propósito:** link dentro de frase corrida (a WCAG
isenta explicitamente, e engordar link no meio de parágrafo estraga a leitura) e
palavra curta no rodapé, onde a altura é 44 e só a largura é menor que isso.

> O skill `mobile-design` é escrito para app nativo (React Native, Flutter,
> SwiftUI) e o script dele procura `FlatList`/`ScrollView`: em site responsivo
> não encontra nada e devolve "0 verificações, PASS". O que transfere é a parte
> de Fitts, zona do polegar e estados de carregamento e erro.

### Linkagem interna para o simulador (30/08/2026)

Auditoria: **12 dos 16 tipos de página não linkavam** para o simulador, e a
âncora "Simular com as minhas notas" estava no template do hub, dos 14 cursos e
dos 129 estados — ou seja, a mesma frase em **144 páginas**, contra o limite de
duas do CLAUDE.md.

A solução para páginas programáticas: **a âncora sai das variáveis da própria
página**, então a variação é automática e cada âncora carrega a keyword do
destino. Componente em `components/diretorio/LinkSimulador.tsx`.

| Origem | Páginas | Âncora |
|--------|--------:|--------|
| `/faculdades/[curso]` | 15 | "Use o simulador do SISU para {curso}" |
| `/faculdades/[curso]/[uf]` | 389 | "Calcule a sua nota do ENEM para {curso} em {estado}" |
| `/faculdades/[curso]/[uf]/[cidade]` | 5.699 | "Simule a nota de corte de {curso} em {cidade}" |
| `/instituicao/[slug]` | **1.603** | "Calculadora do ENEM para {curso}" |
| `/nota-de-corte/[curso]` | 14 | "Calcular minha nota para {curso}" |
| `/nota-de-corte/[curso]/[uf]` | 129 | "Simular {curso} em {estado}" |
| `/nota-de-corte` (hub) | 1 | "Simulador de nota de corte do SISU" |
| home | 1 | "Simular minha nota de corte" |

Conferido em produção: **11 âncoras distintas nas páginas testadas, nenhuma
repetida, um único link por página**.

**Guarda importante:** `LinkSimulador` não renderiza para `nivel !== "SUPERIOR"`
nem para curso sem base no SISU. Página de curso técnico **não** linka para um
simulador do SISU, que só existe para curso superior — seria mandar o leitor para
o lugar errado e sujar o sinal temático da página. Por isso são 1.603 das 5.718
fichas, e não todas.

Dois defeitos achados de passagem e corrigidos: `/nota-de-corte` e
`/nota-de-corte/[curso]` tinham **dois e três links** para o mesmo destino na
mesma página; e o breadcrumb visível de `/nota-de-corte/[curso]` dizia
"Simulador" enquanto o JSON-LD dizia "Nota de corte".

### Linkagem dos artigos (30/08/2026)

O CTA do artigo tinha **a mesma âncora, "Ver onde se formar", nos 21 artigos**,
apontando para 14 destinos diferentes. Defeito pré-existente, não introduzido
agora. O `linkDiretorio` (campo dos artigos da rede) continua mandando no destino;
só o texto passou a ser derivado.

Regras aplicadas em `components/ArtigoView.tsx`:

- **Âncora do diretório** sai do destino: `/faculdades/medicina` vira "Onde estudar
  medicina no Brasil" ou "Ver as faculdades de medicina".
- **Segundo link, destino diferente**, para o simulador ou para a nota de corte,
  escolhido pela categoria do artigo: "Guia de curso" e "EAD" vão para o
  simulador; "Carreira" vai para a nota de corte. Espalha em vez de concentrar.
- **Artigo sobre curso técnico não linka para o simulador do SISU**, que só existe
  para curso superior. O filtro é por `(^|-)(tecnico|tecnologo|auxiliar)(-|$)` no
  slug.
- **Âncora genérica é sorteada de forma determinística** pelo slug do artigo
  (`variante()`): o mesmo artigo mostra sempre o mesmo texto, então o Google não vê
  a âncora mudando a cada build, e 21 artigos não repetem a mesma frase.

Resultado conferido em produção: **34 links com 27 âncoras distintas**, contra 1
âncora antes. **13 dos 21 artigos** agora levam ao simulador ou à nota de corte.

**Uma âncora ainda aparece 3 vezes** ("Simular a nota de corte do SISU"), uma
acima do limite de 2: é colisão do hash sobre 5 artigos da categoria "Como
ingressar". A correção limpa seria sortear pelo `id` do artigo em vez do slug, mas
o `ArtigoViewData` não carrega o id e mudar isso mexe nos dois callers.

Dois erros meus corrigidos no caminho, os dois da mesma família: nome de curso
técnico vindo do catálogo superior ("Técnico em Radiologia (tecnólogo)") e nome
sem acento quando caía no fallback do slug ("estetica e cosmetica"). **Nome
exibido nunca deve sair do slug** — o slug é sem acento por definição.

### Páginas de pontuação do ENEM (30/08/2026)

Keywords trazidas pelo Anderson: "400 pontos no ENEM dá para qual curso"
(**6.600/mês, KD 18**), 500 (1.000), tabela de pontos (720), 900 (590), 700
(480), 300 (390), direito (320), 200 (210), biomedicina (170).

**A sacada:** "X pontos dá para qual curso" é a consulta INVERSA do simulador — a
pessoa tem a nota e quer a lista. Com 209.822 cortes reais isso vira página
programática com dado, não artigo genérico. Rota `/enem/[N]-pontos`, 11 páginas
(400 a 700 de 50 em 50, mais 900).

**O que a base revelou e que muda a resposta:** com 400 pontos, **zero** ofertas
de saúde em ampla concorrência. Mas **em cota há 43 ofertas em 7 cursos**. Ou
seja, a resposta honesta não é "estes cursos" nem "nenhum": é "na ampla não, na
cota sim, e são estes". Nenhum concorrente dá essa resposta, e ela é a que muda a
vida de quem procura.

| Pontos | Ofertas alcançáveis | Cursos |
|-------:|--------------------:|-------:|
| 400 | 43 (só em cota) | 7 |
| 500 | 326 | 13 |
| 700 | 797 | 15 |
| 900 | 835 | 15 |

**Erro grave que cometi e corrigi:** a primeira versão contava linhas de
`sisu_notas_corte`, que são oferta × modalidade × ano, e chamava isso de
"ofertas". Dava **15.001 com 900 pontos**, inflado ~27 vezes, numa página cuja
função inteira é afirmar um número. Agora conta oferta distinta pela chave
`curso+ies+campus+turno`, e os valores batem com consulta SQL independente.

**Fora de escopo, de propósito:** "300 pontos" (390/mês) e "200 pontos" (210) —
abaixo de 400 não há nenhuma oferta de saúde alcançável nem em cota, e a página
seria só uma negativa. "Quantos pontos para direito" (320) não é da saúde.
Cobertos ~9.560 buscas/mês dos ~10.480 enviados.

O hub `/nota-de-corte` passou a atacar "tabela de pontos do ENEM para cada curso"
(720/mês) no H2 — a tabela já existia lá, faltava o rótulo — e linka para as 11
faixas.

### Auditoria de SEO das páginas de pontos (30/08/2026)

**Duplicação quase total no topo da faixa.** Medi a sobreposição de trechos de 5
palavras entre páginas vizinhas: 800 vs 850 deu **79%** e 850 vs 900 deu **81%**.
Acima de 700 pontos a resposta converge para "praticamente tudo" e as páginas
viravam a mesma coisa com outro número no título. **750, 800 e 850 foram
removidas** (nenhuma tinha busca própria) e hoje respondem 404. Restaram 8, e a
maior sobreposição entre vizinhas caiu para **57%**.

**Âncoras genéricas.** O hub linkava com "400 pontos", sem a palavra-chave.
Passou para "400 pontos no ENEM".

**Páginas quase órfãs.** Só o hub linkava para elas. O simulador passou a linkar
para a faixa mais próxima da média simples das cinco notas do candidato, com
âncora que muda junto: quem simula 450 vê "todos os cursos ao alcance de 450
pontos no ENEM", quem simula 890 vê a de 900.

Estado final conferido: **15 links, 15 âncoras distintas, nenhuma repetida**.
Títulos de 58 caracteres, descriptions de 155 a 157, canonicals corretos, nenhum
título duplicado. Schema com `BreadcrumbList` e `FAQPage`, trilha visível
batendo com a estruturada. Lighthouse mobile: **Perf 92, SEO 100, A11y 97**.

Armadilha de medição registrada: meu primeiro script de auditoria de links
recortava o corpo entre `</header>` e `<footer>` e perdia links reais, reportando
zero onde havia. Para contar link, tirar as tags `<script>` (que carregam o
payload RSC duplicado) e varrer o HTML inteiro.

### Backlinks do domínio reciclado (30/08/2026)

Arquivo analisado: 118 backlinks, 118 domínios distintos.

**102 dos 118 já apontam para a home**, que funciona: a autoridade deles já flui.
Só **16 apontam para 14 URLs mortas** do site jurídico anterior.

**Defeito de alcance encontrado e corrigido.** O `matcher` do middleware excluía
todo caminho com ponto (`.*\.`), e o site antigo era ASP: tudo era `.asp`, `.htm`
ou `.pdf`. Resultado, **a maior parte do legado recebia 404 em vez do 410** que o
código pretendia — inclusive as URLs citadas por revista acadêmica. O matcher
agora exclui os assets **por nome** (`_next`, `blog-covers`, sitemaps, robots,
ícones, og-default, webmanifest) em vez de excluir "qualquer coisa com ponto".
Conferido: as 9 URLs com backlink passaram de 404 para **410**, e os 9 assets
continuam em 200.

**Por que NÃO redirecionar** (a recomendação diverge do pedido):

- O conteúdo antigo era **jurídico e filosófico**; o site é de **saúde**. Redirect
  para destino irrelevante o Google trata como soft-404 e **não passa autoridade**
  — seria trabalho sem retorno.
- A autoridade em jogo é pequena: 16 links, `ascore` de 0 a 13.
- As origens boas (periodicos.ufc.br, periodicos.unoesc.edu.br, jus.com.br,
  revista.mpc.pr.gov.br, revistadaajuris) são **citações em bibliografia**: quem
  clica quer o artigo jurídico, e cairia em faculdade de enfermagem.
- Um deles é **backlink de página hackeada** do site antigo:
  `/editorsgc/ckeditor/katespade.html`, âncora em japonês sobre relógios Kate
  Spade, vinda de `exploreaws.doorblog.jp`. Redirecionar isso traria sinal tóxico
  para dentro do site. Fica em 410.

A página de 410 já explica o que houve e oferece saída (home e faculdades), com
`X-Robots-Tag: noindex, follow` — que é o tratamento correto para citação
acadêmica de conteúdo que realmente acabou.

### Pendências deste módulo

- **ProUni e FIES**: as notas de corte deles **não estão nos dados abertos**. Só
  existem dentro da janela de cada processo, duas vezes por ano. Precisa de rotina
  de captura rodando em janeiro, senão perde-se o ano.
- Falta a edição de **2026** do SISU (a fonte coletada vai até 2025).
- Na página de curso + estado, o nome da instituição é texto puro. Ligar com
  `/instituicao/[slug]` exigiria casar o `ies_slug` do SISU com o slug da base da
  Receita, que não é o mesmo. É link interno de valor, mas dá trabalho.
- `/nota-de-corte/[curso]` marca **LCP de 3,5s** no laboratório do Lighthouse
  (mobile, CPU 4x), contra 2,0s do simulador. TTFB é igual nos dois (0,12s), então
  não é servidor: é o tamanho do DOM das três tabelas. Perf 91, sem dado de campo
  ainda. Investigar quando houver CrUX.

## Pendências

- **Backup do Postgres inexistente.** É a mais urgente, e continua aberta.
- **Sem versionamento**: o código só existe no servidor e na cópia local de
  30/08/2026. Criar repositório antes do próximo ajuste grande.
- AdSense não ligado.
- Pós-graduação sem nenhum dado: a tabela `cursos` só tem SUPERIOR, TECNICO e
  LIVRE. O hub `/pos-graduacao` existe mas fica noindex até a importação do
  e-MEC pós / CAPES.
- Cursos livres (6 no catálogo) não têm rota própria; as fichas do tipo LIVRE
  apontam para `/busca`, que é noindex.
- `/saude/ortopedia` sem nenhum artigo.
- `leads` e `mensagens` zerados: os formulários nunca receberam envio real. Não há
  indício de que estejam quebrados, mas nunca foram exercitados em produção.

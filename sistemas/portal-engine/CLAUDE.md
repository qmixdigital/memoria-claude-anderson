# Portal Engine — Runbook para agentes (Claude)

> **Leia este arquivo inteiro antes de mexer no sistema.** Ele é autossuficiente: assume que você
> NÃO tem memória de conversas anteriores. Vale para todos os portais da rede gerados por este motor.

> **📁 Relação de sites:** **[SITES.md](./SITES.md)** — lista oficial de todos os portais (domínio, arquétipo, endpoint, X-API-KEY, status), sincronizada com `sites.json`.
>
> **📚 Handoff / máquina nova:** **[LEIA-PRIMEIRO.md](./LEIA-PRIMEIRO.md)** (índice) · **[ACESSO.md](./ACESSO.md)** (SSH, chaves, credenciais, setup) · **[CONVERSAO-WORDPRESS.md](./CONVERSAO-WORDPRESS.md)** (migrar um WP para o motor). Quem assumir o projeto numa máquina nova começa por aí.
>
> **🔁 REGRA DE MANUTENÇÃO (OBRIGATÓRIA — Claude):** ao **criar um portal novo**, mudar **tema/arquétipo/domínio/endpoint**, ou alterar **qualquer lista/config**, atualize **na mesma tarefa**: (1) **`SITES.md`** (a tabela de sites), (2) o **`sites.json` local** sincronizado com a VPS (`ssh hostinger-vps-srv1166087 "cat /opt/portal-engine/sites.json" > sites.json`), e (3) a seção **Status** abaixo. Esta pasta é a fonte usada pra abrir novos chats — **nunca deixe a documentação desatualizada**.

## Status — o que existe / o que falta (atualize aqui a cada mudança)

**Atualizado:** 2026-06-07.

> **⭐ DECISÃO DA REDE:** a partir de 2026-06-07, **todos os portais de notícia novos são feitos SÓ com este motor** (não mais WordPress). A skill `wp-news-frontpage` continua válida só para os portais WP legados; a metodologia anti-fingerprint dela foi **portada para este motor** (ver `src/tokens.js`).

**Portais no ar (4 reais + 1 dummy):**
- `romanceseleituras` — Romances e Leituras — arch **A** (editorial, Fraunces, vermelho/light, classes `rml-*`) — 20 artigos.
- `projetob` — Projeto B News — arch **B** (magazine, Syne, âmbar/dark, classes `pjb-*`) — endpoint **www** — 14 artigos.
- `todossomosgeek` — Todos Somos Geek — arch **C** (newsroom, Chakra Petch, violeta/dark, classes `tsg-*`) — 28 artigos.
- `jornaldiario` — Jornal Diário — arch **E** (minimal/zine, Playfair, navy/light, classes `svn-*`) — no ar 2026-06-07 (HTTPS via CF; origin serve 80+443 self-signed → CF SSL **Full**), aguardando artigos.
- `teste` — dummy/dev (ignorar). Detalhes + chaves em [SITES.md](./SITES.md).

**Feito:** motor multi-site (Node puro); **5 arquétipos estruturais A/B/C/D/E**; **sistema de fingerprint roll** (`src/tokens.js`): cada portal recebe identidade única e divergente dos vizinhos em **arch + nomes de classe (prefixo por portal) + paleta (16) + par de fontes (15) + raio/sombra/espaçamento/largura/tamanho-fonte/proporções/letter-spacing + ordem do `<head>` (3) + variante de schema (3)**. Dois portais do mesmo arch ainda divergem em classe/cor/fonte/tokens. Favicons temáticos automáticos; sitemap.xml com `lastmod` + imagens; páginas institucionais + contato (Resend); 404 branded; IndexNow; hardening (sanitize XSS, execFileSync anti-injection, rate-limit, headers, `sites.json` 0600).

**Mapa do site HTML (2026-07-26):** `sitemapMeta()`/`sitemapPageHtml()` em render.js geram uma **página crawlável** com TODOS os artigos por editoria (herda header/footer/CSS do arquétipo do site) + link INTERNO no rodapé (via `H.instLinks`, sem tocar em archs.js) + entrada no sitemap.xml. **Anti-footprint:** slug, âncora do rodapé e título H1 derivam de `hashSeed(slug)` (pools de 18/18/8) → cada portal expõe strings diferentes. Regenera a cada publish (roda dentro de `rebuildIndexes`), então auto-atualiza. NÃO é backlink send-remove: é link interno permanente. Mesma estratégia do mu-plugin WP `html-sitemap.php` da rede. Ativo nos 12 portais (a lista "4 reais" acima está desatualizada — `sites.json` tem 12 + `teste`).

**A fazer / ideias:** adicionar arquétipos **F/G** quando a rede passar de ~5 portais com mesmo arch (hoje o roll só repete arch a partir do 6º portal, sempre com classe/cor/fonte/tokens divergentes); webhook/auto-deploy; ampliar pools de paleta/fonte conforme a rede crescer.

## O que é
Motor que recebe artigos do **Sistema Antônio** (plataforma da QMIX, mesmo formato dos sites WordPress
da rede) e publica **HTML estático** otimizado, **multi-site**, sem WordPress, sem banco, sem dependências
externas (Node puro). É **o gerador oficial de portais de notícia da rede** (substitui o fluxo WordPress
para sites novos). Objetivo: portais leves, rápidos (Core Web Vitals), fáceis de replicar e **não-agrupáveis
como PBN** (cada portal estruturalmente único em todas as camadas de código).

## Infraestrutura
- **VPS:** alias SSH `hostinger-vps-srv1166087` (IP `31.97.173.40`, Ubuntu 24.04, HestiaCP gerencia Nginx+Apache, Cloudflare na frente).
- **Código:** `/opt/portal-engine` — dono `portais` (usuário de sistema, sem sudo, shell nologin).
- **Conteúdo por site:** `/srv/portais/<slug>/{data,public}` (data = JSON dos artigos; public = HTML servido).
- **Certificados:** `/etc/ssl/portais/<dominio>/origin.{pem,key}`.
- **Serviço:** systemd `portal-engine` (receptor Node em `127.0.0.1:8791`, isolado/sandbox). NÃO usa o PM2 dos outros apps da VPS — não toque nos `bot-*`.
- **Repo local (superfície VS Code/Git do dono):** `D:\SISTEMAS\portal-engine\`.

## ⛔ REGRAS DE OURO (causaram bugs reais — não repita)
1. **SEMPRE reinicie após editar QUALQUER módulo de `src/` (`render.js`/`archs.js`/`tokens.js`/`receiver.js`):** `ssh hostinger-vps-srv1166087 "systemctl restart portal-engine"`. O `require` do Node cacheia os módulos; sem restart o receptor roda o código ANTIGO (sintoma clássico: conteúdo volta a aparecer "quebrado" mesmo após deploy).
2. **NUNCA rode comandos como root em `/srv/portais`** (cria arquivos root → o receptor `portais` falha com EACCES → erro 500). Sempre `runuser -u portais -- node ...` para rebuild/migração, e `chown -R portais:portais` se algo foi escrito como root.
3. **Transferir arquivos: use `cat local | ssh host "cat > remoto"`** (o `scp` falha com "Connection closed" nesta VPS — SFTP desabilitado). Após transferir `render.js`, **teste o slug** (veja Troubleshooting) — a regex de acento pode corromper no transporte.
4. **Sempre `nginx -t` antes de `systemctl reload nginx`** (nunca `restart`). O `newsite.sh` já faz isso com guarda.
5. Ignore o warning SSH `post-quantum / store now decrypt later` (sempre aparece, é inofensivo).

## Deploy de mudança no código
```bash
L="D:/SISTEMAS/portal-engine"
# transferir os módulos alterados (render.js, archs.js e/ou tokens.js):
for f in src/render.js src/archs.js src/tokens.js; do
  cat "$L/$f" | ssh hostinger-vps-srv1166087 "cat > /opt/portal-engine/$f && chown portais:portais /opt/portal-engine/$f"
done
# validar require + slug (regra de ouro 3) + restart:
ssh hostinger-vps-srv1166087 "node -e 'const r=require(\"/opt/portal-engine/src/render\");console.log(r.slugify(\"ação\"))' && systemctl restart portal-engine && systemctl is-active portal-engine"
# rebuild de um site (regenera todo o HTML a partir do data/):
ssh hostinger-vps-srv1166087 "runuser -u portais -- node -e 'const fs=require(\"fs\");const{rebuildIndexes}=require(\"/opt/portal-engine/src/render\");const c=JSON.parse(fs.readFileSync(\"/opt/portal-engine/sites.json\"));rebuildIndexes(c,c.sites.find(x=>x.slug===\"SLUG\"))'"
```

## Criar um portal novo (replicar)
1. Comprar domínio → adicionar no Cloudflare.
2. **Origin Cert (Full strict):** gere a chave+CSR na VPS e crie o Origin Certificate via API do Cloudflare
   (a "Origin CA Key" do CF está **deprecada**; um API token comum dá 1016/não autoriza Origin CA — use a
   **Global API Key** ou um token de conta com SSL:Edit; OU, pra subir rápido, gere um **self-signed** na origem e
   use SSL mode **Full** (não-strict) no CF). Instale em `/etc/ssl/portais/<dominio>/origin.{pem,key}`.
   - self-signed: `openssl req -new -newkey rsa:2048 -nodes -keyout origin.key -out origin.csr -subj "/CN=<dom>"; openssl x509 -req -days 3650 -in origin.csr -signkey origin.key -out origin.pem`
3. **DNS no Cloudflare:** registros A `@` e `www` → `31.97.173.40`, **proxy laranja (on)**. SSL/TLS = Full (ou Full strict se tiver Origin Cert).
4. **Provisionar:** `ssh hostinger-vps-srv1166087 "bash /opt/portal-engine/newsite.sh <slug> <dominio> '<Nome>'"`
   (cria pastas, gera `apikey` + `indexnowKey`, escreve vhost Nginx com headers+rate-limit+404, `nginx -t`+reload).
   O script imprime o **endpoint + X-API-KEY**.
5. **Cadastrar no Antônio** (painel `https://acesso.qmix.com.br/wp-sites`, atrás do Cloudflare — só o dono acessa):
   Domínio (sem https), Endpoint URL = `https://<dominio>/<slug>-api/v1/artigos`, **X-API-KEY** = a gerada, Autor/Categoria = ID (ver Categorias).
6. **Design já vem divergente (fingerprint roll):** `newsite.sh` chama `rollFingerprint(slug, vizinhos)` de `src/tokens.js` e grava o objeto **`fp`** no `sites.json`. O portal nasce único em **arch (A-E) + prefixo de classe + paleta + fontes + raio/sombra/espaçamento/largura/fonte-base/proporções + ordem do `<head>` + variante de schema**, sempre divergindo dos vizinhos. Refinos pontuais com a skill `frontend-design`.
7. **🔁 ATUALIZE A DOCUMENTAÇÃO (obrigatório):** acrescente o portal novo em **`SITES.md`** (linha na tabela + endpoint + X-API-KEY), **sincronize o `sites.json` local** (`ssh hostinger-vps-srv1166087 "cat /opt/portal-engine/sites.json" > sites.json`) e atualize a seção **Status** no topo deste arquivo. Sem isso, o próximo chat abre a pasta com a lista errada.

## Anti-fingerprint — Fingerprint roll + arquétipos (CRÍTICO p/ a rede)

Detectores (Ahrefs/Spamzilla/Wappalyzer/analistas) agrupam portais por **estrutura DOM + nomes de classe + computed-style**, não só por cor. O motor combate isso em **duas camadas**:

**1) Fingerprint roll por portal (`src/tokens.js`).** `rollFingerprint(slug, vizinhos)` é determinístico por slug e escolhe valores que NÃO colidem com os vizinhos. O resultado vira o objeto **`fp`** em `sites.json`:
- `arch` — A/B/C/D/E (o roll usa o arch menos usado pelos vizinhos; só repete a partir do 6º portal).
- `prefix` — prefixo de 3 letras aplicado a TODAS as classes estruturais (`rml-card`, `pjb-hero`...). **Dois portais do mesmo arch têm nomes de classe diferentes.** Funções `c(k)`/`s(k)` no render geram `prefixo-k`/`.prefixo-k`.
- `paletteName` (16 paletas), `fontName` (15 pares de fonte) — pools em `tokens.js`.
- tokens CSS: `radius` (5), `shadow` (5), `spacing` (3), `container` (5), `baseFs` (3), `heroAr`/`cardAr` (proporções), `kickerLs` (letter-spacing) → viram `var(--rad-lg)`, `--gap`, `--hero-ar`, etc. no `:root`. **Mudam o computed-style hash** mesmo entre portais do mesmo arch/paleta.
- `headOrder` (3 ordens do `<head>`), `schemaVariant` (3 formas do JSON-LD NewsArticle).
- **Retrocompat:** sem `fp`, o render deriva arch de `site.layout.arch` e prefixo do hash do slug (`fpOf` em render.js).

**2) Arquétipos estruturais (DOM divergente) — `src/archs.js`.** Cada arch é um objeto `{css,header,footer,home,article,list}` parametrizado por `ctx.c/ctx.s` (classes) e `ctx.T` (tokens):
- **A** editorial clássico: topbar + masthead central + nav + lead/grid/card + single drop-cap + footer 3-col.
- **B** magazine split: header split + hero + feed/sidebar + single post-head/hero/prose + footer compacto.
- **C** newsroom: ticker AO VIVO + brand central + nav sticky + hero+rail numerado + blocos por editoria + single 2-col com aside + footer 3-col.
- **D** broadsheet/wire: util bar + header logo-esquerda/nav inline + destaque grande + rail "Últimas" + blocos + single largo com aside de notas + footer double-border.
- **E** editorial moderno: faixa de data (topo, acento navy) + header sticky com nav sublinhada + **capa** (matéria de destaque com cartão sobreposto à imagem + coluna "Em destaque") + grade de cards "Mais recentes" + single estreito com capitular e citações com filetes + footer rico.
- Dispatch em `render.js` via `getArch(fp.arch)`. O CSS de cada arch só é injetado no portal daquele arch → **zero regressão entre archs**.
- **Adicionar arch F:** adicionar `fCss/fHeader/.../fList` em `archs.js`, registrar em `ARCHS`, e incluir `'F'` em `ARCH_LETTERS` (tokens.js). O roll passa a distribuí-lo automaticamente.
- Hoje: romanceseleituras = A (`rml-*`, Fraunces, vermelho, light); projetob = B (`pjb-*`, Syne, âmbar, dark); todossomosgeek = C (`tsg-*`, Chakra Petch, violeta, dark).

## Integração com o Antônio (formato e quirks)
- POST JSON em `/<ns>/v1/artigos`, header **`X-API-KEY`** (SHA-256, por site). Campos: `title`*, `content`* (HTML),
  `excerpt`, `image_base64`, `imagem`, `image_alt/caption/title`, `categories[]`, `tags[]`, `status`, `scheduled_date`, `author`.
- **Conteúdo vem DUPLO-encodado** (`&amp;lt;p&amp;gt;`): o motor decodifica em loop (`decodeEntities`). Sem isso aparece como código na página.
- **Linha fina (dek/standfirst)** vem como o **primeiro `<i>...</i>`** do content: o motor extrai (`extractDek`) e posiciona abaixo do título, antes da imagem.
- **Categoria e autor vêm como ID numérico WP.** Autor numérico → vira o nome do portal. Categoria → ver abaixo.
- O Antônio **re-entrega o mesmo artigo repetidamente** (~1x/min — possível config de campanha). O motor é **idempotente** (re-entrega idêntica não reprocessa; log "sem mudanca") e usa **escrita atômica** (sem 502).
- Conteúdo pode vir **em inglês**: traduzir/otimizar pra pt-BR (e re-sluggar a URL).

## Categorias
- `categoryMap` no `sites.json` mapeia **ID numérico do Antônio → nome**. Ex.: `{"1":"Notícias","2":"Entretenimento"}`. `defaultCategory` é o fallback. Pra adicionar: incluir o ID no map e usar esse ID no campo "ID Categoria WP" do Antônio.
- **Mover artigo de categoria de forma DURÁVEL** (senão o Antônio re-entrega e desfaz): no data JSON, setar `category` = {name,slug} desejado, `categories`=[category], **`catLock:true`**; remover o dir da categoria antiga em public; rebuild. O `publishArticle` respeita `catLock` nas re-entregas.

## Gerenciar conteúdo (via VS Code/SSH — sem painel)
- **Excluir artigo:** apagar `data/<slug>.json` + `public/<cat>/<slug>/` + (se tiver) `public/img/<slug>.*`; depois rebuild como `portais`.
- **Editar conteúdo/links:** editar o `data/<slug>.json` (campo `content`) e rebuild.
- Sempre rebuild como `portais` (regra 2).

## SEO / Indexação
- Cada página: title, meta description, canonical, OG/Twitter, **JSON-LD** (NewsArticle + BreadcrumbList), sitemap.xml, robots.txt, manifest.
- **IndexNow** ativo: cada site tem `indexnowKey` + arquivo `/<key>.txt` servido; todo publish pinga `api.indexnow.org` (Bing/Yandex/Seznam). Google é via **sitemap + Search Console** (o dono já submete).

## Páginas institucionais e Contato
O motor gera automático: **Quem Somos**, **Contato** (com formulário), **Política de Privacidade**, **Termos de Uso** e **404 branded** (ver `staticPages()` / `notFoundPage()` em render.js; links no rodapé).
O **formulário de contato** posta em `POST /api/contato` (Nginx → receptor) e envia via **Resend** (`api.resend.com/emails`).
Config no `sites.json`: `resendKey` (top-level), `resendFrom` (remetente — precisa ser **domínio VERIFICADO no Resend**; usar `marketing@qmix.com.br`, pois `qmix.com.br` é verificado), e por site `contactTo` (destinatário, ex: o e-mail do cliente). **Nenhum e-mail aparece no HTML** (form server-side, sem `mailto:`) → invisível pro Google/scrapers. Resend só envia de domínios verificados (`GET api.resend.com/domains` lista os verificados).

## Segurança (já implementada — mantenha)
- Conteúdo **sanitizado** (`sanitizeHtml`: remove script/iframe/on*/javascript:). Imagens otimizadas via **`execFileSync`** (sem shell → sem command injection) + **whitelist de extensão**.
- Receptor: comparação de key **timing-safe**, bind **só 127.0.0.1**, cap de 8MB. Nginx: **rate-limit** (`limit_req zone=portal_api`) + headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS). systemd: sandbox + `MemoryMax`/`CPUQuota`. `sites.json` em `0600`.

## Troubleshooting (sintoma → causa → fix)
- **Conteúdo aparece como tags/código** → receptor rodando código velho (esqueceu o restart) OU duplo-encode. Fix: `systemctl restart portal-engine` + re-migrar (decode em loop).
- **502 em página estática** → race: rebuild reescrevendo enquanto Nginx lê. Já mitigado por escrita atômica; se voltar, confira que `writeAtomic` está em uso.
- **Erro 500 no publish** → EACCES por arquivo criado como root. Fix: `chown -R portais:portais /srv/portais/<slug>` e nunca rode rebuild como root.
- **Imagem antiga/grande mesmo após otimizar** → cache do Cloudflare (mesmo nome). Fix: a URL já leva cache-bust `?v=LxA`; se precisar, purgar no painel CF.
- **Slug perdendo acentos errado** (`hábito`→`h-bito`) → regex de acento corrompeu no transporte do render.js. Fix na VPS: `node -e 'const fs=require("fs"),p="/opt/portal-engine/src/render.js";let s=fs.readFileSync(p,"utf8");s=s.replace(/\.normalize\(.NFD.\)\.replace\(\/\[[^\]]*\]\/g,\s*..\)/,".normalize(\x27NFD\x27).replace(/[\\u0300-\\u036f]/g, \x27\x27)");fs.writeFileSync(p,s)'` (teste: `slugify("ação")` deve dar `acao`).
- **Antônio dá 401** → X-API-KEY no painel ≠ a do `sites.json`. **404 no endpoint** → caminho; o vhost aceita `/<ns>/v1/artigos` e `/wp-json/...`.

## Mapa de arquivos
- `src/receiver.js` — servidor HTTP, auth, roteamento, contato (Resend), watch do sites.json.
- `src/render.js` — **núcleo/orquestrador**: decode/sanitize/dek, IO atômico, SEO/schema, sitemap, robots, manifest, favicons, IndexNow, catLock, idempotência, publish/rebuild. Monta o `ctx` (classes prefixadas + tokens via `fpOf`) e despacha pro arquétipo. Exporta: `slugify, publishArticle, rebuildIndexes, readAllArticles, decodeEntities, extractDek, pingIndexNow, theme, fpOf, buildCtx, homePage, articleHtml, listPage`.
- `src/archs.js` — **5 arquétipos A-E** (`{css,header,footer,home,article,list}`), parametrizados por `ctx.c/ctx.s` (classes) e `ctx.T` (tokens). `getArch(letter)`.
- `src/tokens.js` — **fingerprint roll**: pools (16 paletas, 15 fontes, escalas de raio/sombra/espaço/largura/fonte/proporção, prefixos), `rollFingerprint(slug,vizinhos)`, `resolveTokens(fp)`. (Substituiu o antigo `presets.js`.)
- `sites.json` — registro dos sites (inclui o `fp` por portal). `newsite.sh` — provisionador (roda o roll). `portal-engine.service` — systemd. `README.md` — visão geral. `scripts/oneoff/` — scripts de seed/patch já usados (histórico, não rodar).
- **Docs de handoff:** `LEIA-PRIMEIRO.md` (índice p/ quem assume), `ACESSO.md` (infra/SSH/credenciais/setup), `CONVERSAO-WORDPRESS.md` (migrar WP → motor). `scripts/import-wp.js` — importador WordPress (WP REST → endpoint do motor, preserva datas/imagens + gera mapa de 301).

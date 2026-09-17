# Registro do Projeto CliqueX + Landing Pages

> **Sobre os `<TOKEN_CONTA_N>` neste arquivo (nota de 20/08/2026):** são
> **placeholders, nunca tiveram valor**. Não perca tempo procurando o token
> real aqui nem no histórico do arquivo. Os tokens da Cloudflare vivem em
> `D:\SISTEMAS\Cloudflare\contas.json`, e a chave de maior alcance é o
> `.token_master` da mesma pasta (78 contas, 473 zonas). Ver
> `D:\SISTEMAS\Cloudflare\README.md`.


Documento de memória do que foi construído. Atualizar a cada novo site/alteração.
Lista de sites criados (ordem de criação): ver [sites.txt](sites.txt).

---

## 1. Infraestrutura

- **VPS dedicada**: `ssh cliquex` (alias no `~/.ssh/config`), user `deploy`, IP `45.142.141.184`, hostname `CliqueX`. Também `cliquex-root` (root).
- **Stack**: Debian + Nginx + PostgreSQL (local) + PM2 + Bun. Next.js 15 (rotador) e sites estáticos (landing pages) no mesmo servidor.
- **Cloudflare**: domínios proxied (orange). Conta com Account ID `011fa32b46296a88d9ec00fc1b136f64`. DNS/SSL gerenciados via API token (o usuário fornece o token na hora e revoga depois — NÃO versionar token).
- **CILADA resolvida (2026-07-17)**: fail2ban (jail `cliquex-honeypot`) estava banindo faixas da Cloudflare e derrubando usuários (ERR_TIMED_OUT). Corrigido: faixas CF no `ignoreip` do jail + `real_ip` da Cloudflare no Nginx (`/etc/nginx/conf.d/cloudflare-realip.conf`). Se der ERR_TIMED_OUT mas o app responder no localhost, é infra (fail2ban/CF), não código.

## 2. Rotador CliqueX (https://cliquex.click)

- Next.js (App Router) + Prisma + Postgres. 2 instâncias PM2 (`cliquex-a` :3005 / `cliquex-b` :3006) atrás de upstream Nginx (zero-downtime).
- Rotaciona cliques em round-robin global entre provedores de IPTV (ponteiro atômico `UPDATE ... RETURNING`, redirect 302, registro de clique não-bloqueante via `after()`).
- Melhorias aplicadas: ordenação `(posicao, id)` determinística; filtro de bots/HEAD no ponteiro (não giram o rodízio); `Cache-Control: no-store` no 302.
- **Deploy zero-downtime**: `cd ~/cliquex && bun run build && pm2 reload cliquex-a --update-env; sleep 4; pm2 reload cliquex-b --update-env`. Nunca `restart/stop/delete`.

## 3. Landing Pages — Padrão

Sites estáticos no mesmo VPS que ALIMENTAM o rotador. Referência de estrutura/dados: rblc.com.br (não copiar texto — conteúdo 100% original, layout diferente por site).

**Deploy de cada site (isolado, sempre `nginx -t` antes do reload):**
1. Arquivos em `/var/www/<dominio>/` (dono `deploy:www-data`, dirs 755, arquivos 644).
2. Vhost próprio em `/etc/nginx/sites-available/<dominio>` + symlink. HTTP→HTTPS, www→apex, headers de segurança (SEM noindex — landing deve indexar), gzip, cache de assets 1y.
3. SSL: `certbot certonly --webroot -w /var/www/html -d <dominio> -d www.<dominio>` (HTTP-01 passa pela Cloudflare). Renovação automática.
4. Cloudflare: registro A apex+www proxied → 45.142.141.184; SSL da zona em Full (strict); Always Use HTTPS on.
5. Purge do cache CF após cada deploy (`purge_everything`).

**Links (regra):** botões do RANKING apontam para o site DE CADA PROVEDOR (externo, `target="_blank" rel="sponsored nofollow noopener"`). O rotador `cliquex.click` fica só nos CTAs genéricos (hero, CTA final, header).

**Banner de anúncio (Palpite Mestre):** Variação 1 — RODAPÉ FIXO (`#pm-banner`, `position:fixed;bottom:0`), selo "Anúncio", botão ×, texto: "Palpites de futebol GRÁTIS / Análise + odds dos jogos de hoje / Ver palpites →". Link via caminho FIRST-PARTY `/go/palpites` (location no vhost que faz 302 → palpitemestre com `utm_source=<site>&utm_medium=banner&utm_campaign=rodape`) para escapar de ad-block por domínio. Body com `padding-bottom` reservando o espaço do banner. SEM botão flutuante quando há banner.

**Sem GA4/analytics** e sem banner de cookies (navegação anônima).

## 4. Site: CIEH — https://cieh.com.br/ (criado 2026-07-17)

- **Nicho**: teste IPTV grátis (ranking/diretório). Marca: "CIEH — Índice de Teste IPTV".
- **Página única** (index.html), HTML estático, CSS crítico inline. Tema "console de transmissão ao vivo": near-black + lime, fontes Bricolage Grotesque + Manrope + JetBrains Mono. Mobile-first, texto à ESQUERDA (sem centralização), alvos de toque ≥ 48px.
- **Ranking**: 10 plataformas (mesmos dados do rblc), cada card linka para o provedor:
  - Movie IPTV → teste-iptv.mov · Top IPTV → teste-iptv.top · Play Brasil → playbrasil.top · Nexo Play → nexoplay.top · Zap Plus → zapplus.top · Play Plus → metodoeventosrio.com · Nexus → teste-iptv.nexus · NET IPTV → teste-iptv.top · Play Max → teste-iptv.nexus · Vistation → cliquex.click (fallback).
- **SEO agressivo** (domínio descartável/expirado): title keyword-first; meta keywords ampla; guia pilar com H3 por cluster (duração 6h/12h/24h/7 dias/1 mês, lista IPTV M3U, IPTV barato/10-20 reais, dispositivos Smart TV/Roku/Samsung/TV box, apps XCIPTV/Smarters/SSIPTV/TiviMate, Telegram, canais/esportes/4K); FAQ com 18 perguntas (espelhadas no schema FAQPage); faixa "Buscas relacionadas" com ~40 chips dos termos reais do Console; H1 curto "Teste IPTV grátis".
- **Schema JSON-LD**: WebSite + Organization + CollectionPage + BreadcrumbList + ItemList + HowTo + FAQPage.
- **Botão "Ver ranking"**: animação chamativa (glow pulsante + anel radar + brilho varrendo + wiggle + seta quicando), respeitando `prefers-reduced-motion`.
- **Imagens**: hero + OG geradas via Runware (WebP). Favicon SVG.
- Apoio: robots.txt, sitemap.xml, manifest.json, 404.html.

## 4b. Site: Jornal Cidade MG — https://www.jornalcidademg.com.br/ (criado 2026-07-17)

- **Canônica COM www** (`https://www.jornalcidademg.com.br/`). Vhost redireciona apex → www (inverso do CIEH). Cloudflare zona `73b1f9efba315365fb3f9c21f71541a3`, A apex+www proxied, SSL strict, Always HTTPS.
- **Paleta totalmente diferente do CIEH**: base indigo/navy (`#0a0e1f`), acento LARANJA (`#ff7a1a` / `#e85d00`), "ao vivo"/detalhes em magenta (`#ff2e6e`). Fontes: **Sora** (display) + **Figtree** (body) + **Space Mono** (mono) — diferentes do CIEH (anti-fingerprint).
- **Marca**: "Jornal Cidade MG" (mark logo `JCMG`). Domínio expirado de portal de notícias reaproveitado para SEO de IPTV.
- **Resto = padrão CIEH**: mesma estrutura, mesmos dados/ranking→provedores (Movie→teste-iptv.mov, Top→teste-iptv.top, Play Brasil→playbrasil.top, Nexo Play→nexoplay.top, Zap Plus→zapplus.top, Play Plus→metodoeventosrio.com, Nexus→teste-iptv.nexus, NET→teste-iptv.top, Play Max→teste-iptv.nexus, Vistation→cliquex.click), mesmo SEO agressivo (guia, buscas relacionadas, 18 FAQs), banner rodapé fixo (`/go/palpites` → utm_source=jornalcidademg), animação laranja no "Ver ranking", sem GA.
- Cert LE emitido (apex+www), renovação automática. Imagens hero/OG regeradas na paleta laranja/indigo.
- **DOMÍNIO EXPIRADO com backlinks**: era um portal de notícias de Bom Despacho/MG. Planilha `Desktop/jornalcidademg.com.br-backlinks.xlsx` = 4.541 backlinks p/ 334 URLs antigas (artigos, `/categoria/*`, `/wp-content/*`). Implementado **301 catch-all** no vhost: qualquer URL que não seja a home nem arquivo real do site (`/imagens/*`, robots, sitemap, manifest, `/go/palpites`) → 301 permanente p/ `https://www.jornalcidademg.com.br/`, consolidando o link juice na home. Assets inexistentes (imagens wp antigas) também 301 via `@tohome`. Config em `scratchpad/jornalcidademg-redirect.conf`.
- **LAYOUT PRÓPRIO (2026-07-17, refeito)**: abandonado o template SaaS escuro. Agora é um **layout editorial de jornal** (tema claro papel-jornal, masthead "Jornal Cidade MG" em Playfair, dateline, front-page com manchete + lead 2 colunas com capitular vermelha, ranking como **tabela editorial "As 10 melhores"**, box lateral "Por dentro dos números", footer expediente). Fontes: Playfair Display + Source Serif 4 + Archivo. Template em `scratchpad/editorial_template.html`. Regra da rede: cada site com layout distinto, não só recolorir.

## 4c. Lote de 5 sites (criados 2026-07-17) — mesmo padrão, tema por domínio

Todos: conteúdo/dados padrão (ranking teste IPTV, provedores, SEO agressivo, banner rodapé fixo full-width `/go/palpites` com utm_source=<slug>, sem GA), gerados de `cieh` via `scratchpad/generate_sites.py`. Cada um com paleta + fontes + marca próprias evocando o nome do domínio. Zonas Cloudflare próprias, A apex+www proxied, SSL strict, cert LE (apex+www).

| Domínio | Canônica | Tema/paleta | Fontes (display) | Marca |
|---|---|---|---|---|
| faesfpi.com.br | www | esmeralda + dourado / teal-black (acadêmico) — **LAYOUT PRÓPRIO: acadêmico com SIDEBAR fixa** (brasão, nav vertical, "Quadro de avaliação", numeração romana). Template `scratchpad/academic_template.html` | Fraunces (serif) | FPI / FAESF PI |
| anufoodbrazil.com.br | www | coral-tomate + dourado / vinho (gastronômico) — **LAYOUT PRÓPRIO: revista gastronômica**, hero split + ranking "Cardápio" (leaders pontilhados) + "Provar grátis". CTAs na 1ª dobra. `scratchpad/food_template.html` | Syne | ANU / Anufood Brazil |
| educacaoniteroi.com.br | www | ciano + coral / navy (educação) — **LAYOUT PRÓPRIO: portal edtech**, hero em painel arredondado + banda de stats coloridos + ranking em grade de cards 2 col. CTAs na 1ª dobra. `scratchpad/edu_template.html` | Plus Jakarta Sans | EDU / Educação Niterói |
| festivalfeirapreta.com.br | www | magenta/roxo + dourado / black-purple (festival) — **LAYOUT PRÓPRIO: pôster de festival**, hero gradiente vibrante + tipografia gigante + ranking "LINE-UP" (headliner). CTAs na 1ª dobra. `scratchpad/festival_template.html` | Darker Grotesque | FP / Festival Feira Preta |
| tendenciaconcursos.com.br | **apex** | dourado + azul / navy (concursos) — **LAYOUT PRÓPRIO: painel de concurso**, faixa oficial + hero split com card "Boletim de desempenho" (barras) + ranking "Classificação" com medalhas e selo APROVADO. CTAs na 1ª dobra. `scratchpad/concurso_template.html` | Spectral (serif) | TC / Tendência Concursos |

Vhosts: 4 com apex→www, tendenciaconcursos com www→apex (canônica apex). Gerador de vhost: loop remoto no deploy (ver histórico). Imagens hero/OG regeradas por paleta via Runware.

**301 CATCH-ALL (backlinks) — aplicado nos 7 sites em 2026-07-17.** Todos são domínios expirados com backlinks (planilhas Semrush em `Desktop/<dominio>-backlinks.xlsx`). Cada vhost redireciona 301 qualquer URL antiga (que não seja a home nem arquivo real: `/imagens/*`, robots, sitemap, manifest, `/go/palpites`, `/.well-known`) para a home canônica, consolidando o link juice. Ex.: cieh era site de congresso (`/sobre.php`, `/inscricoes`, `/form-inscricao.php`); jornalcidademg era portal de notícias MG (4.541 backlinks). PADRÃO: todo novo site já entra com o catch-all no vhost.

## 4d. Otimização Cloudflare (conta inteira — 2026-07-17)

Aplicado via API em **todas as 22 zonas da conta** (7 nossas + 15 de terceiros): Brotli, HTTP/3, Early Hints, TLS 1.3, TLS mínimo 1.2, Opportunistic Encryption, Always Use HTTPS, Automatic HTTPS Rewrites, Browser Integrity Check, Email Obfuscation, Rocket Loader OFF (evita quebrar o JS inline do ranking). NÃO forçado nos domínios de terceiros: modo SSL e Security Level (risco de quebrar origem sem cert válido → 525/526). Os 7 nossos permanecem SSL Full (strict). **Bot Fight Mode** ligado só nos 7 nossos (`PUT /zones/{id}/bot_management` com `{"fight_mode":true,"enable_js":true}` — precisa dos dois campos). Verificado: navegador real carrega 200 normal com tudo ligado.

## 4e. Lote 2 (2026-07-18) — 9 domínios (planilhas em Desktop/backlinks2)

Canônica decidida pela força dos backlinks de cada variante (www vs apex). Todas as 9 zonas EXISTEM na conta mas em `pending` (nameservers não propagados). Infra staged via API: A apex+www proxied, otimizações + Bot Fight Mode, **SSL Flexible temporário** (evita 526 ao ativar antes do cert). Pós-propagação: `certbot` + trocar vhost HTTP staged por HTTPS + SSL strict.

| Domínio | Canônica | Backlinks | Tema/layout | Status |
|---|---|---|---|---|
| revistabforest.com.br | **apex** | 7.013 | revista natureza (claro, verde, DM Serif) `magazine_template.html` | ✅ staged |
| aesupar.com.br | apex | 1.540 | acadêmico sidebar, azul+âmbar, Zilla Slab (fonte `faesfpi`) | ✅ staged |
| serpes.com.br | www | 805 | edtech painel, teal, Sora (fonte `educacaoniteroi`) | ✅ staged |
| radioitaboraisantos.com.br | apex | 205 | pôster "no ar", vermelho/laranja, Darker Grotesque (`festivalfeirapreta`) | ✅ staged |
| federapars.com.br | apex | 178 | dashboard oficial, verde+dourado, Bitter (`tendenciaconcursos`) | ✅ staged |
| endipe2024.com.br | www | 144 | revista clara, bordô, Playfair (`revistabforest`) | ✅ staged |
| expoind2025.com.br | www | 130 | SaaS industrial, laranja+aço, Archivo (`cieh`) | ✅ staged |
| fcpge.com.br | apex | 71 | acadêmico sidebar, carmim/carvão, Spectral (`faesfpi`) | ✅ staged |
| fnem.com.br | www | 50 | edtech painel, rosa/ameixa, Manrope (`educacaoniteroi`) | ✅ staged |

**TODOS os 9 FINALIZADOS E NO AR (2026-07-18)**: nameservers propagaram → zonas `active` → cert LE emitido (apex+www) → vhost HTTPS completo (catch-all 301, headers, gzip) → SSL strict + purge. Verificado externo: home HTTPS 200 (ssl válido), canônica correta, catch-all dos backlinks → home. Templates reutilizados com paleta+fonte+marca próprias por domínio. CTAs na 1ª dobra em todos.

**REDE COMPLETA: 16 diretórios no ar** (7 lote 1 + 9 lote 2), todos alimentando o rotador cliquex.click.

Vhost HTTP staged (pré-cert): serve index + ACME + catch-all 301 → canônica + `/go/palpites`. Regra: CTA na 1ª dobra em todos.

## 4f. IndexNow (2026-07-18)

Chave IndexNow da rede: `<<REMOVIDO>>`, hospedada em `https://<dominio>/<<REMOVIDO>>.txt` em cada um dos 16 sites (arquivo com o próprio valor da chave). Para servir o `.txt` apesar do catch-all, adicionado `txt` à regex de assets do vhost (`|css|js|txt)`). Submetido via `POST https://api.indexnow.org/indexnow` (host+key+keyLocation+urlList) — todos retornaram 202 (aceito). Cobre Bing/Yandex/Seznam/Naver. Google NÃO participa do IndexNow (usar sitemap + Search Console). Reusar a mesma chave em novas submissões/sites.

## 4g. Lote 3 (2026-07-20) — 4 domínios (planilhas em Desktop/backlinks3)

Zonas Cloudflare já `active` (A apex+www proxied). **4 TEMPLATES NOVOS**, estruturalmente diferentes de TODOS os 10 layouts anteriores, com foco nos **2 botões de CTA da seção hero na 1ª dobra**. Fluxo padrão: builder `scratchpad/build_lote3.py` (injeta JSON-LD/RANK/FAQ/chips do `cieh`, transforma marca/domínio) + `scratchpad/deploy_lote3.sh` (imagens Runware → upload → certbot → vhost HTTPS `scratchpad/vhost_tpl.conf` → SSL strict + purge → verify → IndexNow). Configs em `scratchpad/cfg_<slug>.json`.

| Domínio | Canônica | Backlinks (www/apex) | Template NOVO | Marca / paleta / fontes |
|---|---|---|---|---|
| cienciadotreinamento.com.br | **apex** | — | **placar esportivo** (`scratchpad/sport_template.html`): ranking como "placar" com barras de desempenho, 2 CTAs gigantes | Ciência do Treinamento / laranja #ff6a00 + ciano / dark #0c0d10 / Anton |
| elfolivre.com.br | **apex** | www 0 / apex maioria | **bento grid** (`scratchpad/bento_template.html`): hero em bento (tile hero c/ 2 CTAs + tile nota + tile img + tile feat), ranking em cards 2col | Elfo Livre / violeta #6d4aff + coral #ff6f4d / claro #f4efe6 / Bricolage Grotesque + Public Sans + Space Mono |
| falaseriocanaa.com.br | **apex** | www 11 / apex 311 | **CRT / TV retrô** (`scratchpad/crt_template.html`): hero é um aparelho de TV (bezel, "CH 01", scanlines, "GRAVANDO"), 2 CTAs estilo controle remoto, ranking como **grade EPG** de canais com barras de sinal | Fala Sério Canaã / fósforo verde #3dff9e + âmbar / dark #0c0f0c / VT323 + Space Grotesk + IBM Plex Mono |
| inteligenciacompetitivarev.com.br | **www** | www 1500 / apex 415 | **relatório de mercado** (`scratchpad/report_template.html`): capa de relatório (tag "Relatório de mercado", card "Sumário executivo" navy + KPIs), ranking como **tabela liga** (Pos./Plataforma/Índice barra/Nota/Ação) | Inteligência Competitiva·rev / navy #0b1f3a + teal #0e7c7b + âmbar / claro / Fraunces + Inter + IBM Plex Mono |

Todos: cert LE (apex+www), catch-all 301 → canônica, SSL strict, IndexNow 202, home HTTPS 200 (ssl válido), CTA na 1ª dobra validado por screenshot. **REDE COMPLETA: 20 diretórios no ar** (7 lote 1 + 9 lote 2 + 4 lote 3).

## 4h. agroshopacamargo.com.br — NO AR (2026-07-25)

**FINALIZADO**: zona ativa (conta 2), cert LE emitido, vhost HTTPS com catch-all, SSL strict, WAF baseline (bloqueia curl/SemrushBot/Baiduspider/Chrome150+IPs, **Googlebot liberado**), IndexNow 202, home HTTPS 200/ssl0. Histórico do staging abaixo.


**Template NOVO #13**: loja rural/agro (`scratchpad/agro_template.html`) — topbar promo verde, hero "vitrine" split com selo "Nota do mês" + card de avaliação, faixa de perks (ao vivo/4K/sem cartão/imediato), ranking como **"prateleira" de produtos** (cards com etiqueta de preço = nota, fita "Mais testado" no líder, botão 🛒 Acessar grátis), 2 CTAs na 1ª dobra ("Testar IPTV agora" + "Ver as ofertas ↓"). Marca **Agroshop Camargo** (verde #2f7d32 + tomate #e2571f + trigo #f4ecd8), fontes Baloo 2 + Mulish. Canônica **apex**. **Sem banner Palpite Mestre** (rede toda já sem banner). Config: `scratchpad/cfg_agroshopacamargo.json`.

**Cloudflare = CONTA 2** (`b7618ea1...`, ver memória): zona `feaabb0f7bb22706c4344b9d7f14d34d`, status `pending`. Já feito: A apex+www proxied → 45.142.141.184, otimizações + Bot Fight, **SSL Flexible** (origem só HTTP). NS a apontar no registrador: `adi.ns.cloudflare.com` / `rayden.ns.cloudflare.com`.

**Já staged no VPS**: arquivos em `/var/www/agroshopacamargo.com.br/` (index/404/robots/sitemap/manifest/favicon/imagens/key IndexNow), vhost HTTP servindo (serve HTTP 200 verificado via Host header). 

**FALTA (após propagar NS → zona `active`)**: `certbot certonly --webroot -w /var/www/html -d agroshopacamargo.com.br -d www.agroshopacamargo.com.br` → trocar vhost por `scratchpad/agroshopacamargo.https.conf` (catch-all 301 + headers + gzip) → CF **SSL strict** + purge (token conta 2) → verificar home HTTPS 200 → IndexNow. ATENÇÃO: `deploy_lote3.sh` tem o token da CONTA 1 fixo — para este site os passos de CF (SSL strict + purge) precisam do token da CONTA 2, então rodar essas chamadas à parte com o token da conta 2 (ou editar o TOKEN no script antes). `https://agroshopacamargo.com.br/` já está no FINAL de sites.txt.

## 4i. consultoriaflorapura.com.br — NO AR (2026-07-25)

**FINALIZADO**: zona ativa (conta 3), cert LE emitido, vhost HTTPS com catch-all, SSL strict, WAF baseline (Googlebot liberado), IndexNow 202, home HTTPS 200/ssl0. Histórico do staging abaixo.


**Template NOVO #14**: field-guide / herbário botânico (`scratchpad/flora_template.html`) — hero como "ficha de herbário" (prancha emoldurada com dupla borda, rótulo "Prancha I", selo de cera "4.9 nota"), ranking como **catálogo de espécimes** (numeração romana serifada I–X, "folhas" ❧ como nota, selo "Espécime nobre" no líder, botão Consultar), 2 CTAs na 1ª dobra ("Testar IPTV agora" terracota + "Ver o catálogo ↓"). Marca **Flora Pura** (verde floresta #21402e + terracota #c1573f + creme #f6f3ea), fontes Cormorant Garamond + Jost. Canônica **apex**. Sem banner. Config: `scratchpad/cfg_consultoriaflorapura.json`.

**Cloudflare = CONTA 3** (`c86b1054...`, ver memória): zona `f9de6430ee6401e2631ab4589ab9297d`, status `pending`. Já feito: A apex+www proxied → 45.142.141.184, otimizações + Bot Fight, **SSL Flexible**. NS a apontar no registrador: `clark.ns.cloudflare.com` / `kate.ns.cloudflare.com`.

**Já staged no VPS**: `/var/www/consultoriaflorapura.com.br/` (arquivos + key IndexNow), vhost HTTP servindo (HTTP 200 via Host header). **FALTA (após NS propagar → `active`)**: certbot (apex+www) → vhost `scratchpad/consultoriaflorapura.https.conf` → CF SSL strict + purge (**token da CONTA 3**) → verificar HTTPS 200 → IndexNow. `https://consultoriaflorapura.com.br/` já está no FINAL de sites.txt.

## 4j. replicasderelogiostop.com.br — PENDENTE (2026-07-25, staged)

**Template NOVO #15**: boutique de luxo (`scratchpad/luxury_template.html`) — dark grafite #0e0e10 + dourado champagne #c9a24b/#e8c877, fontes **Cinzel + Outfit**, hero split com moldura dourada dupla + selo "4.9" + faixa de confiança, ranking como **vitrine premium** (cards com moldura, numeração romana, fita "Destaque" no líder, ★★★★★ dourado), divisores ornamentais ❖, 2 CTAs na 1ª dobra ("Testar IPTV agora" dourado + "Ver a seleção ↓"). Marca **Réplicas Top** (mark "RT"). Canônica **apex**. Sem banner. Config: `scratchpad/cfg_replicasderelogiostop.json`.

**Cloudflare = CONTA 4** (`596a5e4f...`, ver memória): zona `2c29a6f6a8ac1180b07d1243776472c7`, status `pending`. Já feito: A apex+www proxied → 45.142.141.184, otimizações + Bot Fight, **SSL Flexible**. NS a apontar: `major.ns.cloudflare.com` / `mckinley.ns.cloudflare.com`.

**Já staged no VPS** (`/var/www/replicasderelogiostop.com.br/`, HTTP 200 via Host header). **FALTA (após NS propagar)**: `bash finalize_pending.sh cfg_replicasderelogiostop.json <TOKEN_CONTA_4>` — faz certbot + HTTPS + SSL strict + WAF baseline (JÁ corrigido, SEM Chrome/150) + purge + IndexNow. `https://replicasderelogiostop.com.br/` já no FINAL de sites.txt.

## 4k. compdistribuidora.com.br — PENDENTE (2026-07-25, staged)

**Template NOVO #16**: distribuidora/atacado B2B (`scratchpad/distrib_template.html`) — azul corporativo #12386b + laranja logística #ff6b1a, fontes **Barlow Semi Condensed + Barlow** (industrial/signage), topbar "distribuição nacional", hero split com painel de stats + selo "Disponível/Ativação imediata" + imagem de galpão/CD, chips de categoria, ranking como **catálogo de distribuição** (código "Cód. IPTV-01", selo "Disponível", barra de estoque/disponibilidade, "Mais distribuído" no líder), 2 CTAs na 1ª dobra. Marca **Comp Distribuidora** (mark "CD"). Canônica **www**. Sem banner. Config: `scratchpad/cfg_compdistribuidora.json`.

**Cloudflare = CONTA 2** (`b7618ea1...`): zona `effd3e573575f1613ba5dc76795c63e9`, status `pending`. Já feito: A apex+www proxied, otimizações + Bot Fight, SSL Flexible. NS `adi.ns.cloudflare.com` / `rayden.ns.cloudflare.com`. **Já staged no VPS** (HTTP 200). **FALTA (após propagar)**: `bash finalize_pending.sh cfg_compdistribuidora.json <TOKEN_CONTA_2>` (certbot + HTTPS + SSL strict + WAF baseline + purge + IndexNow). `https://www.compdistribuidora.com.br/` no FINAL de sites.txt.

## 4l. conviteriadaline.com.br — PENDENTE (2026-07-25, staged)

**Template NOVO #17**: conviteria/papelaria de festa (`scratchpad/convite_template.html`) — pastel blush #d98a9a + ameixa #5b2a44 + dourado, fontes **Gloock + Parisienne (script) + Mulish**, hero split com moldura dourada + selo "4.9" + tag "100% grátis", ranking como **coleção de convites** (cards com borda tracejada, fita "Favorito" no líder, ★★★★★, "nº 01" em script), divisores ❧, 2 CTAs na 1ª dobra. Marca **Conviteria da Line**. Canônica **apex**. Sem banner. Config: `scratchpad/cfg_conviteriadaline.json`.

**Backlinks (planilha `Desktop/conviteriadaline.com.br-backlinks.csv`, 869 links)**: apex 196, www 146, e **`blog.conviteriadaline.com.br` = 527** (Blogger antigo, maior fonte). Canônica = apex. Para capturar o juice do blog: criado A record `blog.` proxied + **Cloudflare Redirect Rule 301 `blog.*` → `https://conviteriadaline.com.br/`** (edge, phase `http_request_dynamic_redirect`) — não precisa de vhost/cert na origem, o 301 dispara antes de chegar ao servidor. www→apex e apex-catch-all seguem no vhost.

**Cloudflare = CONTA 3** (`c86b1054...`): zona `1acba5274fe25a1c17651be3532721b5`, `pending`. A apex+www+blog proxied, otimizações + Bot Fight + SSL Flexible, redirect blog→home. NS `clark.ns.cloudflare.com` / `kate.ns.cloudflare.com`. **Staged no VPS** (HTTP 200). **FALTA (após propagar)**: `bash finalize_pending.sh cfg_conviteriadaline.json <TOKEN_CONTA_3>`. `https://conviteriadaline.com.br/` no FINAL de sites.txt.

## 4m. jcrgs.com.br — PENDENTE (2026-07-25, staged)

**Template NOVO #18**: suíço/internacional tipográfico (`scratchpad/swiss_template.html`) — papel off-white #f4f3ef + preto #141414 + vermelho #e2382c, fontes **Inter (black) + JetBrains Mono**, grid forte com hairlines, hero assimétrico com coluna de meta em mono + tab vermelha "4.9", statbar hairline, ranking como **TOP 10 chart** (numeral gigante Inter black, vermelho no #1, badge "Nº 1", barra de progresso, nota grande), seções numeradas §01–§06. Marca **JCRGS** (wordmark + quadrado vermelho). Canônica **apex**. Sem banner. Config: `scratchpad/cfg_jcrgs.json`.

**Cloudflare = CONTA 4** (`596a5e4f...`): zona `f3b7ae8feb287f6a77dacb60e8fa7c5d`, `pending`. A apex+www proxied, otimizações + Bot Fight + SSL Flexible. NS `major.ns.cloudflare.com` / `mckinley.ns.cloudflare.com`. **Staged no VPS** (HTTP 200). **FALTA (após propagar)**: `bash finalize_pending.sh cfg_jcrgs.json <TOKEN_CONTA_4>`. `https://jcrgs.com.br/` no FINAL de sites.txt.

## 4n. cabecadagua.com.br — STAGED, aguardando token da CONTA 5 (2026-07-25)

**Template NOVO #19**: aquático (`scratchpad/aqua_template.html`) — oceano #0b3d5c + turquesa #12a7bd/#37d0d0 sobre espuma #eff9fb, fontes **Schibsted Grotesk + Hanken Grotesk**, hero com fundo gradiente oceano + **onda SVG** de transição + selo/logo em forma de gota, cards de stats sobrepondo a onda, ranking como **níveis d'água** (medidor/gauge com gradiente aqua = nota%, "Nível de qualidade X%"), 2 CTAs na 1ª dobra. Marca **Cabeça d'Água** (gota 💧). Canônica **apex** (backlinks: apex 200 vs www 45; sem subdomínios). Sem banner. Config: `scratchpad/cfg_cabecadagua.json`.

**Cloudflare = CONTA 5** (`2307797988cf721a700cb98c92db11a7`): zona `5b41a57331475ca542d4b1956dfbf9e4`, `pending`. A apex+www proxied + otimizações + Bot Fight + SSL Flexible **já aplicados**. NS `bruce.ns.cloudflare.com` / `magnolia.ns.cloudflare.com`. **Staged no VPS** (HTTP 200). **FALTA (após propagar)**: `bash finalize_pending.sh cfg_cabecadagua.json <TOKEN_CONTA_5>`. `https://cabecadagua.com.br/` no FINAL de sites.txt.

## 4o. ciadetalentosproducoes.com.br — PENDENTE (2026-07-25, staged)

**Template NOVO #20**: showbiz/palco/produtora (`scratchpad/showbiz_template.html`) — meia-noite azul-roxo #10122b + ouro holofote #ffc94d + rosa palco #ff4d94, fontes **Bebas Neue + Figtree**, hero com holofotes radiais + **luzes de marquise (bulbs)** piscando + tag "Em cartaz", imagem em "poster" com estrela rosa "4.9", ranking como **elenco** (cards com glow de holofote, "★ Nº 01", fita "Estrela" no líder, estrelas), 2 CTAs na 1ª dobra. Marca **Cia de Talentos** (★). Canônica **apex** (backlinks apex 232 vs www 20, sem subdomínios). Sem banner. Config: `scratchpad/cfg_ciadetalentosproducoes.json`.

**Cloudflare = CONTA 5**: zona `ef9033abb8b075a5eb94629ac424c1a2`, `pending`. A apex+www proxied + otimizações + Bot Fight + SSL Flexible. NS `bruce`/`magnolia`. **Staged no VPS** (HTTP 200). **FALTA (após propagar)**: `bash finalize_pending.sh cfg_ciadetalentosproducoes.json <TOKEN_CONTA_5>`. `https://ciadetalentosproducoes.com.br/` no FINAL de sites.txt.

## 4p. leilopora.com.br — STAGED, aguardando conta/token Cloudflare (2026-07-25)

**Template NOVO #21**: casa de leilão (`scratchpad/leilao_template.html`) — bordô #5e1a28 + creme #f6efe1 + dourado #c19a3f, fontes **Marcellus + Karla**, hero com moldura bordô+dourada + plaqueta "Lote 01" + selo dourado "4.9" + faixa de confiança, ranking como **lotes de leilão** (cabeçalho bordô com "Lote Nº 01" + flag "Maior lance/Aberto", nota como "lance", botão "Arrematar grátis"), divisores ◆, 2 CTAs na 1ª dobra. Marca **Leilo Porã** (mark "LP"). Canônica **apex** (sem planilha). Sem banner. Config: `scratchpad/cfg_leilopora.json` (cf_account/zid vazios — preencher quando o usuário mandar a conta).

**Cloudflare = CONTA 5** (`2307797988...`): zona `6e6a873e136e8259cd9927c7568b2faf`, `pending`. A apex+www proxied + otimizações + Bot Fight + SSL Flexible **já aplicados**. NS `bruce`/`magnolia`. **Já staged no VPS** (HTTP 200). **FALTA (após propagar)**: `bash finalize_pending.sh cfg_leilopora.json <TOKEN_CONTA_5>`. `https://leilopora.com.br/` no FINAL de sites.txt.

**NOTA build**: a leitura inline de prompts do cfg via `python3 -c "json.load(open(...))"` quebra no Windows (cp1252) quando o cfg tem acento (ex.: "Cabeça d'Água" byte 0x81 de "Á"). Sempre usar `io.open(...,encoding='utf-8')`. O `build_lote3.py` já usa utf-8; o erro foi só no gerador de imagem inline.

## 4.x — ticketson.com.br (30/07/2026)

- **Canônica**: **www** `www.ticketson.com.br` (decisão do usuário — o domínio original era www; embora backlinks apex 1570 > www 1095, o 301 apex→www transfere o juice). 2.665 backlinks em `ticketson.com.br-backlinks.csv`. Anchors históricos: carrossel, circo-do-chaves, luis_miguel.html, chicshow.html, "tickets on" — domínio expirado de **ingressos/eventos**.
- **Tema/layout**: bilheteria/ingressos — template NOVO `ticket_template.html` (veludo bordô #6d1324 + dourado #e6b84f, fonte Anton; hero em forma de INGRESSO com serrilha, "ADMITE UM · TESTE IPTV", código de barras, sessão/acesso). Marca **TicketsOn**. Genuinamente diferente (não é recolor).
- **SEO**: title keyword-first, meta keywords ~756 chars, H1 "Teste IPTV grátis", guia com 5 H3, FAQ+chips+schema (WebSite/Organization/CollectionPage/ItemList/FAQPage) do cieh com dom/brand trocados. Vocabulário próprio (bilheteria/ingresso/sessão/camarote). CTA 1ª dobra validado (desktop 1280x900 + mobile 390x780).
- **Deploy**: **Cloudflare Pages** (projeto `ticketson`, conta Endrick 011fa32b), NÃO VPS. DNS CNAME apex+www → `ticketson.pages.dev` (proxied). **apex→www** (canônica www) + **301 catch-all** (backlinks antigos → www home) via **Redirect Rules no edge** (phase `http_request_dynamic_redirect`; catch-all no host www exclui `/`, `/imagens/*`, key `.txt`, sitemap/manifest/favicon/404). ATENÇÃO ao trocar canônica: 301 antigos ficam CACHEADOS no edge — purgar tudo e testar com `?v=rand`. Deploy via `wrangler pages deploy` (token com Pages Edit = `cfut_reEz...` analytics; token WAF Endrick NÃO faz Pages). Security medium + skip Google + security headers.
- **IndexNow**: submetido (chave `<<REMOVIDO>>`, key file excluído do catch-all + cache purgado). Verificado: home 200, backlinks→301 home, assets 200, www→apex 301.

## 5. Keywords importantes (Google Search Console — rblc.com.br)

Fonte: `rblc.com.br-Performance-on-Search-2026-07-17.zip` (Consultas.csv). Usar o MÁXIMO destes termos nas landing pages da rede. Top 100 por cliques:

```
iptv · teste iptv · iptv teste · iptv teste gratis · iptv gratis · lista iptv · iptv teste grátis ·
teste iptv gratis · teste gratis iptv · lista iptv gratuita · teste grátis iptv · iptv 2026 ·
teste de iptv · iptv teste 7 dias · lista iptv gratis · iptv teste grátis 1 mês · iptv grátis ·
teste iptv grátis · teste iptv 6 horas · teste iptv 24 horas · iptv agora · teste iptv 15 reais ·
iptv online · iptv brasil · melhor iptv 2026 · iptv barato · iptv lista · lista iptv 2026 ·
teste iptv 7 dias · lista iptv grátis · iptv teste 10 reais · lista de iptv · iptv 10 reais ·
iptv testes · teste grátis de iptv · iptv barato 10 reais · iptv gratuito · lista iptv teste ·
teste iptv roku 7 dias · teste iptv smart tv · lista iptv m3u · testar iptv · teste iptv 12 horas ·
iptv test · teste iptv 2 horas · melhor iptv · canais iptv · teste iptv 2026 · melhores iptv ·
test iptv · lista m3u iptv grátis · listas iptv · teste iptv 8 horas · ip tv · iptv gratis para tv ·
teste grátis · ssiptv · iptv 20 reais · iptv 10 reais 2026 · lista de canais iptv grátis ·
teste iptv tv roku · iptv 15 reais · teste de iptv 2026 · teste de iptv gratuito · lista de canais iptv ·
lista de iptv gratuita · iptv gratis teste · lista iptv m3u canais fechados · teste iptv roku ·
iptv teste gratuito · iptv teste automático · teste gratis · teste gratuito iptv ·
iptv teste grátis 3 dias · iptv teste 2026 · iptv grátis para android · iptv com teste grátis ·
teste gratis iptv smart tv · iptv 24h · teste iptv 6 dias · melhores iptv 2026 · iptv comprar ·
lista iptv atualizada · iptv teste 6 horas · iptv pago · comprar iptv · iptv assinar ·
teste iptv xciptv · teste lista iptv · teste xciptv · tv iptv · lista de iptv 2026 · assinar iptv ·
lista teste iptv · teste de iptv grátis · iptv contratar · teste iptv automático · iptv 6 horas ·
iptv 7 dias grátis
```

**Clusters de maior volume (priorizar):**
- **Lista / M3U** (~145 queries): lista iptv, lista iptv gratuita, lista iptv m3u, lista de canais iptv, lista iptv 2026, lista iptv canais fechados, lista iptv atualizada.
- **Duração**: 6 horas (36), 7 dias (33), 24 horas (15), 2 horas (13), 12 horas (11), 8 horas (6), 3 dias, 6 dias, 1 mês, 24h.
- **Preço**: iptv barato, 10 reais, 15 reais, 20 reais.
- **Dispositivos**: roku (34), tv box (19), celular (18), samsung (12), android (12), lg, smart tv, pc, iphone.
- **Apps/players**: xciptv (27), smarters (10), ssiptv (8), tivimate, xtream, player.
- **Ano/Geo**: 2026 (76), brasil (44), online (14), agora (7).
- **Canais/Conteúdo**: canais (45), 4k (10), filmes, séries, futebol/esportes.
- **Comercial**: comprar iptv, assinar iptv, contratar iptv, iptv pago.
- **Telegram**: lista iptv telegram, grupos/canais.

---

## Convenção para os PRÓXIMOS sites (sempre seguir)

1. Ao criar uma nova landing page, adicionar a URL canônica otimizada (https, apex, barra final) no FINAL de [sites.txt](sites.txt) — ordem de criação.
2. Atualizar este REGISTRO.md com uma nova subseção do site (seção 4 em diante): domínio, data, ranking→provedores, particularidades.
3. Reaproveitar as keywords acima (SEO agressivo), layout diferente por site, mesmos dados, banner rodapé fixo, sem GA.

**Template NOVO #22**: estúdio de design criativo (`scratchpad/studio_template.html`) — **DARK/black** #0e0d11 + painel #17151d + vermilion #ff4a1c + texto creme #efeae0, fontes **Syne + Manrope + Space Mono**, grão sutil (overlay), hero split com glow radial vermilion + caixa IPTV vermilion com sombra dura + selo "4.9" + marquee/ticker vermilion + entrada com stagger (rise) + micro-interações (hover shadow vermilion); ranking com **card destaque pro Nº 1**, ranking como **índice criativo** (cards arredondados, nº grande, barra pill, líder invertido em tinta com badge "Nº 1", botão "Acessar" pill), 2 CTAs na 1ª dobra ("Testar IPTV agora" vermilion + "Ver o ranking ↓"), footer com cantos arredondados. Marca **Estúdio Uni Design** (monograma "Ʉ"). Canônica **apex**. Sem banner. Conta 011fa32b (conta26/Endrick), zona c85067714b7f0dc22d0bb9dd5af4e9ca. Config: `scratchpad/cfg_estudiounidesign.json`. Deploy Cloudflare Pages (projeto estudiounidesign), DNS apex+www→pages.dev, Redirect Rules www→apex + 301 catch-all, WAF skip-Google + anti-scanner + headers + security medium, IndexNow 202.

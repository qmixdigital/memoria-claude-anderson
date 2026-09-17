---
name: reference_mapa_do_site_link_interno
description: "Mapa do site HTML da rede (/mapa-do-site/ via mu-plugin qmix-html-sitemap.php). CRÍTICO: o link 'Mapa do Site' no rodapé é INTERNO e PERMANENTE (SEO), NÃO é backlink send-remove — NUNCA remover em limpezas de link externo/backlink."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-26T22:29:25.466Z
---

# Mapa do site HTML da rede + link interno no rodapé (27/07/2026)

Sistema de mapa do site HTML (estratégia SEO: página real crawlável que passa autoridade, tipo o que o llms.txt deveria ser). Implementado a pedido do Anderson.

**Arquivo (v6, ANTI-FOOTPRINT):** um único mu-plugin **`html-sitemap.php`** (durável em `D:\SISTEMAS\MinhasHospedagens\scripts\html-sitemap.php`). Nome de arquivo/shortcode SEM marca. Substituiu os antigos `qmix-html-sitemap.php`/`adon-html-sitemap.php` (branded, REMOVIDOS dos 4 sites — carimbavam `<!-- QMIX-SITEMAP-INTERNAL-LINK -->` e classe `qmix-sitemap-footerlink` no HTML público = assinatura grep-ável entre portais).

**Como evita padrão detectável (footprint de rede):** o MESMO arquivo-fonte renderiza HTML DIFERENTE por domínio. `qsm_fp()` deriva de `md5(host)`: prefixo de classe único (`qXXXX`), slug, âncora do rodapé, título H1, cor de link, raio e **variante de layout (0/1/2)** — tudo determinístico por site. Verificado: adonline=`qd37a`, advivo=`qa495`, azul=`qe3b3`, agencianacional=`qe546`, âncoras variadas. (Pools de slug/âncora têm ~9-10 opções; ao rodar em ~100 sites, AMPLIAR os pools p/ reduzir colisão de âncora — classes/layout já divergem sempre.)

**Componentes por site:**
- **Auto-provisiona a própria página**: hook `wp_loaded` reutiliza `/mapa-do-site/` legada se existir (preserva URL indexada dos 4 já feitos), senão cria com slug variado; guarda `qsm_page_id` em option. NÃO precisa mais de SQL manual pra criar a página.
- Lista TODOS os posts por editoria via **`$wpdb` direto** (dribla o filtro `hf-*` que exige _thumbnail_id).
- **Auto-purge**: `transition_post_status`/`deleted_post` → `litespeed_purge_post/url` da página do mapa (inclui Antônio/REST).
- H1 próprio dentro do `.qXXXX` (esconde `h1.entry-title` do tema).
- wp-cli desses sites trava no full-load em CLI → deploy via base64/SSH + hit no homepage pra provisionar (opcache valida por mtime, recompila sozinho).

## ⚠️ CRÍTICO — o link do rodapé NÃO é backlink send-remove
Cada página ganha, via `wp_footer`, um link INTERNO (`class="qXXXX-fl"`, `rel="internal"`, âncora variada) pro próprio `/mapa-do-site/`. **NUNCA remover em limpezas de backlink/link externo.** É INTERNO e PERMANENTE. Já é seguro por natureza: `wp oie audit-links --domain=X --remove` mira **domínios externos** em `post_content`; este link é interno e vem via `wp_footer`. **A proteção "não remover" vive SÓ no comentário PHP do mu-plugin + nesta memória — NUNCA emitir marcador de marca no HTML público** (recriaria o footprint). Registrado aqui pra zero ambiguidade em sessões futuras.

## Rollout (26/07): TODA a rede WP coberta (~89 portais nas 4 hospedagens Hostinger)
Deployado filtrando pelo **allowlist** `D:\SISTEMAS\MinhasHospedagens\rede-publicacao-allowlist.txt` (104 domínios WP; NÃO inclui clientes):
- **anderson-gna** (u400588174): 36 portais (inclui qmixdigital.com.br, cuja versão LIVE está aqui, não na pasta dormante do hostverge).
- **qmix** (u463007860): 5 portais.
- **vps1** (u651115354): 26 portais.
- **hostverge** (20i/stackcp, user qmix.com.br): 23 pastas.

**Deploy = dropar `html-sitemap.php` em `wp-content/mu-plugins/` + hit no homepage (`?nc=RANDOM` força PHP → auto-cria página + link).** Todos verificados renderizando classe/âncora/slug ÚNICOS por domínio.

**ARMADILHAS aprendidas no rollout:**
- **SEMPRE filtrar pelo allowlist**, NUNCA por heurística de nome. Deployei por engano em 2 CLIENTES (belemduartealmeida.com.br, itacaiugo.com.br) e tive que reverter (rm mu-plugin + DELETE da página via SQL por `qsm_page_id` + DELETE da option + purge). Clientes têm nomes "de portal" (belem..., itacaiugo, pael, carretaspresidente, energiaeficiente, comprarvisualizacoes) — só o allowlist distingue.
- **hostverge (20i) colapsa env var multilinha em 1 linha** → passar allowlist como **base64** e decodificar em arquivo no servidor, grep contra o arquivo. Pastas do hostverge são SEM TLD (`exquisito`→`exquisito.com.br`): casar por `^folder(\.|$)` contra o allowlist.
- Muitos domínios do allowlist WP dão 301→www (professortic/olharmoderno/tribunalpopular): o mu-plugin roda no www normalmente, verificar com `curl -L`.
- "VAZIO" na verificação = quase sempre cache HTML (LiteSpeed HIT) servindo cópia pré-provisionamento; `?nc=RANDOM` mostra a verdade; provisionamento já persiste em option, então qualquer MISS futuro re-cacheia com o link.

## Portal-engine (não-WP, srv1166087): mapa NATIVO no motor — FEITO (26/07)
Os 12 portais do motor (romanceseleituras, projetob, todossomosgeek, jornaldiario, medicodasmaos, diariodatv, diariodegoiania, diariodobrejo, entrenoticia, edenoticias, folhaum, gdsnoticias) ganharam o mapa via `sitemapMeta()`/`sitemapPageHtml()` em `D:\SISTEMAS\portal-engine\src\render.js` (deploy: cat-pipe → /opt/portal-engine, `systemctl restart portal-engine`, rebuild como user `portais`). Página crawlável com TODOS os artigos por editoria (herda arquétipo do site), link interno no rodapé via `H.instLinks` (sem tocar archs.js), entrada no sitemap.xml, regenera a cada publish. Anti-footprint: slug/âncora/título via `hashSeed(slug)` (mesma ideia do mu-plugin WP). Verificado HTTP 200 nos 5 archs. Regras do motor: SEMPRE restart após editar src/, rebuild NUNCA como root (runuser -u portais). Ver [[reference_portal_engine_html]].

## DOIS portal-engine (instâncias divergentes) — ambos com o mapa (26/07)
Investigação fechou o mistério dos 8 domínios "sumidos": as pastas Hostinger deles estão com stub `<!-- descomissionado -->`; a origem real é um **SEGUNDO portal-engine na opengravity** (systemd `portal-engine`, user `portais`, /opt/portal-engine + /srv/portais). sites.json da opengravity: wtw19, girodasnoticias, jornaldebarcelos, nerddahora, noticias9, noticiasdasemana, noticiasgoias, osertaoenoticia, portalnoticiasbh (9).

⚠️ **Os dois motores DIVERGIRAM** (código diferente, md5 distinto): o de **srv1166087** = espelho do repo local `D:\SISTEMAS\portal-engine` (classe `prefix-k`); o de **opengravity** é mais novo/maior (724 linhas) — usa `classToken(salt,k)` (classe hasheada por-chave, sem prefixo comum) + `categoryBase`/`H.curl` (URL de categoria tipo `/Categoria/slug/`). NÃO existe repo local espelhando a opengravity. Apliquei a MESMA feature de mapa nos dois, mas por caminhos diferentes: no local/srv editei direto; na opengravity portei via transform (URLs de categoria com `ctx.H.curl`, artigo com `ctx.H.url` — respeita categoryBase). Cópia do render.js divergente (já com a feature) em `D:\SISTEMAS\MinhasHospedagens\scripts\portal-engine-opengravity\render.js`; backup remoto `render.js.bak-20260726`.

**Regra p/ futuras mudanças no motor:** aplicar nos DOIS (srv1166087 E opengravity), cada um no seu codebase; NUNCA sobrescrever um com o render.js do outro (regride classToken/categoryBase). Restart systemd + rebuild como `portais` em cada. O `cfPurge 401 Authentication error` no rebuild da opengravity é ESPERADO (token CF read-only) — ignorar.

## Clientes TAMBÉM receberam o mapa (26/07) — regra: posts+páginas publicados > 20
Anderson pediu aplicar o mesmo mu-plugin nos **sites de cliente** (antes excluídos) que tenham >20 posts+páginas. Diversificação por domínio já evita padrão. **17 clientes ativos com o mapa:**
- Hostinger: pneusemgoiania.com.br (1041), blog.aplusplatform.com (137), itacaiugo.com.br (94), advdobrasil.com.br (85), blog.advdobrasil.com.br (81), comprarvisualizacoes.com (50), pael.com.br (126), qmiximoveis.com.br (96).
- opengravity `/home/qmix/web/` (Jannah, chown qmix:www-data): blog.ombrogoiania (217), blog.nutricionista.digital (31), blog.drtiagobernardes (129), blog.drthiagotredicci (188), blog.camilafarias (76).
- srv1166087 `/home/boot/web/` (chown boot/www-data): blog.cirurgiadojoelhogoiania.com (436), blog.coegoiania.com.br (630), cirurgiadecolunagoiania.com.br **/blog** (321), drbrunoair.com.br **/blog** (186) — os 2 últimos são WP em SUBPASTA /blog (home_url = domain/blog/, mapa em /blog/<slug>/).

**Pulados <20:** belemduartealmeida (4), carretaspresidente (12), energiaeficiente (17), tratamentodor (19), arlaproducao (5).
**comprarsites.com:** WP dormante (69 no DB) mas o live é landing HTML custom (sem wp-includes) → mu-plugin instalado porém INERTE; fora do escopo. Peritodicas.com apareceu no /home/qmix/web mas NÃO está na lista de clientes nem allowlist → não tocado.

**Pegadinha hostverge:** DB é REMOTO (socket local falha) — sempre usar `mysql -h"$DB_HOST"` extraído do wp-config. Localização dos clientes médicos: opengravity `/home/qmix/web/<dom>/public_html`, srv1166087 `/home/boot/web/<dom>/public_html[/blog]`. Contagem via SQL direto (COUNT post_status=publish AND post_type IN post,page).

## Variante CLIENTE do mu-plugin (sem "notícias"/"portal") — 26/07
Clientes só têm ARTIGOS/matérias/conteúdos, NÃO notícias. Anderson pediu pools sem termos de notícia/portal. Criada **`D:\SISTEMAS\MinhasHospedagens\scripts\html-sitemap-cliente.php`** (= a de portal com 8 termos trocados NAS MESMAS POSIÇÕES pra não remapear quem já estava bom: slug `arquivo-de-noticias`→`arquivo-de-artigos`, `todas-as-noticias`→`todos-os-conteudos`; âncora `Mapa do portal`→`Mapa do conteúdo`, `Arquivo de notícias`→`Arquivo de artigos`, `Todas as notícias`→`Todos os conteúdos`; título `...do Portal`→`...do Site`, `Índice de Notícias`→`Índice de Artigos`). **Portais da rede continuam com a versão notícia** (`html-sitemap.php`) — lá "notícias" é keyword boa. Os 17 clientes rodam a variante; só 5 tinham termo news/portal (pael, ombrogoiania, cirurgiadecoluna nos SLUGS; advdobrasil, drbrunoair nas âncoras). Ao trocar slug: apagar a página+option antiga (SQL por qsm_page_id) pra não deixar órfã, depois reprovisionar.

## ⚠️ PEGADINHA CRÍTICA: Redis Object Cache nos blogs de cliente (opengravity/srv HestiaCP)
Os blogs Jannah em opengravity/srv usam **Redis Object Cache** (drop-in object-cache.php + plugin redis-cache; rodapé do HTML tem "Performance optimized by Redis Object Cache"). `get_option('qsm_page_id')` e o post vêm do REDIS. Depois de apagar página+option no MySQL, o Redis serve o valor VELHO → o mapa continua no slug antigo. **opcache reset, reload FPM E reload Apache NÃO resolvem** (o arquivo nem entra no opcache — `file_not_in_opcache`; código roda fresco mas lê Redis velho). FIX: **`runuser -u <owner> -- wp cache flush --path=<publichtml>`** (owner=qmix no opengravity, boot no srv) → depois reprovisionar. Sempre que mexer em option/post desses blogs via SQL direto, dar wp cache flush. NÃO usar FLUSHALL no redis-cli (Redis compartilhado entre sites).

## Balanceamento de categorias: feito SÓ no adonline (task por-site, precisa dry-run + revisão de relevância).

Relacionado: [[sistema-de-remo-o-de-links-externos-da-rede-qmix]] (o oie-link-audit que NÃO deve pegar este link), [[project_backlink_send_remove_strategy]], [[reference_hf_mu_plugin_esconde_acervo]] (o filtro que o $wpdb dribla).

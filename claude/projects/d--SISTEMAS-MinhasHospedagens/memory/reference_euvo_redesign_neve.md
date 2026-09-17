---
name: reference_euvo_redesign_neve
description: "euvo.com.br trocou Jannah -> Neve (child portal-euvo-com-br) em 15/07/2026; logo migrada p/ custom_logo do core (1021); home estática 1014 preservada por causa do title do SEOPress."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**euvo.com.br** (hostinger-vps1, `/home/u651115354/domains/euvo.com.br/public_html`) — redesign total via skill `wp-news-frontpage` em **15/07/2026**. Jannah 7.6.4 → **Neve** + child **`portal-euvo-com-br`**.

**Roll:** archetype A (jornal clássico) | single IV_sidebar_rich | archive delta_hub | header H1_classic_3row | footer F2_classic_4col | palette P18 (#D62828/#F77F00/#FCBF49/#FFF5E1) | fonts F19 (Libre Caslon Display + Spectral, **auto-hospedadas** em `assets/fonts/`, 6 woff2) | prefixo de classe **`ev-`** (não `oie-`).

**Correções ao roll, forçadas pela realidade (já gravadas no fingerprint-rolls.json):**
- `comments_treatment: facebook` → **disabled**: o site tem 0 comentários, 0 post com `comment_status=open`, sem App ID do FB.
- `adsense_set: B` → **none**: nenhum `ca-pub-` no site. **Não plantei placeholder** (foi o bug que deixou o adonline sem monetizar).

**Preservado de propósito (o operador pediu "manter logomarca e favicon"):**
- **Logo**: era `tie_jannah_options['logo'...]` (opção de tema, morre na troca). Migrada para o **`custom_logo` do core, anexo 1021** (`logo-marca-euvo-news.webp`, 500x80). Gravei em `theme_mods_portal-euvo-com-br` **antes** de ativar, para não haver instante sem marca. `functions.php` tem `add_theme_support('custom-logo')` e o header usa `the_custom_logo()`.
- **Favicon**: `site_icon = 1048` é opção do core, sobrevive sozinho.

⚠️ **`show_on_front=page` + `page_on_front=1014` MANTIDOS.** A 1014 é a `tiehome` do Jannah, **conteúdo vazio (0 bytes)**, mas carrega o **title e a description da home no SEOPress** ("EUVO News – Notícias, Esportes, Novelas e Lançamentos do Brasil"). O `install_portal.py` faria `option update show_on_front posts` e **derrubaria esse title indexado** — por isso **não rodei o instalador**, fiz o deploy à mão. Se for reinstalar, pular `apply_settings`.

**Menus** (as localizações do Jannah morrem na troca): menu **26** ("Header", 6 categorias) → `ev_primary`; menu **22** ("TieLabs Secondry", 7 páginas institucionais) → `ev_footer`. O menu 26 lista Mundo (0 posts) e Tecnologia (5) e **não** lista Shows (990) nem Entretenimento (587) — desalinhado com o acervo, mas é escolha editorial do cliente, não mexi.

**Wellness (cat 31) bloqueada da home** a pedido do operador, via `ev_hidden_cats()` em `inc/helpers.php` (alimenta hero, abas, blocos, últimas, mais lidos, rodapé). A página `/categoria/wellness/` segue no ar. Obs: o mu-plugin `hf-ee6e19.php` já excluía 31 e 32 da *main query*, mas a home nova usa queries próprias, por isso o Wellness aparecia. Ver [[reference_hf_mu_plugin_esconde_acervo]].

⚠️ **ARMADILHA DE CASCATA DO NEVE (vale p/ qualquer portal novo com Neve).** O `neve/style.css` é **só o cabeçalho do tema**; o CSS real é o handle **`neve-style`** (`style-main-new.min.css`) + um inline gigante. Depender de `neve/style.css` no `wp_enqueue_style` faz o filho ser impresso **antes** do pai, e o pai vence em `body`, `img`, `a:hover`, `button`. Resultado no euvo: o site rodou **Arial sobre branco a 15px**, identidade toda morta, apesar do CSS do filho estar correto.

Fix em 2 camadas (aplicado):
1. `add_action('wp_enqueue_scripts','ev_assets',20)` + dep condicional em `neve-style` (`wp_style_is(...,'registered')` antes — declarar dep de handle não registrado faz o WP **não imprimir** a folha).
2. **Reapontar as variáveis do Neve** no `:root` do filho, em vez de brigar por especificidade: `--bodyfontfamily`, `--bodyfontsize`, `--bodylineheight`, `--nv-site-bg`, `--nv-text-color`, `--nv-primary-accent`, `--nv-secondary-accent`. Aí o CSS do pai passa a pintar as cores certas sozinho.
   - `--maxwidth: 100%` é **obrigatório** no `:root`: o Neve só define em `.builder-item--logo` mas aplica `img{max-width:var(--maxwidth)}` global; fora daquele escopo a declaração fica inválida e a imagem estoura.
   - **NÃO** sobrescrever `--container`: o Neve o remapeia por breakpoint (748/992/1170) e um valor chapado no filho atropela os três.

⚠️ **`order: 0` não tira a mídia da frente.** O `.ev-card__body` vem primeiro no HTML (manchete antes da imagem, por a11y) e vale `order: 0`; `order: 0` na mídia **empata** e o empate resolve pela ordem do código. Tem que ser **`order: -1`**. Sintoma: na variante compacta o texto ia pra coluna de 96px e a imagem pra coluna larga.

⚠️ **Especificidade home.css vs style.css.** `.home .ev-hero__box` (0,2,0) do `home.css` ganha de `.ev-hero__box` (0,1,0) do `style.css` **mesmo o style.css vindo depois**. Isso derrubou a manchete sobreposta para fora da foto, já com a cor de fundo escuro: **título branco sobre fundo branco, invisível**. Só apareceu no screenshot, não no lint.

⚠️ **Chrome headless no Windows trava a janela em ~500px.** `--window-size=390` **recorta** um layout de 500px em vez de reflow: parece estouro horizontal que não existe. Para mobile de verdade: salvar o HTML local (o dele já usa URLs absolutas), injetar `<base href>` e enquadrar num iframe de 390px — o site tem `X-Frame-Options: SAMEORIGIN`, então iframe direto do domínio não funciona.

**Direção visual (2ª rodada, operador disse "não está bonito"):** a 1ª versão embrulhava cada matéria/widget em `background + border 1px + radius 4px` = parede de caixas, visual de framework genérico brigando com a premissa (Libre Caslon sobre papel creme, arquétipo jornal clássico). **Jornal não tem caixa, tem fio.** O que resolveu:
- Card e widget **sem fundo/borda/radius**, assentados no papel; quem separa é hairline (`border-top: 1px`), quem abre editoria é fio pesado **em cima** (`border-top: 3px` na `.ev-section__h`, não embaixo).
- Grade **sem gap**, com fio de calha: `border-top` em toda célula + `border-left` só nas que não abrem linha (`:nth-child(2n)` p/ 2 col, `:not(:nth-child(3n+1))` p/ 3 col). **Refazer a regra em cada breakpoint**, senão o fio fica na coluna errada.
- Escala com vão de verdade: chamada `clamp(27px,2.7vw,38px)` vs secundária 18px vs compacta 15px (antes tudo entre 12 e 27 = papa sem hierarquia).
- **Newsletter é a única caixa da página**, de propósito: com o resto no papel, o bloco sólido lê como encarte, que é o que ele é.
- Secundária de jornal **não tem resumo** (só manchete + data): com resumo, frase cortada no meio e alturas irregulares.
- Grão de papel: SVG `feTurbulence` embutido em `body::before`, opacity .032, `pointer-events:none` (senão engole todo clique).
- Miniatura **1:1** (o 21:9 do roll fica em hero/chamada: a 38% de coluna de 380px ele vira tira de 60px).

⚠️ **`max-height` + `aspect-ratio` não corta, encolhe**: a foto saiu 135px mais estreita que a coluna. Para recortar: `aspect-ratio: auto` + `height` fixo + `object-fit: cover` na img.

⚠️ **`wptexturize` roda no `the_title` e sai na frente**, trocando hífen ASCII por `&#8211;`. Filtro que só procure o caractere não acha (o que sobrou termina em `;`). O `ev_tidy_title` (tira traço solto do fim das manchetes do importador) usa prioridade **20** + padrão cobrindo caractere **e** entidade, e exige espaço antes p/ não mutilar `COVID-19`/`pós-jogo`.

**Sidebar:** o arquétipo A previa anúncio no 3º terço, mas sem AdSense virava ~2.000px de vazio. Preenchido com **Editorias** (índice + contagem) e **Do Arquivo** (4 cards `sm` aleatórios >90d). As 12 tags do site têm **count 0** (nada etiquetado), por isso o widget de tags nunca renderiza.

**Views:** usar **`<<REMOVIDO>>`** (mu-plugin do Antônio, cobre 4.719 posts). O `tie_views` era do Jannah e **parou de contar** na troca.

**Backup de reversão:** `~/euvo-pre-neve-20260715-151806/` (7,7 MB) com `jannah-parent.tar.gz` (**tema pago, não está no wp.org, sem isso não dá pra voltar**), `jannah-child.tar.gz`, theme_mods, tie_options, options-críticas. `wp db export` **não gera arquivo** nesse host (falha silenciosa apesar de o mysqldump existir).

**Antônio intacto:** rotas `/f9b8-api/v1/artigos` + `/stats-ee6e19/v1` + `/stats-ee6e19/v1/view` idênticas antes/depois; 0 mu-plugin tocado; 0 post alterado.

Relacionado: [[reference_incidente_euvo_backdoor]], [[reference_antonio_endpoint_recovery]].

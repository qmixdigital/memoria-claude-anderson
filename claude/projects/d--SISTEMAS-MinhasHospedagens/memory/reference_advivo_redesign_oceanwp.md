---
name: reference_advivo_redesign_oceanwp
description: "Redesign do advivo.com.br (child OceanWP portal-advivo-com-br) em 09/08/2026 - roll da skill, desvios conscientes e ganhos medidos"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T23:25:10.255Z
---

Portal refeito do zero em 09/08/2026 com a skill `wp-news-frontpage`. Fica em `hostinger-anderson-gna`, child theme **`portal-advivo-com-br` sobre OceanWP**, 3.980 posts. Backup do tema anterior em `~/backups-skill-advivo-20260809.tgz` no servidor; fonte versionada em `C:\Users\User\.claude\skills\wp-news-frontpage\generated\advivo.com.br\`.

Roll (registrado em `data/fingerprint-rolls.json`): front **B** com hero triptico, single **III**, archive **gamma**, header **H3**, footer **F3**, palette **P14**, fontes **F05** (Cormorant Garamond + Roboto), spacing comfortable, radius mixed, shadow bold.

**Três desvios conscientes do roll**, todos documentados aqui para quem regerar não "consertar" de volta:
1. `sidebar: left` virou sidebar à direita. A regra 1 da skill exige o conteúdo principal antes do `<aside>` no fonte, e reordenar por `grid-column` é justamente o que ela proíbe.
2. `menu_position_in_header: hidden_burger` virou menu visível no desktop + drawer só no mobile. Portal de notícia com menu escondido no desktop é ruim de navegar, e [[feedback_wp_news_frontpage_sem_menu_mobile]] já registrou portal da rede sem menu mobile nenhum.
3. Nenhum `<ins>` de AdSense foi gerado. Slot de placeholder **nunca preenche** (ver [[reference_adsense_loader_rede_qmix]]); o site fica com o loader do mu-plugin e depende do Auto Ads. O advivo está na lista autorizada de [[feedback_adsense_somente_lista_autorizada]].

O que o layout antigo tinha de errado, e foi corrigido: o menu apontava para categorias vazias (Blog com 1 post, Mundo com 5) e **ignorava as maiores** (Insights 1.293, Notícias 810, Entretenimento 679, Dicas 513). A barra de editorias agora é gerada por contagem real. A tagline tinha travessão, trocado por vírgula.

**Enxugar o OceanWP rendeu mais que o layout.** O bundle do parent (theme.min.js, drop-down menu, drop-down search, magnific-popup, flickity, ow-slider, scroll-effect, scroll-top, select) não é usado por nenhum template do child. Dequeue desses handles mais `imagesloaded` e jQuery condicional levou a home de **13 scripts para 1** (só o AdSense) e 1 CSS. O handle do popup é `ow-magnific-popup`, não `magnific-popup`.

**Lazy-load: a regra 3 da skill, aplicada ao pé da letra, custou caro.** Forçar `eager` nas 47 imagens da home deu LCP de laboratório de 6,7s no mobile. O ajuste foi eager só acima da dobra (hero com `fetchpriority=high` + bloco "Em Alta", 7 imagens) e lazy nas outras 41. O espírito da regra (nada de imagem "pipocando" na dobra) continua valendo.

Medição final (PSI mobile): **SEO 100, A11y 96, CLS 0, TBT 20ms, Perf 68**. O LCP de laboratório fica em ~6,8s porque o Lighthouse simula 4G lento sobre 100KB de HTML, mas o **campo real (CrUX) marca LCP 1,78s FAST** e o TTFB medido é 130-160ms com LiteSpeed hit. Ao reavaliar esse portal, olhar o campo, não o laboratório.

Schema: o Rank Math já emite `CollectionPage` com `@id .../#webpage` na home. O template emite **apenas `ItemList`** dos destaques; emitir CollectionPage de novo criava dois nós de página.

**Duas armadilhas achadas na revisão visual (09/08, mesma noite):**

1. **Especificidade derrubou a cor do rodapé.** A regra base `.av h2` (0,1,1) vence `.av-news__h` (0,1,0), então o título "Receba as principais notícias" saía com a tinta escura do corpo sobre o roxo do rodapé, praticamente ilegível. O mesmo nos `<h3>` das colunas. Corrigido subindo para `.av .av-news__h` e adicionando a trava `.av-foot h1,h2,h3,h4 { color: inherit }`. Ao criar tema com título colorido dentro de bloco escuro, conferir especificidade antes de achar que a cor "não pegou".

2. **O Auto Ads injeta bloco DENTRO do `<header>`.** Apareceu um banner à esquerda da marca que espremeu o menu na vertical. Esconder por CSS fere a política do AdSense (anúncio servido não pode ser ocultado), então a saída foi **reposicionar**: `grid-template-areas` no masthead com uma faixa `anuncio` própria, mais `flex: 0 0 100%; order: 9` para o caso de o bloco cair dentro de um dos lados. O anúncio continua visível e clicável, só que numa linha abaixo. O corte de verdade daquela inserção é no editor de posicionamentos do painel do AdSense.


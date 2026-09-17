---
description: Redesenha/melhora o design de um site com Fable 5 + skills de design + a experiência da rede QMIX (identidade própria, sem Fraunces, aprovação por screenshot antes de aplicar)
argument-hint: <url | caminho do projeto | o que redesenhar> [+ o que te incomoda]
---

Você está rodando o workflow de melhoria de design da QMIX. Alvo: **$ARGUMENTS**

Objetivo: entregar um redesign **distintivo e production-grade** — nunca a cara genérica de "AI default" — usando **Fable 5** pra geração criativa, as **skills de design** (incluindo `logo-design` quando houver marca) pro craft, e as **lições acumuladas** abaixo. **Aprovar por screenshot antes de aplicar no site de verdade.**

## 1. Carregar o craft (antes de gerar qualquer coisa)
Invoque as skills de design ANTES de gerar:
- `frontend-design` (UI distintiva, production-grade)
- `taste-skill` (anti-slop: leitura do brief, "design read", dials variância/motion/densidade, anti-default)
- `impeccable` (auditoria/polimento: hierarquia, espaçamento, cor, tipografia, motion, AA)
- `awesome-claude-design` (referência de gosto: escolher família estética + puxar um DESIGN.md de referência — `prompts/family-picker.md`)
- `web-design-guidelines` (auditar o resultado contra as Web Interface Guidelines da Vercel — use ao revisar/validar)
- se for responsivo/mobile: `mobile-design`
- se o alvo envolve logo, símbolo, favicon ou ícone: `logo-design` (SVG à mão, variante dark, preview em 16/32/64 — ver seção 3)
Siga o que elas dizem. Se houver `superpowers:brainstorming`, use pra alinhar a direção antes.

**O que essas skills NÃO cobrem:** o `taste-skill` declara no escopo *"Not dashboards, **not data tables**, not multi-step product UI."* Se o alvo tem tabela com muitas linhas, listagem paginada, número grande no celular ou painel, essas skills cuidam só do hero e da identidade — e o design volta reprovado justamente na parte densa. Nesse caso leia junto **`diretorios-do-zero/references/design-diretorio.md`**.

## 2. Entender o alvo
- Se `$ARGUMENTS` for URL: baixe (User-Agent de navegador completo) e **screenshote o estado atual** (Chrome headless, desktop 1280 + mobile 390) pra ver o que existe.
- Se for caminho local: leia os componentes/páginas-chave e os tokens de design atuais (CSS/globals, fontes).
- Identifique: o que lê como genérico/fraco, qual DEVERIA ser a identidade, a estrutura de conteúdo. Se não estiver claro o que incomoda, pergunte ao dono (o texto depois do alvo é a dor dele).

> **Screenshot (preferir Playwright CLI, já instalado):** `npx playwright screenshot --full-page --viewport-size=1280,900 "URL" out-desktop.png` e `npx playwright screenshot --full-page --viewport-size=390,844 "URL" out-mobile.png` (Playwright espera a página assentar sozinho). Fallback Chrome headless (Windows): `C:/Program Files/Google/Chrome/Application/chrome.exe --headless=new --hide-scrollbars --window-size=1280,3000 --virtual-time-budget=10000 --screenshot="OUT.png" "URL"` com `--user-data-dir` numa pasta nova pra fugir de cache.

## 3. A marca (só quando o alvo inclui logo, símbolo ou favicon)

Se o site não tem logo, tem um logo fraco, ou o que incomoda o dono é a marca/favicon, invoque a skill **`logo-design`** e siga o processo dela. Ela desenha SVG **escrito à mão** (viewBox, `currentColor`, variante dark, SVGO) — é o executor certo aqui; o Fable continua fazendo o layout.

**O que a skill faz e você não deve pular:** ela abre com `AskUserQuestion` mostrando mood board (personalidade, foco, e 3-4 **marcas reais do setor** como âncora de estética). Essa pergunta é obrigatória e é onde a direção se define — "moderno" e "limpo" são vibe, não briefing. Tailorize as marcas de inspiração pro nicho do alvo (diretório jurídico ≠ eletroposto ≠ clínica), senão a pergunta não ancora nada.

**Adaptações pra este ambiente (a skill assume macOS/Linux):**
- Copiar o preview: `cp "C:/Users/User/.claude/skills/logo-design/assets/preview.html" .` (não leia nem edite o arquivo, só copie).
- Abrir: no Windows é `start preview.html` — **não** `open` nem `xdg-open`. O preview recarrega sozinho a cada 3s, então crie o `variants.js` com o primeiro conceito e vá acrescentando.

**Regras duras da rede pra marca:**
- **O símbolo se desenha a 16 px.** Julgue no preview em 16 e 32 ANTES de gostar do 512. Marca que só funciona grande já foi reprovada aqui, e a queixa vem como "parece só um texto" — que é reclamação de proporção, não de falta de ícone. Se some no favicon, refaz.
- **`-dark.svg` sempre.** A rede tem diretório escuro e diretório claro, e a mesma marca entra nos dois. Borda navy que brilha no branco desaparece no escuro.
- **Monocromático usa `currentColor`** pra herdar o tema no Next sem CSS extra.
- **Wordmark com texto convertido em path**, nunca `<text>`. E a tipografia do wordmark obedece a mesma regra da seção 5: **nada de Fraunces nem serif editorial por default**.
- **Nunca gerar logo em raster.** Runware é pra imagem (hero, OG, capa) e, em site de cliente, nem isso — a marca é vetor desenhado, não PNG vetorizado.
- **Anti-footprint:** são ~20 diretórios na mesma rede. Duas marcas não podem sair da mesma geometria/metáfora. Se o conceito lembra o de outro site da rede, troca.
- **Aprovação por print, como todo o resto:** screenshote o `preview.html` (claro e escuro, com as escalas pequenas visíveis) e mande pro dono antes de fiar no código.

**Entrega:** `logo.svg`, `logo-dark.svg` e os PNG de favicon (32, 180, 512). Pro PNG use `sharp` no Node — não instale resvg/Inkscape/librsvg pra isso.

## 4. Gerar o design com FABLE 5 (obrigatório)
A geração criativa roda no **Fable** via a ferramenta Agent com `model: "fable"`. NÃO gere o design no modelo principal — o principal orquestra (lê código, screenshota, aplica, deploya); o **Fable cria**. Dê ao Fable: o conteúdo/estrutura, a direção de identidade, **o SVG da marca aprovada na seção 3** (inline, pra ele compor o header e o hero em cima da marca de verdade, não de um placeholder), as regras duras abaixo, e peça um **mockup HTML autossuficiente** do hero + 2-3 seções-chave (artboard real e completo: fontes via Google Fonts, copy real, layout real). Gere **1-2 direções distintas** pra comparar.

## 5. Regras duras (a experiência — inegociável)
- **Distintivo, não genérico.** Nada de cara de template/AI-default. Tem que parecer que um designer de verdade fez pra ESTE produto.
- **Sem Fraunces e sem serif editorial "por padrão".** O dono lê isso como "não-pronto" e detesta. Use uma **sans moderna e com personalidade** (via Google Fonts) com fallback stack de verdade. Serif só se for parte deliberada de um sistema forte — nunca o default seguro.
- **Identidade própria**, não "referência repintada": paleta própria (tokens reais), escala tipográfica, espaçamento, border-radius, motion, ícones. Se der pra reconhecer como outro site repintado, refaça.
- **Layouts sãos.** A distinção vem de composição, paleta, tipo e detalhe — **não de gimmick** (nada de header na lateral, nada de estrutura estranha que o usuário precise "decifrar"). Layout normal e confiante, feito excepcionalmente bem. (O dono já rejeitou header lateral e layout "viagem".)
- **Contraste AA, zero CLS, responsivo** (desktop + mobile 360-390px), theme-aware quando fizer sentido.
- **Conteúdo real**, nunca lorem ipsum. Sem em dash em texto gerado. PT-BR correto.
- **NÃO ENCOLHER TIPOGRAFIA PARA CABER.** Título que não cabe se resolve com menos palavra, mais largura de coluna ou quebra melhor. Diminuir o corpo até caber destrói a hierarquia e é o começo do site que "parece apertado": a próxima coisa que não couber vai encolher também, e no fim tudo tem o mesmo tamanho. Se o texto é longo por natureza (o modelo escreveu 63 caracteres), o desenho é que se adapta com uma regra explícita por faixa de comprimento, não com um encolhimento improvisado.
- **UMA GRAMÁTICA VISUAL POR TELA.** Escolha um raio, uma família de sombra, um tipo de borda, um jeito de separar seção, e repita. Cartão arredondado ao lado de cartão reto, sombra em um bloco e filete em outro, duas famílias de ícone: cada mistura dessas custa credibilidade e nenhuma delas é percebida como "variedade", só como descuido. Variedade vem da composição e do ritmo, não de trocar a gramática no meio.
- **Alvo de toque de 44px SÓ ONDE HÁ TOQUE.** A regra vale para o que se aperta com o dedo: botão, link de navegação, item de lista clicável, campo de formulário. Não vale para texto corrido, rótulo, chip decorativo nem linha de tabela que não é clicável. Inflar tudo para 44px espalha ar pela tela e não melhora nada, e ainda esconde o que é de fato clicável.

## 5b. Armadilhas de cascata e de porte

Cada uma custou uma correção em produção. Todas passam em teste de status.

**Reset tem de PERDER para classe.** `.ahwrap ul{margin:0}` pesa (0,1,1); a classe
do menu pesa (0,1,0). O reset vencia e zerava a margem que separava os dois níveis
do menu, deixando **dois alvos de toque a 1 px um do outro** — exatamente na troca
de hierarquia, que é onde o dedo mais erra. **Reset vai em `:where()`**, que tem
especificidade zero e nunca disputa com a classe.

**Utilitária de acessibilidade tem de VENCER o contexto onde for usada.**
`.des-form :is(input, select, textarea)` pesa (0,2,1) contra `.des-sr` com (0,1,0),
e devolvia `width:100%` ao campo que deveria estar escondido do olho e visível ao
leitor de tela. É o caso legítimo de `!important`, e é o que o Bootstrap faz em
`.visually-hidden`.

**Escala tipográfica se porta FLUIDA, não em degraus fixos.** Um `clamp()` portado
como três tamanhos fixos fez o título cair para 7 e 8 linhas entre 768 e 1024 px,
justamente onde a placa reservava vão para a foto: a abertura foi a 74% da tela,
numa largura que ninguém olha no dia a dia. Se a origem é fluida, o destino é
fluido.

**Margem de contraste de 1% não é folga.** Um vinho de marca dava 4,56:1 contra o
piso de 4,50 para texto pequeno: passa em AA, e qualquer ajuste de cor depois
derruba. **Em fundo de cor cheia, peça 20% de folga ou mais** — escurecer o mesmo
matiz um degrau levou para 5,80:1 sem mexer na identidade.

**Duas queixas ao mesmo tempo não são uma.** Quando o dono reclama de "grande" e
"simplão" no mesmo fôlego, encolher resolve a primeira e **piora** a segunda, e a
segunda volta reprovada. Peça variantes com as duas restrições JUNTAS: teto de
altura **e** exigência de composição.

## 6. Aprovar por SCREENSHOT antes de aplicar

**Mudança de COLUNA se confere em 1280 E 390, sempre nas duas.** As duas vistas se estragam mutuamente: alargar a coluna para o título caber no desktop espreme o texto no celular; empilhar para caber no celular deixa buraco no desktop. Conferir só uma é conferir metade, e a metade que quebra é sempre a que não foi olhada. Toda vez que mexer em `grid-template-columns`, largura de coluna, `max-width` de texto ou ordem de blocos, **rode as duas capturas antes de dizer que resolveu**.

Renderize o mockup do Fable e **screenshote (desktop 1280 + mobile 390)**. **Inclua a tela mais densa do site, não só o hero**: listagem cheia com volume real, tabela e ficha. Hero aprovado com listagem reprovada é o resultado padrão de quem só printa a home. Mostre os screenshots ao dono e **pegue aprovação ANTES** de fiar no código de verdade. Itere no mockup, não no site ao vivo. Método incremental: um skeleton/hero aprovado antes de escalar pras outras páginas.

## 6b. Acessibilidade é COMPORTAMENTO, e não sai em print

Print aprova aparência. Estes quatro estavam num menu aprovado visualmente e
nenhum aparece em captura:

- `aria-modal` no painel com o botão de fechar FORA dele: o leitor de tela apaga
  justamente o botão de fechar.
- "Fechar" como 11ª parada de Tab.
- Zero `aria-current` num menu de 20 páginas.
- Trava de rolagem por `overflow:hidden`, que não segura o Safari do iPhone.

**Todo componente com estado (menu, modal, drawer, acordeão) passa por um script
que exercita teclado, foco, Esc, `inert` e trava de rolagem**, além do print.

E: **alvo de toque vem de `padding` mais `gap`, nunca de `min-height`.** Duas
linhas de texto já medem 43,5px, então o `min-height` não faz nada e os alvos
voltam a ficar a 0,5px um do outro.

## 6c. Antes de medir, prove o instrumento

Clique do Playwright rola a página e falseia medição de rolagem. `count()` conta
nó oculto. `networkidle` nunca chega com GA4 na página. Acordeão fechado ainda
mede altura. Caixa com proporção fixa e `overflow:hidden` corta o SVG dentro dela
sem erro nenhum. E a largura que quebra é a de cima, não a do breakpoint: menu e
rodapé passaram em 390 e 1280 e colapsaram em 768 e 920.

Leitura obrigatória antes de afirmar qualquer coisa medida:
**`diretorios-do-zero/references/medir-ui-com-playwright.md`**.

## 7. Aplicar
Aprovado: fie o design no projeto real **casando as convenções do código em volta** (prefixo de classe, estrutura de componentes, fontes via next/font ou o método do projeto). Depois **re-screenshote as páginas reais** (desktop + mobile) pra confirmar que bate com o mockup aprovado. Se for site ao vivo, deploy **zero-downtime** e verifique 200.

## 8. Revisor crítico com poder de VETO

Depois do mockup e antes de aplicar, passe o resultado por um revisor crítico separado (outro agente, com as skills de design carregadas e o briefing original), e **dê a ele poder de travar**. Não é opinião consultiva: se ele reprovar, não aplica.

Isso não é formalidade. **A melhor solução do conjunto veio do revisor**, não da geração inicial: quem gera está comprometido com a própria escolha e defende o que fez; quem revisa está livre para dizer que a premissa estava errada. Peça a ele três coisas, nesta ordem: (1) o que está errado e por quê, (2) o que ele faria diferente, (3) veto ou aprovação, explícito.

**SEPARE SEMPRE O DEFEITO MEDIDO DA CONCLUSÃO DO REVISOR. O defeito é dado; a
conclusão é opinião.** Um veto forte na medição não transfere essa força para a
recomendação que veio junto.

Os dois casos reais, um de cada lado:

- Numa logomarca, **cinco vetos empurraram o resultado para o de menor risco**,
  que era exatamente o que o briefing proibia, e o dono reprovou.
- Num painel, o revisor vetou o menu lateral medindo que duas filas caíam para
  fora da tela a 390px. O defeito era real e tinha conserto de uma regra de CSS;
  a conclusão "não use rail" era dele. O veto foi seguido inteiro, o dono cortou,
  e ao construir sem rail o mesmo defeito medido foi **repetido** noutro lugar.

**Instrua o revisor explicitamente: veto é para defeito real, nunca para empurrar
ao mais parecido com o que já existe.** Um bom veto também diz quando as direções
estão tímidas demais.

Se o revisor e o gerador discordarem, **o dono desempata olhando os dois prints**, não o texto do argumento.

---

Nunca declare "pronto" sem o screenshot final provando o resultado.

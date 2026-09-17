---
name: camilafarias-deploy
description: Como o site camilafarias.com.br é hospedado e publicado (arquitetura real de deploy)
metadata: 
  node_type: memory
  type: project
  originSessionId: 41174030-498c-465d-930c-e16bd57d6b64
---

O site **camilafarias.com.br** (Dra. Camila Souza Farias, endocrinologista em Goiânia) é **HTML estático**, NÃO é Next.js/PM2.

- **Docroot:** `/home/qmix/web/camilafarias.com.br/public_html/` no VPS `opengravity` (alias SSH).
- **Servidor:** Apache (Hestia) — **`.htaccess` funciona** (confirmado: header X-Frame-Options vem duplicado, DENY do .htaccess + SAMEORIGIN do Hestia).
- **CDN:** atrás do Cloudflare (104.21.x / 172.67.x). HTML é `cf-cache-status: DYNAMIC` (não cacheado); **CSS/JS/imagens são cacheados na borda** com max-age altíssimo.
- **Deploy é MANUAL** — não há Cloudflare Pages nem git pull no VPS. Push pro GitHub (repo `qmixdigital/camilafarias.com.br`) **não publica nada**. Publicar via:
  `git archive HEAD | ssh opengravity 'cd <docroot> && tar -x --no-same-owner --exclude=.vscode --exclude=.htaccess-backup -f - && chown -R qmix:qmix . && chown qmix:www-data .'`
- **Cache da borda:** ao mudar CSS/JS, usar **cache-busting** (`?v=AAAAMMDD`) na referência, pois não há token Cloudflare disponível para purgar (nada de CF nos READMEs de `D:\SISTEMAS\MinhasHospedagens`).
- **Componentes copiados** (header/footer/analytics) são hardcoded em cada página — editar exige substituição em massa nos 22-23 HTML, não só em `components/`.
- **Blog companion:** `blog.camilafarias.com.br` = WordPress separado em `/home/qmix/web/blog.camilafarias.com.br/public_html/`.
  - Tema **Jannah 7.6.3 + jannah-child** (classes `tie-`). Opções do tema ficam em `wp_options.tie_jannah_options` (NÃO `tie_options`). `wp` está em `/usr/local/bin/wp`.
  - Logo do header: chaves `logo` (1x), `logo_retina` (2x), `mobile_logo`, `mobile_logo_retina` + `logo_retina_width/height`. O **alt do logo vem de `blogname`**, não de campo próprio.
  - O logo real da marca é `imagens/logo-camila-2048x427.webp` do site estático, que tem **fundo bege #D1CABC** (mesma cor do header do site). Para usar em fundo branco, gerar versão transparente com `convert ... -fuzz 25% -transparent '#D1CABC' -trim` (usar `-transparent` global; `-floodfill` deixa bege preso dentro dos contornos das letras).

**Bug em aberto (Cloudflare) — redireciona subdomínios novos para http://:** `www.camilafarias.com.br` e `onna.camilafarias.com.br` recebem `301 → http://<eles-mesmos>` **inserido pelo Cloudflare** (não pela origem). Provado: `onna` tem origem HTTPS 200, cert de borda `*.camilafarias.com.br` e config nginx **idênticos ao `blog` (que funciona)** — só o CF trata `onna`/`www` diferente. É uma regra na zona do CF (Page/Redirect/Configuration Rule). Sem token CF não dá pra inspecionar.
**Workaround que funciona:** pôr o registro do subdomínio como **"DNS only" (cinza)** no Cloudflare → vai direto à origem, que tem **Let's Encrypt válido próprio** (Hestia emite via `v-add-letsencrypt-domain qmix <dominio>`). Bom para ferramentas privadas/noindex.

**Subdomínio `onna.camilafarias.com.br` (Painel de Saúde das pacientes — Programas Onna):**
- Web-domain Hestia sob user `qmix`, docroot `/home/qmix/web/onna.camilafarias.com.br/public_html/`, IP 77.37.69.175, SSL LE OK (sem alias www — removido, senão LE falha).
- Serve `onna_dashboard.html` (origem: `C:\Users\User\Desktop\Dra_camila\`) como `index.html`, com `noindex` + `robots.txt` Disallow.
- Ferramenta autossuficiente: registra dados de saúde da paciente e envia via POST a um **Google Apps Script → Google Sheets** (conta da Dra.). Falta colar a `GOOGLE_SCRIPT_URL` (placeholder `COLE_AQUI_A_URL...`).
- Site institucional NÃO foi tocado nessa etapa. Proposta aprovada gerada em `C:\Users\User\Documents\ORÇAMENTOS\orcamento_painel_onna_camila_farias.docx` (modelo QMIX, azul #0D3472).

## Blog migrado para HTML estatico em /blog (25/08/2026)

O blog WordPress do subdominio foi **importado para HTML estatico dentro do dominio principal**, em `camilafarias.com.br/blog/`. Decisao do dono: sem WordPress, sem PHP, sem banco. A redatora entrega texto em Word e a publicacao passa pelo operador no VSCode.

**O gerador e a peca central**, em `scripts/`:
- `blog_export.json` e a fonte de conteudo (extraida do WordPress por `wp eval-file`)
- `blog_base.py` tem tokens, cabecalho, rodape, limpeza do HTML do Gutenberg e a taxonomia
- `blog_paginas.py` monta artigo, indice e categoria
- `gerar_blog.py` e o driver: `python scripts/gerar_blog.py` reescreve as 69 paginas

Publicar artigo novo = acrescentar entrada no JSON e rodar de novo. Indice, categorias, relacionados, trilha e malha interna se refazem sozinhos. **Nao editar os arquivos em `blog/` na mao**, eles sao gerados.

**Interruptor de indexacao:** `PUBLICAR = False` em `blog_base.py` faz as paginas sairem com `noindex, follow`. Esta assim de proposito enquanto o subdominio antigo continua no ar. Virar para `True` junto com os 301.

**Taxonomia:** criada a categoria **Menopausa e Climaterio** (10 artigos que estavam espalhados em 4 categorias), por ser o principal servico da cliente. A regra fica em `MENOPAUSA_SLUGS`, por slug, entao e auditavel.

**URLs:** artigo em `/blog/<slug>` sem extensao e sem barra; **indice em `/blog/` COM barra**. Tentei servir `/blog` sem barra com rewrite e criou laco com o mod_dir do Apache, que redireciona diretorio real para a versao com barra. Nao repetir: usar a URL de diretorio.

**Deploy:** `.gitattributes` marca `docs/` e `scripts/` como `export-ignore`, entao o `git archive` do deploy nao sobe as ferramentas de build. O comando de deploy continua o mesmo.

**Resultado medido:** mobile passou de **perf 85 e LCP 3,3 s com 623 KB** (WordPress ja otimizado) para **perf 98, LCP 1,8 s, CLS 0 e 103 KB**.

**Ainda nao feito, aguardando revisao do dono:** os 301 do subdominio para `/blog/<slug>`, atualizar as ~43 regras da raiz que ainda apontam para o subdominio, o `sitemap.xml`, o IndexNow e virar o `PUBLICAR`.

### Refino visual do blog (25/08/2026)

Direcao: **editorial medico refinado**. Tinta escura sobre papel quente, o bege da marca como acento e nao como fundo de tudo, display em serifa.

- **Fonte:** Fraunces (pesos 500 e 600) **hospedada em `/fonts`**, gerada por `scripts/baixar_fontes.py`, com `css/fontes.css` e preload do peso do H1. O corpo usa **Georgia**, que ja existe em todo dispositivo. Nunca voltar para `fonts.googleapis.com`: custou 164 KB e derrubou o mobile de perf 98 / LCP 1,8 s para 85 / 3,3 s. E **nunca pedir o eixo `opsz` na API do Google**, porque devolve a fonte variavel inteira (674 KB contra 137 KB da instancia estatica).
- **Cache-busting virou obrigatorio e automatico:** `scripts/versionar_assets.py` calcula o sha1 de cada CSS/JS e carimba as 92 paginas; `gerar_blog.py` chama no fim. Sem isso a borda do Cloudflare serve CSS velho e **a alteracao simplesmente nao aparece**, o que aconteceu na primeira tentativa deste refino.
- **Tabela do artigo vira cartao abaixo de 640px**, com `data-rotulo` por celula e papeis ARIA explicitos (`role="table"`, `rowgroup`, `rowheader`, `cell`), porque `display:block` apaga a semantica de tabela para leitor de tela. O tratamento e feito no gerador, em `arruma_tabelas`.
- **Banner de cookies**: no mobile ocupava **49% da tela**; com a media query nova em `js/consent.js` caiu para **14%**, botoes lado a lado.
- **Destaque do indice sai da categoria carro-chefe** (Menopausa), nao do post mais recente: a primeira imagem que a paciente via era foto de um idoso.
- **Ferramenta de print:** `playwright` ja instalado; scripts de apoio ficaram no scratchpad da sessao. Vale pre-aceitar o cookie `cookie_consent=all` no contexto, senao o banner cobre a dobra em todo print.

**Core Web Vitals no mobile depois do refino:** indice 98 (LCP 1,6 s), artigo 98 (LCP 2,1 s), categoria 99 (LCP 2,0 s), CLS 0 em todas.

**Modulos do gerador:** `blog_base.py` (tokens, cabecalho, rodape, limpeza, taxonomia, tabelas), `blog_paginas.py` (artigo, indice, categoria), `gerar_blog.py` (driver), `versionar_assets.py`, `baixar_fontes.py`. Dois deles tinham `sys.stdout = TextIOWrapper` no topo e quebravam ao serem importados: manter esse wrapper **so** dentro de `if __name__ == "__main__"`.

**Rodape no mobile (corrigido em 25/08/2026):** havia uma media query antiga em `css/style.css` com `.footer-credits { flex-direction: column }`, que punha Politica de Privacidade, Termos de Uso e a assinatura da QMIX cada um numa linha. Removida. Os creditos agora sao `flex-direction: row` com `flex-wrap`, e `.footer-assinatura` usa `flex: 1 0 100%` para ficar sozinha na linha de baixo. Os estilos inline `opacity: 0.7` foram tirados das 22 paginas e do gerador (inline vence CSS, entao nao dava para corrigir so na folha). Cada bloco do rodape ganhou `border-top` no mobile, para as secoes nao se misturarem. Altura caiu de 1.254 px para 1.056 px.

**Licao geral para este CSS:** `css/style.css` tem 16 media queries e regras repetidas para o mesmo seletor em pontos distantes do arquivo. Antes de concluir que uma alteracao "nao pegou", `grep -n` o seletor no arquivo inteiro: provavelmente existe outra regra depois. E medir no navegador com Playwright (`getBoundingClientRect`) resolve em um comando o que a leitura do CSS demora a revelar.

### Refino visual do site institucional (25/08/2026)

Mesma linguagem do blog aplicada nas 22 paginas, **numa folha separada `css/site.css`** carregada depois do `style.css`, que **nao foi alterado**. Liga e desliga com `python scripts/aplicar_refino_site.py` e `--desfazer`; conferido que o ciclo ligar/desligar/ligar deixa o repositorio identico, sem residuo.

**Armadilhas deste CSS, todas ja pagas:**
1. **Especificidade.** Existem `h1.hero-tag` e `h2.hero-title` (elemento + classe) no `style.css`. Regra de classe pura na folha nova perde, mesmo carregando depois. Na home o **H1 e a etiqueta** e o nome da medica e um **H2**, entao a home ficava sem refino enquanto as paginas de servico pegavam.
2. **`min-height` inline no `<section class="hero">`** (50vh ou 60vh) em varias paginas. Inline vence folha; foi neutralizado com `!important` dentro da media query, de proposito, para nao editar o HTML e manter o desfazer de uma linha.
3. **Superficies escuras.** `.agendar`, `.cta-inline` e o rodape tem fundo oliva. As regras de tinta escura deixavam o titulo quase preto sobre oliva. Sempre listar essas secoes de volta para branco ao mexer em cor de texto global.
4. **Icone dentro de caixa.** `.stat-icon` e a caixa (50px) e o `svg` dentro dela (24px). Igualar os dois no mesmo tamanho faz o desenho estourar a borda.

**Auditoria de contraste (script no scratchpad, vale reescrever quando precisar):** percorre as 22 paginas com Playwright, sobe a arvore ate achar fundo opaco e mede a razao WCAG de cada titulo e paragrafo. **Antes do refino: 158 elementos abaixo do minimo. Depois: 0**, no mobile e no desktop. Achou inclusive um bug anterior: o paragrafo do `.cta-inline` em /tratamentos era oliva sobre oliva, razao 1.00, texto invisivel.

**Detalhe do medidor:** gradiente nao aparece em `backgroundColor`, so em `backgroundImage`. Sem tratar isso o script acusa 48 falsos positivos nas secoes com gradiente.

**Core Web Vitals no mobile depois do refino:** home 98 (LCP 2,3 s), pagina de servico 97 (LCP 2,0 s), CLS 0.

**Correcoes de contraste apos revisao do dono (25/08/2026).** Ele apontou texto claro sobre fundo claro, que minha auditoria nao pegava. Duas falhas eram **do medidor**, nao do site, e valem lembrar:
1. **Alpha do gradiente.** `.cta-inline` tem `background: linear-gradient(..., rgba(110,109,83,0.03), transparent)`, ou seja, praticamente creme. O medidor lia a cor do gradiente ignorando o alpha e reportava fundo oliva solido. Isso me levou a pintar o texto de branco, criando de verdade o problema que o dono viu. **Sempre checar o alpha antes de tratar um gradiente como fundo opaco.**
2. **Cobertura do seletor.** Media so `h1..h4` e `p`. Trocado para varrer todo elemento com no de texto proprio, o que revelou `span`, `a` e `div` problematicos.

**Bug antigo achado no processo:** `css/formacao-styles.css` e `css/diabetes-styles.css` usam `var(--primary-color)` **40 vezes** e `var(--secondary-color)` **23 vezes**, e nenhuma das duas foi declarada neste projeto. Todo fundo com essas variaveis virava transparente: em `/sobre` os selos de RQE e os periodos da linha do tempo eram **texto branco sobre branco**. Declarei as duas em `css/site.css`, o que conserta os 63 usos de uma vez.

**Outros ajustes:** links do menu principal eram oliva sobre bege (3,24) e agora usam tinta; `--tinta-fraca` subiu de `#86846C` (3,67) para `#73715A` (4,84); a meta dentro de `.blog-relacionados` usa o tom seguinte, porque o creme da secao e mais escuro que o papel; estrelas de avaliacao ficam douradas de proposito, com contorno fino para definicao, e sao ignoradas na auditoria por serem decorativas com a nota escrita ao lado.

**Estado final medido: 0 elementos abaixo do minimo WCAG** no site (mobile e desktop) e nas 69 paginas do blog. As 91 paginas respondem 200.

**Auditor de contraste versionado: `scripts/auditar_contraste.py`.** Rodar `python scripts/auditar_contraste.py [site|blog]`, ele monta a lista de URLs sozinho a partir dos arquivos do repositorio e mede em mobile e desktop.

Ele nasceu de tres falhas minhas, todas achadas pelo dono olhando a tela depois de eu dizer que o numero era zero:
1. **Alpha do gradiente** lido como fundo opaco (me fez pintar `.cta-inline` de branco sobre creme).
2. **Cobertura do seletor** limitada a `h1..h4` e `p`, deixando `span` e `a` de fora.
3. **Filtro de comprimento** exigindo mais de um caractere, o que escondia o `+` do acordeao de FAQ, que estava oliva sobre circulo oliva.

A versao atual cobre texto de um caractere, **icones em SVG** (comparando `stroke` e `fill` com o fundo, minimo 3:1 da WCAG para componente grafico) e ignora as estrelas de avaliacao por serem decorativas. **O auditor foi provado**: reintroduzindo a falha do `+` por `add_style_tag`, ele acusa 1,26; corrigido, mede 5,28.

**Licao para a proxima vez:** ferramenta de auditoria que devolve zero merece um teste que reintroduza a falha de proposito. Zero sem prova nao vale nada, e eu afirmei zero tres vezes antes de o dono achar problema na tela.

**ARMADILHA SERIA DO DEPLOY, descoberta em 25/08/2026: cache envenenado na borda.** Carimbar o HTML com o hash novo e subir o arquivo **nao sao atomicos**. Se alguem (inclusive eu, conferindo com `curl`) requisitar a URL nova nessa janela, o Cloudflare guarda o **conteudo antigo** sob o hash novo, e a partir dai o cache-busting nao adianta mais: a URL e nova mas o conteudo servido e velho.

Sintoma: `sha1sum` do arquivo no servidor bate com o `?v=` do HTML, mas o `curl` na URL publica devolve conteudo diferente. Foi exatamente o que aconteceu com `css/site.css`, e me fez achar que a correcao nao tinha aplicado.

Conserto: **mudar o conteudo de proposito** (uma linha de comentario basta) para gerar outro hash, recarimbar e subir. Prevencao: subir o arquivo primeiro e so depois conferir; nunca dar `curl` na URL nova antes do deploy terminar.

**Botao do acordeao de FAQ, ajustes finos (medidos no pixel com Playwright + PIL, ampliando o elemento em 8x):**
- `line-height` herdado do body era 1,6, ou seja **38,4px de caixa de linha dentro de um circulo de 32px**. Com `line-height: 1` a centralizacao do flex volta a valer.
- Mesmo assim o glifo caia **3,00px** abaixo do centro, porque `+` e `-` nao sao simetricos na caixa da fonte. Compensado com `padding-bottom: 6px` mais `box-sizing: border-box`, que sobe o conteudo metade do padding. **Nao usar `transform` aqui**, porque o estado aberto ja usa transform.
- **Os dois sinais precisam da mesma compensacao.** Eu supus que o `-` fosse simetrico, isentei ele, e a medicao mostrou que tambem caia 3px.
- O estado aberto mostrava **uma barra inclinada**: o CSS girava 45 graus para virar o `+` em `x`, mas o script troca o sinal por `-`, e um menos girado vira barra. Rotacao cancelada.

**Tecnica que vale reaproveitar:** para alinhamento optico, tirar print do elemento com `device_scale_factor=8`, achar o circulo pelos pixels da cor de fundo, mascarar o interior com `math.hypot` e medir o centro da tinta. Da o desvio em px CSS com uma casa decimal, em vez de discutir olhando a tela.

## VIRADA CONCLUIDA: WordPress removido (25/08/2026)

O blog vive inteiramente em `camilafarias.com.br/blog`. **Nao existe mais WordPress para este cliente.**

**Estado do subdominio `blog.camilafarias.com.br`:** o web domain do Hestia **continua existindo**, mas o docroot tem **apenas um `.htaccess`** (20 KB no lugar de 344 MB). Ele so redireciona. **Nao apagar esse vhost**, senao os 301 morrem e a autoridade dos links externos vai junto.

**Banco `qmix_59022` derrubado.** Antes conferi o mapa banco/site: `for f in /home/qmix/web/*/public_html/wp-config.php; do grep DB_NAME $f; done`. Os outros WordPress da hospedagem usam `qmix_26167` (peritodicas), `qmix_31232` (nutricionista), `qmix_67882` (tredicci) e `qmix_75188` (ombrogoiania), e continuam de pe, conferidos com HTTP 200 depois da remocao.

**Backups antes de apagar, em `/home/qmix/backups-migracao-blog/` no opengravity:** `blog-camila-FINAL.sql` (4,4 MB), `blog-camila-arquivos-FINAL.tar.gz` (114 MB) e `htaccess-wordpress-antigo`.

**Redirecionamentos, todos gerados por `scripts/gerar_redirects.py`:**
- `.htaccess` do subdominio: 62 artigos, 6 categorias, 11 consolidados, os slugs legados do dominio de staging da Hostinger, sitemaps e feeds antigos, mais catch-all para `/blog/`.
- `.htaccess` da raiz: as 43 regras que mandavam slug antigo para o subdominio agora vao **direto** para `/blog/<slug>`. **Um salto so**, sem cadeia.

**Conferido:** 62 artigos, 6 categorias, 10 consolidados e os 43 slugs de raiz, todos 301 chegando em 200. As 91 URLs do sitemap respondem 200.

**Indexacao:** `PUBLICAR = True` em `blog_base.py`. `sitemap.xml` cobre o dominio inteiro (91 URLs, gerado por `scripts/gerar_sitemap.py`). IndexNow respondeu 202 para as 91 URLs, com a chave agora em `camilafarias.com.br/<<REMOVIDO>>.txt`. No Search Console o sitemap novo foi submetido e **os 4 sitemaps antigos do WordPress foram removidos** da propriedade.

**O que observar nas proximas semanas:** o `sc-domain` cobre os dois hosts, entao o Search Console vai mostrar a troca de URL acontecendo sozinha. Comparar com o precedente do `drtiagobernardes.com.br`, que fez a mesma migracao sem perder trafego.

**Cache da zona Cloudflare deste dominio (apurado em 25/08/2026):** ativos estaticos saem com `Cache-Control: max-age=315360000`, dez anos. **Isso vem da zona Cloudflare, nao do servidor**: `peritodicas.com`, no mesmo host, devolve `max-age=0`. Provado tambem que **`mod_expires` NAO esta carregado** no Apache (`apache2ctl -M` so lista `headers_module`), entao o bloco `<IfModule mod_expires.c>` do `.htaccess` sempre foi decorativo, e `Header set Cache-Control` perde para a borda.

Consequencias praticas, medidas:
- **CSS e JS:** dez anos e bom, porque as URLs sao versionadas por hash.
- **`sitemap.xml`:** sai como `cf-cache-status: DYNAMIC`, ou seja, **a borda nao guarda** e o Google sempre pega a versao fresca. Nao ha problema aqui.
- **`robots.txt`:** sai com `HIT` na borda. Um robots errado ficaria preso por muito tempo. Sem token da zona nao da para mudar a configuracao; o Google mantem cadencia propria de releitura, entao o risco e moderado, nao critico.

**Search Console, estado final:** um unico sitemap registrado, `https://camilafarias.com.br/sitemap.xml`, com 91 URLs, zero erros e zero avisos, baixado pelo Google dois segundos apos o envio. Os quatro sitemaps do WordPress antigo foram **removidos da propriedade** pela API (`sitemaps().delete`). As URLs antigas de sitemap no subdominio (`wp-sitemap*`, `sitemap*`, feeds) tem 301 para o sitemap novo.

**`robots.txt` do subdominio e servido de verdade, nao redirecionado** (`RewriteRule ^robots\.txt$ - [L]` antes do catch-all). Host que so redireciona precisa deixar o rastreador entrar para enxergar os 301; redirecionar o proprio robots.txt para uma pagina HTML e resposta invalida.


## Pipeline de artigo novo (26/08/2026)

Publicar conteudo novo nao e mais editar `blog_export.json` na mao:

- `scripts/artigos_novos/<nome>.json` traz um artigo por arquivo, com `html`,
  `faq` (lista de pares), `categoria`, `seo_title`, `seo_desc` e `imagem_prompt`.
- `scripts/gerar_imagens_artigos.py` gera a imagem pela Runware (1216x832, que
  mantem a proporcao das imagens que vieram do WordPress) e recorta o card
  780x470. Pula quem ja tem imagem, entao rodar de novo nao gasta credito.
  A API devolve **400 esporadico**: o script tenta 3 vezes e imprime o corpo do
  erro, porque `urllib` engole a mensagem e some com a causa.
- `scripts/publicar_artigos.py` injeta tudo no `blog_export.json`, convertendo o
  `faq` em bloco FAQPage JSON-LD (e assim que `separa_faq` le as perguntas).
- Depois e o fluxo de sempre: `gerar_blog.py`, `gerar_sitemap.py`, commit,
  `git archive` e IndexNow.

**Flag `"reescreve": true`** substitui o post que ja existe naquele slug,
preservando data e imagem. Serve para conteudo que ja acumulou historico no
Google. Foi o caso de `hipotireoidismo-pode-matar`: a URL ja recebia 14.111
impressoes de "tireoide pode matar" na posicao 8,5, entao criar um artigo
guarda-chuva novo teria competido com ela. A propria pagina virou o
guarda-chuva.

**Regra que vale para esta carteira:** antes de escrever artigo novo, conferir
se ja existe pagina recebendo aquelas impressoes. O site tem **mais pagina
ranqueando mal do que assunto sem pagina**. Reescrever uma URL indexada rende
mais que abrir URL nova, e evita a canibalizacao que custou uma limpeza inteira
em 25/08/2026.

## Dois defeitos preexistentes achados em 26/08/2026

**1. FAQPage divergente do conteudo visivel, em 8 das 17 paginas com FAQ.**
O JSON-LD declarava 43 perguntas que **nao existiam na pagina**. Na de
emagrecimento, as 8 do schema e as 8 visiveis nao tinham nenhuma em comum. A
diretriz do Google para FAQPage exige que o conteudo marcado esteja visivel ao
usuario, entao marcacao divergente e ignorada e pode gerar acao manual.

Corrigido por `scripts/sincroniza_faq_schema.py`, que reconstroi o `mainEntity`
lendo os pares pergunta e resposta do proprio HTML. **A tela manda, o schema
copia.** Rodar sempre depois de mexer em qualquer FAQ do site. `--conferir` so
audita, sem escrever.

Cada pagina tem markup de acordeao proprio: a home usa `.faq-item` com
`<button class="faq-question"><span>`, e as paginas de servico usam
`.diabetes-faq-box` com `<h3>`. Qualquer script que mexa em FAQ precisa tratar
os dois.

**2. Travessao em 12 paginas**, contra a regra do projeto. Eram dois casos que
pedem tratamento diferente: travessao de **pontuacao**, trocado por virgula ou
dois-pontos conforme o sentido, e travessao de **faixa numerica**, que a busca
por `\d[-]\d` nao pega inteira. As formas que escapam: `5,7%-6,4%` (dash depois
de `%`) e `F1-F2` (dash entre letra e digito). Trocadas por " a ". O site
inteiro esta em zero, conferido em `*.html`, `blog/*.html` e
`blog/categoria/*.html`.

## Regra que se repetiu tres vezes e vale como padrao

Antes de escrever artigo novo, **conferir se ja existe pagina recebendo aquelas
impressoes**. Aconteceu com "tireoide pode matar" (a URL de hipotireoidismo ja
tinha 14.111 impressoes), com "progesterona baixa na menopausa" (ja existia
`nivel-de-progesterona-na-menopausa` na posicao 16,5) e com "melhor
endocrinologista de Goiania" (a **home** ja recebe essas buscas na posicao 6,8).
Nos tres casos a resposta certa foi reescrever ou reforcar a pagina existente,
nunca criar URL nova.

Vale tambem para busca comercial e local: se a home ja ranqueia para o termo,
pagina nova canibaliza. O reforco vai como pergunta no FAQ da propria pagina,
por `scripts/reforco_faq_paginas.py` (tem `--desfazer`).

**Cuidado ao reabrir slug consolidado:** `gerar_redirects.py` regenera o
`.htaccess` do subdominio, mas **nao reescreve a linha correspondente no
`.htaccess` da raiz**, porque aquela funcao so troca regras que ainda apontam
para o subdominio (hoje sao zero). Ao tirar um slug de `CONSOLIDADOS`, editar a
linha da raiz a mao, senao ela continua desviando para o artigo que absorveu.

## Ordenacao do indice do blog

O card grande de destaque saia da categoria carro-chefe (menopausa). Isso
prendia um artigo de janeiro no topo e empurrava o que acabou de sair para baixo
da dobra. Passou a ser `posts[0]`, o mais recente. **Reescrita nao sobe no
indice**: ela preserva `data` de publicacao e atualiza so `modificado`, que e o
que mantem o historico da URL.

## Nao rodar o auditor de contraste durante o deploy (26/08/2026)

`scripts/auditar_contraste.py` mede as **URLs em producao**, nao os arquivos do
repositorio. Rodar durante o `git archive | ssh ... tar -x` pega paginas no meio
da troca de arquivos e acusa falha que nao existe no codigo.

Aconteceu: uma execucao iniciada pouco antes do deploy devolveu "2 ocorrencias
no mobile". Duas execucoes posteriores, inteiramente depois do deploy,
devolveram 0 e 0, a segunda delas com detalhe por elemento e nenhuma linha
impressa.

E a mesma raiz da armadilha de cache envenenado ja registrada acima: **medir a
producao durante a escrita da producao nao vale**. Ordem correta: subir tudo,
esperar terminar, so entao auditar.

## Auditoria SEO de 26/08/2026 e o que ela revelou

Script no scratchpad da sessao, vale reescrever: percorre as URLs **no ar** e
confere item a item da checklist (title, meta, H1, hierarquia de heading,
keyword no H1 e em algum H2, densidade, canonical, OG, Twitter, schema, alt e
dimensao de imagem, links internos, links externos com HTTP real).

Resultado inicial nos 10 conteudos: 0 erro, 11 avisos. Fechou em 0 e 0.

**Achado maior que os 10: nenhuma das 22 paginas do site institucional tinha
BreadcrumbList**, enquanto as 74 do blog ja tinham porque o gerador cria.
Resolvido por `scripts/gerar_breadcrumbs.py`, com hierarquia que reproduz a
navegacao real (`tratamentos.html` de fato linka para cada pagina de servico),
nao inventada. Tem `--desfazer`.

**Rodape usava H4** em Navegacao, Tratamentos e Conteudo. Como o rodape vem
depois da ultima secao, nas paginas do site isso pulava de H2 para H4. Passou a
H3 **no HTML e em `blog_base.py`**; mexer so no HTML seria desfeito na proxima
geracao.

## Duas ferramentas que mentiam, consertadas

1. **`publicar_artigos.py` pulava em silencio** artigo ja existente. Editar o
   JSON de um texto ja publicado nao tinha efeito nenhum, e o script dizia "ja
   existe, pulei" como se estivesse tudo certo. Aconteceu com `sop-morte`: a
   correcao foi escrita, o deploy rodou e a pagina no ar seguiu velha. Agora ele
   compara `html` e `titulo` e avisa que a mudanca exige `"reescreve": true`.
2. **O auditor SEO nao lia JSON-LD com atributo extra na tag**
   (`<script type="application/ld+json" data-gerado="breadcrumb">`), e acusou
   "sem BreadcrumbList" numa pagina que tinha. Falso positivo do medidor.

Junto com os tres falsos positivos do auditor de contraste ja registrados, o
padrao e o mesmo: **ferramenta que devolve problema, ou devolve zero, merece ser
conferida contra a realidade antes de virar acao.** Neste caso o `curl` na
pagina desmentiu o auditor em segundos.

**Ponta solta:** `tratamento-pre-diabetes-em-goiania` nao e linkado do hub
`/tratamentos`, so de duas paginas irmas.

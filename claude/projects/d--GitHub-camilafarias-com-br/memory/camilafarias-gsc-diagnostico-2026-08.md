---
name: camilafarias-gsc-diagnostico-2026-08
description: "Estado do SEO de camilafarias.com.br no Search Console em agosto de 2026 (crescimento, gargalo de CTR, canibalizações)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1128f36a-6811-4c97-80fb-2b9faaccef16
  modified: 2026-08-25T12:49:15.089Z
---

Leitura do Search Console em **25/08/2026**, janela 25/05 a 22/08/2026 contra os 90 dias anteriores.

**Trajetória:** 1.583 cliques e 200.376 impressões, contra 861 cliques e 68.278 impressões no período anterior (+83,9% em cliques, +193,5% em impressões). Crescimento contínuo desde maio de 2025, sem vale nem pico anômalo. Posição média melhorou de 8,5 para 7,5.

**O crescimento é quase todo do blog:** `blog.camilafarias.com.br` saiu de 18 para 650 cliques e de 14.748 para 146.888 impressões. O site institucional ficou praticamente estável (848 para 943 cliques). O blog são 65 páginas indexadas; o site, 24.

**O gargalo é CTR, não posição.** Nenhuma query com 500+ impressões está acima da posição 30, e nenhuma consolidou o top 3 na média: **todas as 18 queries desse porte estão entre a posição 4 e 15**, o bucket "porta da click zone". Domínio tem autoridade, todas as brigas são vencíveis. Os artigos do blog rodam em posição 6 a 9 com CTR de **0,06% a 0,5%** (ex.: `diferenca-entre-hipoglicemia-e-hiperglicemia` com 15.324 impressões e 19 cliques, `acromegalia-sintomas-causas-tratamento` com 9.011 impressões e 8 cliques). Suspeita principal a confirmar na SERP: AI Overview absorvendo o clique em query informacional médica.

**Cauda longa:** 69% dos cliques vêm de queries fora das 6.027 visíveis. Otimizar só pela lista visível subestima as páginas.

**O dinheiro do site é "unimed":** a home vive de `endocrinologista unimed goiania` (86 cliques, pos 5,2), `endocrinologista goiania` (37, pos 7,5), `endocrinologista goiânia unimed` (37, pos 3,6). As queries locais somam 287 cliques em 122 queries. As páginas de serviço quase não convertem impressão em clique.

**Canibalizações confirmadas** (cruzamento query x página, não inferência por slug):
1. `/endocrinologista-para-reposicao-de-hormonal-em-goiania` contra `/endocrinologista-menopausa-goiania` em "reposição hormonal goiania", "terapia de reposição hormonal goiania", "modulação hormonal goiania", "tratamento hormonal goiania", "hormônio bioidêntico goiania". A de reposição ganha sempre (pos 1,8 a 5,0 contra 11,4 a 18,0). Ação: tirar o vocabulário de reposição hormonal do title e do conteúdo da página de menopausa.
2. Blog: `ovario-policistico-causa-dor-nas-costas` contra `ovario-policistico-causa-dor-na-relacao` em toda a família "quem tem ovário policístico sente dor". Ambas em posição 7 a 12, nenhuma consolida, zero clique nessas variações.
3. `/sobre` contra a home em "camila farias" (pos 10,7 e 8,2, 1 clique em 303 impressões). Query de marca com resultado ruim.

**Curiosidade a investigar:** queries com aspas por `"drcamilafarias.com"` (domínio diferente do atual) trazem impressões para `/contato`, `/tratamentos` e `/termos-de-uso`, com zero clique. Possível domínio antigo da Dra. ainda buscado por nome.

Dados brutos ficaram em `gsc_camila.json` no scratchpad da sessão (efêmero, repuxar pela API quando precisar). Acesso descrito em [[camilafarias-gsc-acesso]].

**Correções aplicadas em 25/08/2026:**
1. Canibalização 1 desfeita: página de menopausa limpa de todo vocabulário de reposição hormonal (metas, schema, 5 das 8 FAQs, cards), com link contextual único delegando o tema para a página de reposição. Commit `7fa71b1`.
2. Canibalização 2 desfeita: `ovario-policistico-causa-dor-na-relacao` recebeu a seção guarda-chuva "Quem tem ovário policístico sente dor?" (H2 + FAQ no schema) e `ovario-policistico-causa-dor-nas-costas` ganhou desambiguação no topo. As duas passaram a se linkar.
3. Canibalização 3 ("camila farias") investigada e **descartada**: nome comum, e as queries que especificam a médica ("dra camila farias") já ranqueiam em posição 1. Não é problema de SEO.

**Dívida técnica encontrada e eliminada (25/08/2026):** 39 dos 65 posts do blog linkavam para `beige-spoonbill-804079.hostingersite.com`, o domínio provisório da Hostinger usado na migração, que está morto. Cada post tinha exatamente um link, com âncora rica e variada. Todos foram reapontados para as páginas de serviço do site conforme a âncora, mais 42 linhas `_wp_old_slug` que guardavam a URL de staging como slug. Zero referências restantes no banco, nos arquivos e no sitemap. **Se aparecer domínio `*.hostingersite.com` em outro blog migrado da rede, checar a mesma coisa: a migração da Hostinger deixa esse rastro.**

**Lacuna de conteúdo identificada:** o blog tem 3 posts sobre síndrome metabólica mas o site não tem página de serviço para o tema. Os links desses posts foram apontados para a página de colesterol alto como aproximação. Página dedicada é oportunidade em aberto.

**Consolidação executada em 25/08/2026.** 17 dos 72 posts tinham zero impressão em 90 dias. Resolvido assim: **10 posts viraram rascunho com 301 no Rank Math Redirections** para o irmão vencedor (nada foi apagado, porque o conteúdo foi cobrado do cliente e ele precisa ver que existiu e foi redirecionado), **4 posts absorveram o conteúdo único** dos rascunhos antes do redirect (sintomas-de-diabetes, sindrome-metabolica, ovario-policistico-pode-virar-cancer, tratamento-do-pre-diabetes, todos agora entre 2.900 e 4.500 palavras com FAQPage unificado), e **5 posts foram mantidos** por terem tema legitimamente distinto. Blog ficou com 62 publicados e 10 rascunhos.

**Onde ficam os redirects deste blog:** modulo **Redirections do Rank Math**, tabela `<<REMOVIDO>>`. O campo `sources` e um array serializado no formato `[['ignore'=>'', 'pattern'=>'slug-antigo/', 'comparison'=>'exact']]` e `url_to` e absoluto. Depois de inserir direto no banco, **truncar `<<REMOVIDO>>`**, senao o redirect demora a valer.

**Linkagem resolvida em 25/08/2026.** O blog tinha 36 dos 62 posts sem nenhum link interno chegando e **zero link externo em todos os 62**. Corrigido: 36 pares fonte/destino com fonte distinta cada e ancora com a keyword do destino (nenhuma ancora repetida mais de 2x), e 1 link externo de autoridade em cada post. Resultado conferido no ar: **zero orfaos, zero posts sem link externo**.

**Fontes externas aprovadas para os sites medicos (nao sao concorrentes, todas testadas 200):** SBEM `endocrino.org.br` (tem pagina por tema: /tireoide/, /diabetes/, /menopausa/, /adrenal/, /osteoporose/, /colesterol/, /dislipidemia/, /obesidade/, /reposicao-hormonal/, /metabolismo/, /sindrome-dos-ovarios-policisticos/), Sociedade Brasileira de Diabetes `diabetes.org.br`, Febrasgo, ABESO, Ministerio da Saude `gov.br/saude` e OMS `who.int`.

**Armadilha ao validar link externo:** `diabetes.org.br` e `abeso.org.br` devolvem **403 para user-agent de robo** e 200 com header de navegador. Sempre testar com UA de Chrome + `Accept-Language` antes de concluir que o link esta quebrado. E ao gerar lista de URLs em Python no Windows, gravar em modo binario ou com quebra de linha unix explicita, senao o retorno de carro entra na URL e o curl devolve 000.

**Auditoria tecnica on-page de 25/08/2026 (85 paginas, site + blog).** Corrigido no mesmo dia: typo `"@context": " "https://schema.org"` que invalidava o FAQPage dos DOIS maiores posts do blog (dieta-da-tireoide e nivel-de-progesterona-na-menopausa, 29 mil impressoes somadas); template de title do Rank Math (`pt_post_title`) que somava " - Blog Dra. Camila Farias" e estourava 60 caracteres em 30 dos 62 titles, agora e so `%title%`; 44 anexos sem alt text, que zeraram as 345 imagens sem alt do blog de uma vez (o alt vem do anexo, nao do post, entao arrumar a midia conserta imagem destacada e miniaturas juntas); 6 meta descriptions curtas; e `/consultas` que estava no sitemap do site mesmo devolvendo 301.

**Core Web Vitals medidos:** site estatico mobile **99** (LCP 1,8s, CLS 0, TBT 0ms), blog mobile **75 com LCP 5,1s**, que e o unico problema real de performance. A imagem destacada do blog ja tem `fetchpriority="high"`, alt, dimensoes e srcset, e pesa so 45KB, entao o gargalo e o CSS/JS do tema Jannah (69KB de JS e 33KB de CSS nao usados) e a **ausencia de cache de pagina** (o blog tem redis-cache para objeto, mas nenhum plugin de full-page cache).

**Rodada de otimizacao de 25/08/2026, tudo aplicado e conferido.**

*Performance do blog:* o gargalo era o `header_code` do tema, que carregava gtag.js (165 KB, maior asset da pagina) e o script da Ahrefs no page load. Trocado por carregamento apos a primeira interacao, o padrao do CLAUDE.md. Mais um mu-plugin `camila-lcp-preload.php` que faz preload da imagem destacada. Resultado no mobile: perf 75 para 84-88, LCP 5,1s para 3,2-3,3s, CLS 0,02 para 0,001. Valor antigo do header guardado em `tie_jannah_options_backup_header_code`. **Lab data do Lighthouse varia muito entre execucoes** (o mesmo tipo de post deu 3,2s e 5,6s), entao medir duas vezes antes de concluir.

*Conteudo:* FAQ de 4 perguntas nos 6 posts que nao tinham (agora 62/62 com FAQPage valido), e os 2 posts finos (bioimpedancia e hormonios, ~350 palavras cada, sem nenhum H2) reescritos com hierarquia completa.

*Paginas de servico do site, o achado de maior valor:* os titles falavam da doenca ("Tireoide em Goiania") mas as buscas com impressao pedem o profissional ("especialista em tireoide", "medico de diabetes"). Sem o termo no title o snippet nao casa e o CTR fica zero. Piores casos: metabolismo osseo em **posicao 2,6 para "osteoporose tratamento"** sem a palavra no title, hipofise em **posicao 1,6 para "adenoma de hipofise"** sem "adenoma", reposicao hormonal em **posicao 1,8 para "hormonio bioidentico goiania"** sem "bioidentico". 10 paginas realinhadas, commits `bafead9` e `2e9e3be`.

*`resistencia-a-insulina` resolvido como diagnostico:* busca pelo title exato mais o dominio **nao retorna a pagina**, mas retorna outros posts do blog. Ela esta rastreada e **nao indexada**. On-page esta tudo certo (title, H1, canonical, index/follow, 3.100 palavras, 7 links internos), e a SERP do termo e dominada por Rede D'Or, Doctoralia, Tua Saude e Minha Vida. Nao e problema tecnico, e autoridade. Submetido ao IndexNow.

**IndexNow do blog ja esta configurado:** chave `<<REMOVIDO>>` no modulo instant-indexing do Rank Math, arquivo servido em `/<<REMOVIDO>>.txt` (HTTP 200). POST em `https://api.indexnow.org/indexnow` com host, key, keyLocation e urlList devolve 200. Isso atinge Bing e Yandex, **nao o Google**.

**Ainda em aberto:** o LCP mobile do blog nao chega aos 2,5s so com o que foi feito; falta atacar os 8 CSS do tema Jannah (80 KB, com `fontawesome.css` 99,5% nao usado), o que exige conferencia visual. E confirmar na SERP se e AI Overview comendo o CTR, que **nao da para verificar por ferramenta**, so olhando a busca na mao.

## Linkagem interna do dominio unificado (25/08/2026)

Levantada com um grafo que separa link de **conteudo** de link de cabecalho e rodape, porque so o primeiro distribui autoridade de forma util. Script de apoio ficou no scratchpad; vale reescrever quando precisar (parseia os HTML locais, monta entradas e saidas por URL).

**Diagnostico:** 802 links de conteudo no dominio, mas com assimetria grave. **blog -> site: 212 links. site -> blog: 1 link.** O rastreador entrava nas paginas comerciais e nao encontrava caminho para o conteudo. E a pagina de **menopausa, principal servico da clinica, recebia zero links do blog**: os 10 artigos de menopausa apontavam para a pagina de reposicao hormonal, efeito colateral da correcao de canibalizacao que eu mesmo fiz de manha.

**O que foi feito:**
1. `scripts/links_site_para_blog.py` insere um bloco "Leia no blog" com tres artigos do tema em cada pagina de servico. **48 links novos**. Tem `CURADO` para os casos onde o pareamento por token erra, que e sempre a categoria guarda-chuva "outras-condicoes-endocrinas". Marcado com `data-gerado="links-blog"`, entao rodar de novo substitui em vez de duplicar, e `--desfazer` remove.
2. `SERVICO_DA_CATEGORIA` em `blog_base.py`: a chamada de cada artigo passa a apontar para a pagina de servico do tema, com ancora que carrega a keyword. **62 links distribuidos por assunto**, e sobrevive a regeneracao do blog.
3. Link de conteudo ganhou sublinhado de 2px e peso 600. Motivo real da queixa do dono: **so 17 dos 96 links de conteudo do site sao ancora inline**, o resto e cartao inteiro clicavel, entao praticamente nao havia link visivel dentro do texto.

**Resultado:** site -> blog de 1 para 49. Menopausa de 6 para 16 links (10 do blog). SOP de 10 para 18. Diabetes de 25 para 50. Hipofise de 6 para 14.

**Ainda com zero link vindo do blog:** avaliacao genetica, como escolher acompanhamento, deficiencia de hormonios sexuais, metabolismo osseo e emagrecimento. Sao paginas de baixo volume e o mapa categoria/servico nao alcanca elas; resolveria com CTA por artigo em vez de por categoria.

## Lacunas de conteudo, 12 meses de Search Console (25/08/2026)

**A descoberta mais importante, e ela vale para todos os sites medicos da carteira:** comparando CTR na MESMA faixa de posicao, em 12 meses de dados,

| Posicao | Busca local/comercial | Busca informacional |
|---|---|---|
| 3 a 5 | **1,99%** | **0,17%** |
| 5 a 10 | 0,63% | 0,20% |

Doze vezes de diferenca na mesma posicao. E dentro das informacionais a separacao e ainda mais brutal: `acromegalia` tem **27.178 impressoes na posicao 3,6 e 7 cliques (0,03%)**, enquanto `ovario policistico causa dor na relacao` tem 1.604 impressoes na posicao 4,0 e CTR de **1,50%**, cinquenta vezes maior.

**Conclusao operacional:** query de uma palavra ou definicional (`acromegalia`, `o que e acromegalia`) o Google responde sozinho e o clique nao chega, por melhor que seja a posicao. Pergunta especifica de sintoma ou decisao ainda rende clique. **Nao escrever mais "o que e X" para esta carteira.** Isto tambem confirma, com dado proprio, a suspeita de AI Overview que ficou em aberto no diagnostico de manha.

**Maior oportunidade, e nao e blog:** cluster de **convenio** com **39.978 impressoes e 720 cliques em 12 meses**, sem nenhuma pagina propria. `endocrinologista unimed goiania` sozinha tem 14.219 impressoes, posicao 4,9. Ipasgo soma 1.944 e outros convenios 2.554. Tudo cai na home. Pede pagina de servico, nao artigo.

**Temas de alto volume nacional que o site NAO tem sinal nenhum** (nao sao oportunidade detectada, sao aposta em terreno novo): canetas de emagrecimento (Ozempic, Mounjaro, semaglutida) com 12 impressoes no ano inteiro, acantose nigricans com zero, lipedema com uma.


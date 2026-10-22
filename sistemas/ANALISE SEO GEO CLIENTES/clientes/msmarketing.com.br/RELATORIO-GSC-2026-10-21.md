# MS Marketing (msmarketing.com.br): diagnóstico Search Console

Data: 21/10/2026. Fonte: API do Search Console pela service account seoqmix (propriedade `https://msmarketing.com.br/`, prefixo de URL, não domínio). Janelas: 16 meses para trajetória, 90 dias (19/07 a 18/10) para diagnóstico, 90 dias anteriores para comparação. Dados brutos em `dados/gsc_dump.json`. Revisita query + página em `msmarketing-REVISITA-2026-10-21.md`.

Perfil do site: WordPress + Elementor, agência de marketing em Belo Horizonte. 86 posts (31 de 2023, 27 de 2025, 7 de 2026), 43 páginas (serviços, portfólio, briefings, páginas de cidade: Joinville, Manaus, Maceió, Contagem, Blumenau, RJ).

## 1. Trajetória geral

O site perdeu cerca de 70% dos cliques orgânicos em um ano, e a queda não é de posição, é de clique.

| Mês | Cliques | Impressões | Posição média |
|---|---|---|---|
| 2025-07 | 498 | 136.087 | 26,0 |
| 2025-09 | 563 | 120.653 | 19,0 |
| 2025-12 | 275 | 86.678 | 12,4 |
| 2026-03 | 308 | 112.011 | 12,6 |
| 2026-05 | 240 | 95.611 | 13,0 |
| 2026-06 | 137 | 73.344 | 16,2 |
| 2026-09 | 173 | 68.347 | 15,1 |

Dois degraus: um entre outubro e dezembro de 2025 (de 400 para 275) e outro em junho de 2026 (de 240 para 137). A posição média melhorou de 26 para 13 no mesmo período, o que descarta penalização: o que sumiu foram impressões de cauda longa em posição ruim e, principalmente, cliques em páginas que continuam no top 3.

O caso mais claro é a página "quanto custa uma identidade visual". Em julho de 2025 ela rendeu 191 cliques no mês; em junho de 2026, 15; em outubro, 7. A consulta principal continuou em posição 1 a 3 com o mesmo volume de impressões (100 a 130 por mês) o mês inteiro. Esse padrão (posição mantida, impressões mantidas, cliques evaporados) é a assinatura de AI Overview e respostas diretas absorvendo o clique em consultas de "quanto custa" e "o que é". A página "quanto custa um logo" zerou do mesmo jeito (33 cliques em julho de 2025, 0 agora). Isso precisa ser confirmado abrindo a SERP, mas a mecânica bate.

Não há anomalia de invasão (nenhum pico de impressões em milhões) nem sinal de migração.

## 2. Estrutura do tráfego

Últimos 90 dias, busca web: 432 cliques em 216.468 impressões, CTR 0,20%. Período anterior: 576 cliques em 244.280 impressões. Queda de 25% em cliques e 11% em impressões.

Metade das impressões é pacote de imagens dentro da busca web. Quatro posts de design (logo de luxo, paleta de cores, logo para loja de roupa, encarte) somam 97.000 impressões com 80 cliques. Eles aparecem em "posição" 2 a 6 com CTR de 0,04% a 0,2%, o que só acontece quando a impressão é a miniatura da imagem no carrossel, não o resultado azul. A busca de imagens em separado confirma: 220.656 impressões e 263 cliques no tipo "image", com as mesmas páginas no topo. Esse tráfego não tem relação com o negócio (cliente de agência em BH) e infla a posição média do site. Deve ser lido à parte.

Tirando esses quatro posts, o site tem cerca de 120.000 impressões e 350 cliques reais em 90 dias. Desses, a home responde por 98 cliques, dos quais 50 são de busca pela marca "ms marketing".

Queries ocultas: as consultas visíveis somam 188 cliques contra 432 nas páginas. 56,5% dos cliques vêm de cauda longa que o Google não mostra, mesmo pela API. Otimizar só pela lista visível subestima o valor das páginas pela metade.

Dispositivo: desktop 278 cliques (posição 23) contra mobile 152 (posição 8,8). A home ganha quase tudo no desktop (64 contra 12), o que é típico de busca B2B de agência em horário comercial. País: 97% Brasil.

## 3. Diagnóstico por posição

Consultas com 200 ou mais impressões, busca web, 90 dias:

**Porta da click zone (posição 4 a 15): 27 consultas, 54.083 impressões, 20 cliques.** Dominado por "logo marca" (33.296 impressões, posição 5,6, 10 cliques), que é imagem, e por "encarte", "logo 3d", "logo para loja", "videomaker bh". Dessas, a única comercial é "videomaker bh" / "videomaker em bh" (1.193 impressões somadas, posição 8,6 a 9,1, 4 cliques).

A porta da click zone que interessa está abaixo do corte de 200 impressões e vive na home. São as consultas locais de agência:

| Consulta | Impressões | Posição | Cliques |
|---|---|---|---|
| agência de marketing digital em belo horizonte | 185 | 9,3 | 0 |
| agencia de marketing bh | 174 | 5,9 | 3 |
| agencia de marketing digital em bh | 142 | 15,5 | 0 |
| agencia de marketing em bh | 120 | 7,4 | 1 |
| agencia de marketing digital bh | 111 | 10,0 | 0 |
| agencias de marketing em bh | 94 | 8,2 | 0 |
| melhor agência de marketing digital em belo horizonte | 85 | 8,5 | 0 |
| agência de marketing digital belo horizonte | 80 | 11,2 | 0 |
| consultoria de marketing digital bh | 59 | 3,0 | 0 |
| empresas de marketing digital em bh | 55 | 8,6 | 0 |
| agência de seo belo horizonte | 43 | 12,2 | 0 |
| criação de sites bh (página de serviço) | 300 | 13,7 | 3 |
| criação de site bh (página de serviço) | 168 | 16,3 | 0 |
| criação de sites minas gerais (página de serviço) | 47 | 6,1 | 0 |

Somando as variações de "agência de marketing (digital) (em) bh / belo horizonte", a home tem perto de 1.500 impressões em 90 dias entre as posições 5 e 15. Com zero cliques na maioria. Subir três ou quatro posições aqui é a diferença entre invisível e primeira dobra, e é o argumento direto para uma campanha de backlinks apontando para a home e para a página de criação de sites.

**Falta de autoridade (posição acima de 30): 27 consultas, 25.189 impressões, 7 cliques.** Aqui mora a home para os termos nacionais sem cidade: "agência de marketing" (2.390 impressões, posição 36), "empresa de marketing" (2.255, posição 33), "agência de marketing digital" (2.131, posição 48), "agencia de marketing digital" (1.360, posição 56). Mais "seo" (5.111 impressões, posição 35, no post "o que é seo"), "identidade visual" (2.387, posição 43), "site institucional", "quanto custa um site". Esses termos nacionais não são batalha vencível para uma agência de BH sem autoridade de domínio; a recomendação é aceitar que a home disputa o local e deixar o nacional para o blog.

**Conteúdo/title (top 3 com CTR baixo): 25 consultas, 17.480 impressões, 31 cliques.** Todas de paleta de cores ("cor bonina", "paleta terracota", "paleta de cores marrom e bege") e logo de loja. São imagens e respostas visuais diretas na SERP. Não reescrever title por causa delas.

**Meio (16 a 30): 9 consultas.** "logomarca" (1.290, posição 25), "criação de sites bh" com 334 impressões a 17,9 quando a consulta cai na home em vez de na página de serviço, "marketing digital bh" (239, posição 24).

## 4. Canibalizações confirmadas (query + página)

1. **"seo bh" e variações.** A página de serviço `/servicos-de-seo-em-bh-ms-marketing/` está em posição 49,8 (209 impressões) enquanto a home aparece em 25,1 (58 impressões) para a mesma consulta. A página de serviço perde para a própria home. Para "agência de seo belo horizonte" a home está em 8 a 12 e a página de serviço em 58 a 77. Ação: a página de serviço precisa de link interno forte a partir da home (hoje a home linka para ela sem barra final, `/servicos-de-seo-em-bh-ms-marketing`, o que gera redirect) e de backlinks próprios; alternativa é consolidar SEO como seção da home e deixar a página de serviço para "consultoria de seo bh", onde ela já está em 25 a 35.

2. **"criação de sites bh" e variações.** Três URLs rotacionam: `/criacao-de-sites-bh-belo-horizonte/` (posição 13,7, 300 impressões), a home (posição 64, 91 impressões) e `/criacao-de-sites-em-contagem/` (posição 39). Existe ainda `/agencia-de-sites-desenvolvimento-e-criacao-de-websites/` no sitemap. A vencedora é clara (página BH). Ação: tirar "criação de sites" do H2 da home onde ela compete, deixar só link, e revisar se a página de Contagem e a de "agência de sites" têm razão de existir ou viram 301 para a de BH.

3. **"identidade visual" e "quanto custa".** Quatro páginas disputam o campo: `/elementos-da-identidade-visual-veja-quais-sao/` (posição 26 para "identidade visual"), `/identidade-visual-completa-o-guia-definitivo-para-sua-marca/` (posição 84, mas 16 cliques em 90 dias), `/criacao-de-logo-e-identidade-visual-o-que-e-e-por-que-e-importante/` (posição 92) e a página comercial `/criacao-de-logomarca-e-identidade-visual/`, que teve 1 impressão em 90 dias. A página que vende o serviço é invisível e os posts ocupam o espaço. Para "logomarca preço" e "quanto custa um branding", `/quanto-custa-uma-identidade-visual/` e `/quanto-custa-um-logo/` rotacionam (22,7 contra 21,9 e 3,0 contra 37,4). Ação: 301 de `/criacao-de-logo-e-identidade-visual-o-que-e.../` para a página comercial; fundir `/quanto-custa-um-logo/` em `/quanto-custa-uma-identidade-visual/` com seção própria de "quanto custa um logo"; linkar a página comercial a partir dos três posts com âncora "criação de identidade visual".

4. **"logomarca".** `/logomarca-o-que-e-significado-e-dicas-para-criar-a-sua/` (posição 22, 1.131 impressões) e `/logo-de-luxo/` (posição 45, 236 impressões). Não é canibalização grave; a de luxo só aparece por imagem.

5. **"fazer logomarca" / "criar logomarca".** `/apps-para-criar-logomarcas-gratis/` e `/site-para-fazer-logomarca/` empatados em posição 16, mais `/logomarca-o-que-e/` em 51. Dois posts com a mesma intenção. Ação: 301 de "site para fazer logomarca" para "apps para criar logomarcas" e absorver os sites citados.

6. **Agromarketing.** `/marketing-para-o-agronegocio/` (posição 56 a 74) e `/o-que-e-agromarketing/` (posição 40 a 73) rotacionam em "marketing agronegócio". Nenhum entra no índice. Fundir num só ou deixar como está, dado que o tema não é o negócio.

## 5. Oportunidades de CTR

As páginas com posição até 8 e mais de mil impressões são todas de imagem (logo de luxo, paleta de cores, encarte, logo para loja de roupa, logo 3D). Mexer no title delas não muda nada porque a impressão é a miniatura.

As oportunidades reais estão nas consultas locais da home, em posição 5 a 10 com zero cliques: "agência de marketing digital em belo horizonte" (185 impressões, posição 9,3, CTR 0%, esperado 2%), "agencia de marketing bh" (174, posição 5,9, 1,7% contra 4% esperado), "consultoria de marketing digital bh" (59, posição 3,0, 0% contra 9% esperado). O title atual, "Agência de Marketing em BH | Sites, SEO, Tráfego Pago e Marketing", termina com "e Marketing" redundante e não fala "digital" nem "Belo Horizonte" por extenso. Proposta: "Agência de Marketing Digital em Belo Horizonte (BH) | MS Marketing" com meta description que cite consultoria, sites e SEO. Anotar a data para medir em 3 a 4 semanas.

Em "quanto custa uma identidade visual" (306 impressões, posição 2,5, CTR 1,3% contra 14% esperado) a perda é para AI Overview. A única alavanca é colocar a faixa de preço em reais logo abaixo do H1, em frase curta, para disputar a citação dentro do próprio AI Overview; isso é GEO, não CTR clássico.

Na página de videomaker, "videomaker em bh" (744 impressões, posição 9,1, 1 clique) e "video maker bh" com grafia separada (144 impressões): escrever "video maker" uma vez no texto e no title.

## 6. Plano de conteúdo pelo que o Google já associou

Detalhe completo na revisita. Resumo por URL:

**Home.** Reforçar (palavras já no texto, frase exata não): "agência de marketing digital em bh", "marketing digital bh", "marketing digital belo horizonte", "agência de marketing online", "empresa de marketing em bh", "consultoria de marketing digital bh", "agência de seo bh". Expandir (palavra ausente): "assessoria de marketing" (93 + 69 + 47 + 43 impressões em posições 8 a 17, é a mesma intenção de consultoria), "agência de publicidade em bh" (23 + 17 + 15 em posição 12 a 20), "agência de marketing para pequenas empresas", "agência social media bh", "agência de marketing digital para clínica bh" (19 impressões, posição 18,8, e o site tem página de marketing médico em Blumenau, não em BH). Grafia: "ms marketing" já cobre, falta "msmarketing" junto. Candidata a página nova: "quanto custa agência de marketing digital bh" (14 impressões, posição 21), confirmar na SERP; provavelmente H2 com FAQ na home resolve.

**Criação de sites BH.** Reforçar: "criação de site bh" (168 impressões, posição 16), "criação de sites em belo horizonte" (108, posição 22), "criação de site profissional bh", "landing page bh" (32, posição 16), "hospedagem de sites bh". Expandir: Betim e Contagem aparecem com 180 impressões somadas em posição 66 a 91 nessa página e na home; em vez de página de cidade separada (a de Contagem já existe e está em 39), um H2 "Atendemos Betim, Contagem, Nova Lima e região metropolitana" na página BH e 301 da página de Contagem para ela. "criação de sites minas gerais" (47 impressões, posição 6,1, zero cliques) pede "Minas Gerais" no title ou no H1.

**Serviços de SEO em BH.** Reforçar: "seo bh" (209 impressões, posição 50), "consultor seo bh", "consultoria de seo bh", "seo local bh". A página tem 1.963 palavras e nenhuma dessas frases exatas. Expandir: "especialista seo bh".

**Quanto custa uma identidade visual.** Reforçar: "identidade visual valor", "valor de identidade visual", "identidade visual preço", "quanto custa um branding" (124 impressões, posição 3). Expandir: "quanto cobrar por uma identidade visual" (50 impressões, posição 2,6) e "quanto cobrar por uma identidade visual iniciante" (44, posição 8,3), que são a intenção do designer freelancer, não do cliente; H2 próprio na mesma página, porque a SERP é a mesma. Absorver "quanto custa um logo" como seção.

**Elementos da identidade visual.** Reforçar: "id visual" (212 impressões, posição 5,5, zero cliques), "o que é identidade visual" (74, posição 31). Expandir: "identidade visual corporativa", "o que compõe uma identidade visual", "identidade visual exemplos" (conferir SERP; provavelmente H2 com exemplos).

**Videomaker BH.** Grafia "video maker". Expandir: "filmmaker bh" (36 impressões, posição 9,6), "produtora de vídeo bh" (a página de filmagem com drone pode absorver).

**Logo de luxo.** Só imagem, não mexer. Se quiser aproveitar as 33 mil impressões de "logo marca", a página precisaria virar um guia de "logomarca" com CTA para a página comercial, mas o retorno em leads é incerto.

## 7. Sinais de GEO e schema

O site não tem schema `Organization`, `LocalBusiness` ou `ProfessionalService` em nenhuma página; o que existe é `WebSite`, `WebPage`, `Person`, `BreadcrumbList` e um `FAQPage` na home. Para busca local e para citação em respostas de IA, falta entidade com nome, endereço, telefone, área atendida e `sameAs`. O Mod_Security do servidor devolve 406 para user-agent "curl" puro mas libera GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot e Googlebot. Não há `llms.txt`. A página `/consultoria/` não tem H1.

## 7b. Autoridade do domínio (Moz, rastreio de 12/10/2026)

| Métrica | Valor |
|---|---|
| Domain Authority | 25 |
| Page Authority (home) | 33 |
| Spam score | 2% |
| Domínios de referência | 160 |
| Páginas externas linkando | 807 |

DA 25 com 160 domínios de referência é um perfil mediano para agência local. Os links mais fortes são ig.com.br (DA 94), sebrae.com.br (DA 86) e um bloco grande de domínios DA 58 a 66 com cara de rede de guest post (tntcode.com, mylisthero.com, mymarketpost.com, cmocheatsheets.com, currentchron.com, emergencydentistinrichmondva.com, lydiaroyrealestate.com com spam 39, plumeriamarketing.com com spam 41). Ou seja, o cliente já compra ou já comprou links em redes genéricas, boa parte fora do Brasil e sem relação com marketing em BH. Isso explica a autoridade "de papel" que não converte em posição nos termos locais: o Google pesa relevância do domínio de origem, e links de portais brasileiros de notícia com texto em português sobre marketing e negócios em Minas Gerais valem mais para a home do que esses DA 60 estrangeiros. Argumento para a QMIX Digital: trocar volume genérico por 5 a 8 links editoriais em portais brasileiros por trimestre, apontando para a home e para a página de criação de sites.

Nota: o OpenPageRank foi abandonado em outubro de 2026 (chave antiga inválida, serviço migrou para a Keywords Everywhere). A fonte de autoridade do sistema passa a ser a Moz API na VPS hostinger-vps-srv1166087, com cota de 120.000 linhas por mês (93.381 usadas em 21/10).

## 8. Plano de ação por prioridade

1. **Custo zero, esta semana.** Trocar o title e a meta description da home para a versão com "Belo Horizonte" e "Digital". Escrever as frases exatas listadas em "reforçar" na home, na página de criação de sites e na de SEO. Escrever "video maker" na página de videomaker. Corrigir o link interno da home para a página de SEO (barra final). Colocar H1 em `/consultoria/`.
2. **Consolidação, próximas duas semanas.** 301 de `/criacao-de-logo-e-identidade-visual-o-que-e.../` para a página comercial de identidade visual. Fundir `/quanto-custa-um-logo/` em `/quanto-custa-uma-identidade-visual/`. 301 de `/site-para-fazer-logomarca/` para `/apps-para-criar-logomarcas-gratis/`. Decidir o destino da página de Contagem (301 para BH com H2 regional). Linkar a página comercial de identidade visual a partir dos três posts do tema.
3. **Expansão, mês 1.** H2 de "assessoria de marketing", "agência de publicidade" e "marketing para pequenas empresas" na home. H2 de Betim, Contagem e região na página de criação de sites. H2 "quanto cobrar por uma identidade visual" no post de preço, com faixa em reais logo abaixo do H1 para disputar o AI Overview. Schema `ProfessionalService` com endereço, telefone e `areaServed` em todas as páginas.
4. **Link building, mês 1 a 3.** Campanha da QMIX Digital apontando para a home (âncoras: "agência de marketing digital em Belo Horizonte", "agência de marketing em BH", "consultoria de marketing digital BH") e para `/criacao-de-sites-bh-belo-horizonte/` (âncoras: "criação de sites em BH", "criação de sites em Belo Horizonte"). Justificativa nos dados: cerca de 1.500 impressões em 90 dias nas posições 5 a 15 só na home, 470 na página de sites, e os termos com cidade têm concorrência local, não nacional. Rodar a revisita 30 e 60 dias depois de cada lote.
5. **Medir.** Registrar a data de cada mudança de title e comparar CTR das consultas locais em 3 a 4 semanas. Acompanhar separadamente busca web sem os quatro posts de imagem, porque eles distorcem posição média e CTR do site.

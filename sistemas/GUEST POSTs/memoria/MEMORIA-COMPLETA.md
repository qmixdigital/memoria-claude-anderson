# Memória do claude.ai (export)

Export dos arquivos de memória da conta, feito em 14/09/2026.
Cada bloco abaixo começa com um marcador `<!-- FILE: caminho -->`.
O script `split_memoria.py` reconstrói a árvore de pastas a partir deste arquivo.

<!-- FILE: /profile.md -->
---
name: profile
description: Who Anderson is — founder of QMIX Digital and operator of BYTX, based in Goiânia, Brazil
sources: [backfill, chat]
aliases: []
---
- [stated] Name: Anderson
- [stated] Founder of QMIX Digital (qmix.com.br), a Brazilian SEO and link building agency based in Goiânia, active since 2020
- [stated] QMIX Digital: 500+ partner portals, 5,000+ published links, 500+ clients
- [stated] Operates BYTX LTDA (CNPJ 65.649.904/0001-98, Campinas/SP, bytx.com.br), focused on digital infrastructure and web projects
- [stated] Based in Goiânia, Goiás, Brazil
- [stated] A maioria dos clientes da QMIX Digital são médicos, geralmente ortopedistas e dermatologistas; clientes de tratamentos de emagrecimento devem entrar em breve
- [stated] Serviços da QMIX Digital: produção de conteúdo para publicações em portais e, para clientes mensalistas, publicações no blog do cliente com cuidado integral: pesquisa de oportunidades no Google Search Console, pesquisa de palavras-chave da especialidade no Semrush e ferramenta que monitora posicionamento e analisa a evolução com IA, sugerindo melhorias e novos conteúdos
- [stated] Marketplace da QMIX Digital tem novo sistema: após a compra, o próprio cliente gera o conteúdo da publicação, aprova ou faz pequenas alterações por conta própria antes de ir ao ar

<!-- FILE: /areas/byd-youtube-channel.md -->
---
name: byd-youtube-channel
description: YouTube channel covering BYD vehicle launches in China
sources: [backfill]
aliases: []
---
- [stated] Building a YouTube channel covering BYD vehicle launches in China (including the Da Han EV flagship sedan)
- [stated] Researching official BYD press/media assets and copyright-safe video sourcing for monetized content

<!-- FILE: /areas/casa-da-toalha.md -->
---
name: casa-da-toalha
description: Cliente Casa da Toalha (casadatoalha.com.br), e-commerce de cama, mesa e banho; conteúdo para o blog do cliente
sources: [chat]
aliases: [casadatoalha.com.br]
---

- [stated] Cliente da QMIX Digital: Casa da Toalha (casadatoalha.com.br), loja de toalhas, jogos de cama e panos de prato
- [stated] Cliente pede conteúdo em formato lista para o próprio blog, com a Casa da Toalha em 1º lugar
- [stated] Pediu dois guias para o blog: "As melhores toalhas de banho do Brasil: guia por gramatura" e "Percal 300 fios: poliéster ou algodão?"

<!-- FILE: /areas/dr-ulbiramar.md -->
---
name: dr-ulbiramar
description: Cliente Dr. Ulbiramar Correia, ortopedista especialista em joelho em Goiânia; interesse em criar página na Wikipédia
sources: [chat]
aliases: [Ulbiramar Correia, Dr. Ulbiramar]
---

- [stated] Dr. Ulbiramar Correia, ortopedista especialista em joelho em Goiânia, é cliente da QMIX Digital
- [stated] Anderson quer saber o que é preciso para criar uma página na Wikipédia para ele

<!-- FILE: /areas/euvo-events.md -->
---
name: euvo-events
description: euvo.com.br events agenda platform (Next.js + Prisma + PostgreSQL)
sources: [backfill]
aliases: [euvo.com.br]
---
- [stated] Events agenda at euvo.com.br, built with Next.js + Prisma + PostgreSQL proxied via Nginx
- [stated] Seeded with 465+ events from Ticketmaster, Ingresso.com, and Ticket360
- [stated] Built and deployed in the same working session as the Google News Discovery motor

<!-- FILE: /areas/fazenda-legacy.md -->
---
name: fazenda-legacy
description: Loja virtual Fazenda Legacy (fazendawestern.com.br), cliente de moda western/country; layout em aprovação, site será feito em Next.js
sources: [chat]
aliases: [fazendawestern.com.br, Fazenda Western, loja country]
---

- [stated] Cliente Fazenda Legacy, marca de moda western/country (produtos no estilo da TXC), domínio fazendawestern.com.br
- [stated] Possui kit de identidade visual (IDV) com paleta oficial, fontes The Seasons + Montserrat, símbolo "F" e patterns
- [stated] Site será desenvolvido em Next.js
- [stated] Fluxo combinado: enviar layout ao cliente primeiro (apresentação em HTML); após aprovação, gerar versão em PDF

<!-- FILE: /areas/google-news-discovery.md -->
---
name: google-news-discovery
description: Autonomous news pipeline (Google News Discovery motor), separate from Sistema Antônio, deployed on Hetzner
sources: [backfill]
aliases: [Google News Discovery motor]
---
- [stated] Autonomous news pipeline, separate from Sistema Antônio, deployed on a dedicated Hetzner CX32 server
- [stated] Collects Google News RSS, decodes links, extracts text via Trafilatura, deduplicates, generates articles via Claude Sonnet 5 Batch API, publishes to Portal Engine and WordPress receptors across 17 pilot portals
- [stated] Called "Google News Discovery"; its own folder is already created and active in VS Code
- [stated] Built and deployed in the same working session as the euvo.com.br events agenda

<!-- FILE: /areas/info-brasil.md -->
---
name: info-brasil
description: Info Brasil (infobrasil.inf.br), a video-to-short-clips SaaS competing with Opus Clip
sources: [backfill]
aliases: [infobrasil.inf.br, CortesIA]
---
- [stated] Video-to-short-clips SaaS at infobrasil.inf.br, competing with Opus Clip
- [stated] Formerly CortesIA; rebranded the entire codebase after several name iterations
- [stated] Cascading download router (RenderIO, savenow, yt-dlp) and Gemini Flash for viral moment detection
- [stated] Processes video with yt-dlp, Groq Whisper, and Gemini Flash
- [stated] Uses a BullMQ canary system to manage download provider health

<!-- FILE: /areas/monitor-ia.md -->
---
name: monitor-ia
description: Novo serviço da QMIX: relatórios de visibilidade em IA para clientes (menções em ChatGPT/Gemini etc.) usando GSC + Analytics + Cloudflare + script próprio, em vez do Semrush One
sources: [chat]
aliases: [visibilidade em IA, monitor de menções em IA]
---

- [stated] Considera o Semrush One caro demais; decidiu fazer a medição para os clientes da [[qmix]] com Google Search Console, Google Analytics e Cloudflare
- [stated] Quer entregar aos clientes relatórios mostrando se eles estão sendo mencionados pelas ferramentas de IA, junto com relatórios do Search Console, Analytics e Cloudflare
- [stated] Decidiu implantar um script próprio (Python) que consulta as IAs e registra menções, rodando no próprio servidor/PC
- [stated] Os clientes já têm os extras recomendados (Perfil da Empresa no Google, dados estruturados, páginas de apresentação completas)

<!-- FILE: /areas/pixbet.md -->
---
name: pixbet
description: Cliente Pixbet (casa de apostas), publicações em portais de notícias com foco em reputação online na busca pela marca
sources: [chat]
aliases: [Pixbet, PixBet]
---

- [stated] Cliente da QMIX Digital; apresentou deck de "Estratégia de Autoridade Digital & SEO" (4 pilares: história, dados/pesquisas, executivos, mercado)
- [stated] Objetivo real: melhorar a reputação online, aparecer bem quando pesquisam o nome da marca no Google e, de certa forma, ocultar reportagens negativas
- [stated] Cliente autorizou publicar em portais de notícias como a Band e outros
- [stated] Ignorar os conteúdos negativos extremamente políticos ao pesquisar/planejar pautas
- [stated] Interesse do cliente é conteúdo evergreen com o nome Pixbet no título, sem nenhuma referência a fatos do momento
- [stated] Cliente escolheu 3 pautas para produção: "Pixbet é confiável? Licença, CNPJ, sede e o que verificar antes de apostar", "O que significa o nome Pixbet e por que a marca nasceu junto com o Pix" e "Linha do tempo da Pixbet no futebol brasileiro: últimos 5 anos de clubes patrocinados"; briefing montado para desenvolver as matérias em outro chat

<!-- FILE: /areas/plataforma-consultas.md -->
---
name: plataforma-consultas
description: Projeto da BYTX de plataforma de consultas (CPF/CNPJ/score/restritivos) usando a API da Procob como fornecedor, com banners da Procob nos diretórios programáticos
sources: [chat]
aliases: [Procob, API Procob, plataforma de consultas]
---
- [stated] Pretende criar, pela BYTX, uma plataforma de consultas para competir com sites como megaconsultas.com.br, usando a API da Procob (api.procob.com) como fornecedor; diferencial é aquisição de clientes via SEO/tráfego orgânico, com os diretórios de [[programmatic-directories]] como funil
- [stated] Também pretende inserir banners da Procob nos diretórios
- [stated] Em 05/09/2026 preparou e-mail em nome da BYTX para a Procob pedindo proposta de revenda da API (tabela por consulta, catálogo com produtos de crédito, requisitos contratuais/LGPD e parceria de mídia)

<!-- FILE: /areas/site-afiliados-pesca.md -->
---
name: site-afiliados-pesca
description: Site de afiliados do Anderson (nicho de pesca) migrado de WordPress para HTML estático no Cloudflare Pages
sources: [chat]
aliases: [site de afiliados, listicles de pesca, itacaiugo.com.br, Itacaiugo]
---

- [stated] É afiliado do Mercado Livre e da Amazon; quer os links de afiliado dos dois marketplaces em cada produto
- [stated] Tem um site WordPress que está convertendo para HTML puro e publicando no Cloudflare Pages, editando via VS Code e eliminando os plugins que usava
- [stated] Os artigos são listas de produtos de pesca ("melhores varas de pesca", "melhores carretilhas"), com produto + descrição escrita por ele; páginas já posicionadas no Google
- [stated] Avalia que no Brasil o público prefere comprar no Mercado Livre, mas as comissões da Amazon são melhores
- [stated] O site é o itacaiugo.com.br
- [stated] Percebe que o Google vem sumindo com os sites de afiliados e entregando só lojas na SERP; a QMIX perdeu muitos clientes (afiliados) por causa disso

<!-- FILE: /areas/wp-mcp-publicacao.md -->
---
name: wp-mcp-publicacao
description: MCP server próprio da QMIX para publicar artigos com imagem nos portais WordPress parceiros a partir do claude.ai
sources: [chat]
aliases: [MCP WordPress, publicação em portais parceiros]
---
- [stated] Portais parceiros são instalações próprias de WordPress (não WordPress.com); a QMIX não tem permissão para instalar plugins neles, publicação hoje é manual pela [[katia]]
- [stated] Anderson vai montar ele mesmo, no VS Code, um MCP server no Hetzner que usa a REST API do WordPress com senhas de aplicativo, para a Kátia publicar pelo claude.ai; vai testar primeiro em um site piloto
- [stated] Imagem de destaque virá de link de banco de imagens ou gerada por API de imagens

<!-- FILE: /areas/programmatic-directories.md -->
---
name: programmatic-directories
description: Programmatic CNPJ/CNAE-based directory sites built on the QMIX Digital directory model
sources: [backfill, chat]
aliases: [Personal Verificado, personalverificado.com.br, distribuidorasdealimentos.com.br]
---
- [stated] Programmatic directory model uses Receita Federal CNPJ open data filtered by CNAE
- [stated] Building a glass shop (vidraçarias) directory
- [stated] Building a personal trainers directory under the brand "Personal Verificado" (personalverificado.com.br), with CREF/CREF data ingestion
- [stated] Completed marmorarias.com.br directory scope using Receita Federal CNPJ data (CNAEs 2391-5/03 primary)
- [stated] Converted planomedicosaude.com.br and institutoortopedico.com.br into programmatic directories
- [stated] Framework for conversions: "content audit first, Sistema Antônio compatibility mandatory before migration"
- [stated] Built casasderecuperacao.com.br recovery clinics directory (Drizzle ORM, CNES/DATASUS data)
- [stated] Built medicinageriatrica.com.br geriatric directory
- [stated] Built masterjuris.com.br legal directory on the expired masterjuris.com.br domain
- [stated] Launched Encontre Leiloes directory (encontreleiloes.com.br) with Caixa CEF CSV data and Superbid vehicle integration
- [stated] Possui o domínio academus.pro.br (offline); vai virar diretório de formação na área da saúde (faculdades, técnicos, pós, residências) com seção editorial de dores ortopédicas, para entrar na rede de backlinks com foco em saúde
- [stated] saudevitalidade.com.br (portal WordPress de saúde da rede, no ar desde 2022, com posts pagos de clientes) vai virar diretório de nutricionistas e clínicas de emagrecimento, mantendo o blog com os slugs atuais; escopo (briefing, mapa de páginas, keywords) montado em 25/08/2026 para repassar ao [[guilherme]]
- [stated] Comprou o domínio cartorio.srv.br para um novo diretório programático de cartórios do Brasil (modelo do cartorio.info; dados do CNJ Justiça Aberta com código CNS como chave + cruzamento com base CNPJ CNAE 6912-5/00); monetização em fases (AdSense, depois afiliado de certidões); documentação (briefing, mapa de páginas, keywords) montada em 02/09/2026 para repassar ao [[guilherme]]
- [stated] ebookcult.com.br (site de guest post da rede, blog no ar com AdSense) vai virar diretório de livrarias, sebos e bibliotecas públicas (editoras em fase 2; papelarias fora), mantendo intacto todo o conteúdo existente (URLs, categorias, autores, páginas); só páginas institucionais podem mudar; dados Receita CNPJ (CNAE 4761-0/01) e SNBP; briefing com mapa de páginas e keywords montado em 02/09/2026 para repassar ao [[guilherme]]
- [stated] goiania.pro (domínio próprio, teste com 17 subdomínios de serviços locais validado via GSC) vai virar diretório programático de empresas e serviços de Goiânia (cidade com todos os nichos, base Receita CNPJ filtrada pelo município); decidiu trazer os subdomínios para dentro do diretório via redirect 301; documentação (briefing, mapa de páginas, keywords, checklist AdSense, SKILL-SEO) montada em 02/09/2026 para repassar ao [[guilherme]]
- [stated] consultarimovel.ia.br: novo diretório programático de imóveis rurais pela BYTX (vai comprar o domínio; escolheu o nome amplo para cobrir imóveis urbanos no futuro; considera que .ia.br remete a tecnologia nova); dados públicos CAR/SICAR, INCRA SIGEF, embargos IBAMA, SICOR, com páginas de consulta CCIR/NIRF/CAR (inspiração: registrorural.com.br, sem raspar dados de lá); serviços decididos para o lançamento: AdSense + relatório PDF do imóvel avulso + KML pago + monitoramento por e-mail, depois assinatura PRO; consulta por CPF/CNPJ entra quando a Procob responder, como funil da [[plataforma-consultas]]; fase 2 urbana editorial com afiliado de certidões e leads para agrimensores; documentação (briefing, mapa de páginas, keywords, checklist AdSense, SKILL-SEO) montada em 05/09/2026 para repassar ao [[guilherme]]
- [stated] certificadodigital.seg.br: registrou o domínio (pedido 32137524 no Registro.br, 06/09/2026; certificadodigital.srv.br e certificadodigital.ia.br já estavam tomados) para um diretório programático de Autoridades de Registro e postos ICP-Brasil + hub editorial sobre certificado digital, pela BYTX; dados do ITI (listas de AR por UF, Mapa da Certificação, estrutura.iti.gov.br) cruzados com base CNPJ; monetização em fases (AdSense, depois afiliado de certificado, depois destaque pago para ARs via Asaas); documentação completa (briefing, mapa de páginas, keywords do Ubersuggest, checklist AdSense, SKILL-SEO, design system com paleta "Selo") montada em 06/09/2026 para repassar ao [[guilherme]]
- [stated] Quer criar mais diretórios programáticos na extensão .ia.br (pediu 30 sugestões de nomes em 07/09/2026), porque domínios .ia.br aparecem nas ferramentas com DR 70 / DA 60 naturalmente, dão tráfego rápido por serem diretórios e permitem vender backlinks
- [stated] revistadeducao.com.br (portal editorial da rede, no ar com AdSense) vai ganhar um diretório programático de contadores em subpasta (/contadores/estado/cidade/bairro, perfil em /contadores/escritorio/slug), base Receita CNPJ CNAEs 6920-6/01 e 6920-6/02 com verificação de CRC no CFC; escolheu contadores em vez de escolas (escolas ficou como possível segundo diretório do site); monetização em fases (AdSense, afiliado de contabilidade online, destaque pago via Asaas, leads); documentação completa (briefing, mapa de páginas, keywords estimadas a validar, checklist AdSense, SKILL-SEO, design system) montada em 08/09/2026 para repassar ao [[guilherme]]
- [stated] desassossegada.com.br (portal editorial feminino da rede: moda, cabelo, beleza, bem-estar, casa) vai ganhar diretório programático de clínicas de estética em subpasta (/estetica/estado/cidade/bairro, perfil em /estetica/clinica/slug-cnpj, 14 procedimentos como slugs reservados), base Receita CNPJ CNAE 9602-5/02; salões (CNAE 9602-5/01) entram depois em /saloes/ com o mesmo motor; escolheu estética em vez de lavanderias/brechós (lavanderias ficou como possível segundo diretório); monetização em fases (AdSense, afiliado, destaque pago via Asaas, perfis parceiros da carteira de dermatologistas e emagrecimento da QMIX); documentação completa montada em 08/09/2026 para repassar ao [[guilherme]]
- [stated] distribuidorasdealimentos.com.br: diretório programático de distribuidoras de alimentos da BYTX já no ar (~35 mil visitas/mês em set/2026), monetização ainda baixa; quer colocar banners de programas de afiliados no site
- [stated] seuguiadesaude.com.br (portal editorial de saúde da rede, no ar com AdSense: bulas/medicamentos, doenças, emagrecer, culinária, estética) vai ganhar diretório programático de farmácias e drogarias em subpasta (/farmacias/estado/cidade/bairro, perfil em /farmacias/farmacia/slug-cnpj, tipos reservados 24-horas, manipulação, homeopática, Farmácia Popular, entrega, drogaria), base Receita CNPJ CNAEs 4771-7/01, /02 e /03 cruzada com Farmácia Popular (MS) e AFE (Anvisa); integração bula e farmácia nos artigos de Medicamentos; monetização em fases (AdSense, afiliado das redes, destaque pago via Asaas, leads de manipulados); fase 2 = laboratórios de análises clínicas em /laboratorios/; documentação completa (briefing, mapa de páginas, keywords, checklist AdSense, SKILL-SEO, design system paleta "Balcão") montada em 09/09/2026 para repassar ao [[guilherme]]
- [stated] publisherbrasil.com.br (portal editorial da rede: livros, cursos, marketing, entretenimento, saúde, negócios) vai ganhar diretório programático de editoras de livros em subpasta (/editoras/estado/cidade/bairro, perfil em /editoras/editora/slug-cnpj, 12 tipos reservados), base Receita CNPJ CNAEs 5811-5/00, 5821-2/00, 5813-1/00, 5823-9/00 cruzada com base ISBN da CBL; absorve as editoras que eram fase 2 do ebookcult (que fica só com livrarias/sebos/bibliotecas); monetização em fases (AdSense, afiliado de autopublicação/Amazon, destaque pago via Asaas, leads de autores); fase 2 = gráficas em /graficas/ no mesmo motor; documentação completa (briefing, mapa de páginas, keywords a validar, checklist AdSense, SKILL-SEO, design system paleta "Prelo") montada em 09/09/2026 para repassar ao [[guilherme]]

<!-- FILE: /people/guilherme.md -->
---
name: guilherme
description: Anderson's developer and auxiliary
sources: [backfill]
aliases: []
---
- [stated] Anderson's developer and auxiliary; executes technical builds via Claude Code in VS Code
- [stated] When "Guilherme" appears in a chat, it means Guilherme is interacting, not Anderson

<!-- FILE: /people/katia.md -->
---
name: katia
description: Kátia, auxiliar do Anderson responsável por publicar os conteúdos da QMIX nos portais parceiros
sources: [chat]
aliases: [Kátia, auxiliar]
---
- [stated] Auxiliar do Anderson; é quem publica os conteúdos da QMIX nos sites WordPress parceiros
- [stated] Deve poder publicar direto pelo claude.ai, sem instalar nada no computador (ver [[wp-mcp-publicacao]])

<!-- FILE: /topics/apis-fornecedores.md -->
---
name: apis-fornecedores
description: Plataformas e fornecedores de API que o Anderson quer ter à mão na hora de criar ferramentas (APIBrasil, apis.io, RapidAPI)
sources: [chat]
aliases: [APIBrasil, apis.io, RapidAPI, fornecedores de API, catálogo de APIs]
---

- [stated] Anderson pediu para manter essas plataformas memorizadas e indicá-las sempre que for criar ferramenta, projeto ou integração nova
- [stated] Instalou o MCP do apis.io no VS Code

## APIBrasil (a mais relevante para os projetos brasileiros)
- [stated] Gateway único: https://gateway.apibrasil.io/api/v2 ; documentação aberta em https://doc.apibrasil.io (toda página tem versão .md, cada API tem OpenAPI 3.1 em /openapi.json, tem llms-full.txt e busca em /busca.md?q=termo)
- [stated] 175 APIs no mesmo token. Chamadas são POST com JSON
- [stated] Autenticação: `Authorization: Bearer` em tudo. Header `DeviceToken` só nas APIs cobradas por plano, que hoje são só as de WhatsApp
- [stated] `"homolog": true` no corpo roda em sandbox com a forma real da resposta e sem cobrança. CPF de teste: 00000000000
- [stated] Armadilha: erro pode voltar com HTTP 200. Checar `error === false` antes de ler `data`. A resposta traz balance, tax e valor_consulta
- [stated] Tem SDK oficial em Node/TS, Python, PHP, Go, Rust, Ruby, Java, C#, Elixir, Flutter e outras, e servidor MCP próprio com guia para VS Code, Cursor, Zed e Claude Desktop
- [stated] Categorias: Análise de Crédito (33), Segurança Veicular (29), Antifraude (20), CRLV (15), Consulta CNPJ (13), Comunicação (11), Precificação Veicular (10), Busca e Cobrança (9), Certidões (8), Consultas Assíncronas (6), Relatórios Whitelabel (5), Serviços Digitais (4), Conselhos Profissionais (3), entre outras
- [stated] Preços de referência por consulta (podem mudar, conferir no catálogo): API CNPJ R$ 0,04 ; CEP com IBGE R$ 0,04 ; CPF Lite R$ 0,12 ; CPF Receita Federal e Dados Cadastrais R$ 0,34 ; CPF Search R$ 0,45 ; CRM, CRO e CRBM R$ 0,40 ; CPF Óbito R$ 0,58 ; Antecedentes Criminais R$ 0,79 ; Protesto Nacional R$ 1,72 ; Quod Score R$ 7,50 ; SCR Bacen R$ 7,80
- [stated] Relatórios Whitelabel prontos em PDF: CPF Relatório R$ 0,45 ; Veicular Relatório R$ 0,14
- [stated] WhatsApp: oficial Meta Cloud API R$ 399,90/mês, modo Coexistence R$ 129,90/mês. Motores não oficiais (Baileys R$ 12,90, WhatsMeow R$ 19,90, WPP R$ 21,90) são WhatsApp Web automatizado e arriscam banimento de número, não usar em nome de cliente. SMS avulso R$ 0,10
- [stated] Alternativa direta à Procob no projeto da [[plataforma-consultas]]. Recomendação em aberto: usar APIBrasil como fornecedor inicial com camada de adaptador para poder trocar de fornecedor depois
- [stated] Cuidados: várias APIs estão só em homologação e não funcionam em produção ; APIs parecidas têm preços muito diferentes porque vêm de fornecedores diferentes, comparar em homologação antes de escolher ; é intermediário de bureaus (Quod, SPC, Boa Vista, SCPC, Serasa), não bureau direto ; consulta de dado pessoal exige base legal, finalidade registrada, termo do consultante e log de consultas por causa da LGPD e da fiscalização da ANPD

## apis.io
- [stated] Catálogo de descoberta, não marketplace. Não vende acesso nem gera chave, indexa mais de 27 mil provedores, 133 mil APIs e 2.600 servidores MCP
- [stated] REST aberto e somente leitura em https://apis.io/api/v1 ; MCP em https://apis.io/mcp ; skills em https://apis.io/skills/<nome>/SKILL.md
- [stated] Skills que valem: find-api, fetch-api-spec, integrate-provider. Serve para achar a API certa e puxar o OpenAPI real em vez do modelo chutar endpoint
- [stated] Catálogo é enviesado para fornecedores americanos. Para dado brasileiro não serve, usar APIBrasil ou BrasilAPI
- [stated] A página Model Visibility deles mede o que Claude, ChatGPT e Gemini dizem sobre cada provedor, com pergunta fechada, duas rodadas (com busca e de memória), três modelos nunca agregados e "não sei" contado à parte. Metodologia a copiar no serviço de [[monitor-ia]] da QMIX

## RapidAPI (Rapid)
- [stated] Marketplace com gateway, chave única e billing próprio. Comprado pela Nokia em novembro de 2024, marketplace público segue ativo
- [stated] Boa parte do catálogo são scrapers não oficiais mantidos por indivíduos, que quebram e somem. Usar só para prototipagem, migrar para o fornecedor direto quando virar produto de cliente pago

## Regra geral
- [stated] Para CNPJ e CEP existem alternativas gratuitas e estáveis (BrasilAPI, ReceitaWS) que valem mais que wrapper pago quando o volume é pequeno
- [stated] Para SERP e SEO, preferir DataForSEO ou Serper direto em vez dos wrappers do RapidAPI

<!-- FILE: /topics/business-portfolio.md -->
---
name: business-portfolio
description: Web platforms, SaaS products, and sites Anderson has launched or operates
sources: [backfill]
aliases: []
---
- [stated] Began managing a sports betting affiliate vertical via Palpite Mestre (palpitemestre.com.br) and PTDF (ptdf.com.br)
- [stated] Launched bitcao.com.br (pet services, expired domain rebuild with spam disavow and 301 redirect map)
- [stated] Launched facoqr.com.br / fcqr.com.br (QR code generator with PIX BR Code EMV implementation)
- [stated] Built recibosonline.ia.br (receipts/documents platform, PRO plan R$9.90 via Asaas)
- [stated] Built calistenia.ia.br (calisthenics platform with Claude-powered workout plans from validated Exercise database)
- [stated] Launched comparativos.ia.br (AI product comparisons); BYTX DIGITAL (bytx.com.br) is technical responsible, must display CNPJ and full Sobre page with all company data
- [stated] Deployed the link rotator panel and distributed cloud-based architecture for backlink and SEO tooling research
- [stated] Launched a family shopping list PWA on Cloudflare Workers/D1/Hono
- [stated] Explored self-hosted storage (Nextcloud on Proxmox + ZFS + Cloudflare R2 backup)
- [stated] Built SMSPIX (smspix.com.br) virtual SMS number resale platform (5SIM + OnlineSim, prepaid wallet, PIX via OpenPix)
- [stated] Operates QMIX Digital since 2020, publishing editorial backlinks on news portals and blogs across Brazil
- [stated] QMIX Digital uses a 23-voice content system called Sistema Antônio and the Portal Engine for static HTML portal management
- [stated] Manages 100+ news portals with anti-fingerprint measures (separate Cloudflare accounts, theme variation)
- [stated] Long-standing client roster includes orthopedic and medical practices in Goiânia (COE, drbrunoair.com.br)
- [stated] Não quer trabalhar com WordPress em novos produtos (avalia que o mercado está saindo da plataforma)

<!-- FILE: /topics/communication.md -->
---
name: communication
description: How Anderson prefers to send messages, receive alerts, and be worked with
sources: [backfill]
aliases: []
---
- [stated] Uses a custom Windows voice transcription app to send messages, which can introduce small transcription errors
- [stated] Transcription errors should be interpreted by context without requesting confirmation unless ambiguity would materially change the outcome
- [stated] Telegram for all alerts
- [stated] Prefers single consolidated prompts over multiple exchanges
- [stated] Wants cost visibility with automatic cutoffs

<!-- FILE: /topics/content-rules.md -->
---
name: content-rules
description: QMIX Digital brand, video, anchor text, and backlink content rules
sources: [backfill]
aliases: []
---
- [stated] Brand always written as "QMIX Digital" in content (never "QMIX" alone); URLs like qmix.com.br remain as-is
- [stated] QMIX Digital website is qmix.com.br (not qmixdigital.com.br)
- [stated] No em dashes anywhere in any content
- [stated] Anchor texts: always exactly 31 variations per domain, no repetition, no Portuguese errors, capital letters only for proper nouns
- [stated] Anchor text batches and deliverables always in tab-separated format for Google Sheets
- [stated] Proper Portuguese accentuation; only proper nouns capitalized in anchor texts
- [stated] QMIX Digital payment methods on site: PIX (5% discount), credit card (up to 4x interest-free), boleto, PayPal
- [stated] Video metadata hashtags always start with #qmix #qmixdigital #backlinksqmix (first three appear above YouTube title), plus up to 2 topic hashtags; abbreviated spellings permitted in hashtags
- [stated] Thumbnail text must come from the video title or keyword (never disconnected text), max 4 words per line
- [stated] Video briefings: always instruct Claude Code to list the project image library folder and fit real images into compatible scenes without forcing; TSX graphics default where images don't fit
- [stated] Video briefings: always request rich animations in explanatory segments, with constant motion and no static frames exceeding 3 seconds, using library background images when compatible
- [stated] QMIX Digital video brand contract: dark navy, electric blue, Inter typeface
- [stated] Produced 22+ QMIX Digital YouTube video briefings using Remotion TSX and ElevenLabs PT-BR voice
- [stated] Backlink content: prefer news portals but blogs work with lower efficiency; never state that QMIX Digital does not work with blogs, as it also sells blog publications
- [stated] Backlink site verification technique: site:domain in Google with Tools > date filter; indexed in last 24h is excellent; nothing indexed in the last week means avoid that site
- [stated] For comparativos.ia.br: BYTX DIGITAL (bytx.com.br) is technical responsible; site must display CNPJ and a full Sobre page with all company data
- [stated] Produced QMIX Digital blog topical cluster on entity SEO, brand mentions, co-occurrence, and digital PR as downloadable articles
- [stated] QMIX Digital está deixando de trabalhar com sites de nicho para backlinks (geralmente sem autoridade, caros, ou baratos e sem autoridade alguma); em exemplos e conteúdo, usar portais de notícias, que publicam de tudo
- [stated] Nunca citar marcas concorrentes em conteúdo publicado no blog de clientes sem autorização do concorrente; em listas "melhores X", organizar por perfil de uso ou critério, não por marca
- [stated] Imagens de guest post: os portais parceiros não aceitam imagens enviadas diretamente; a imagem precisa estar hospedada em algum banco/portal de imagens gratuito

<!-- FILE: /topics/interests.md -->
---
name: interests
description: Anderson's personal interests and investments
sources: [backfill]
aliases: []
---
- [stated] Investing in Brazilian equities and FIIs; runs a scheduled monitoring report for PETR4 (Petrobras) tracking price/indicators/dividends vs a baseline
- [stated] Sim racing
- [stated] Electric vehicles; owns a Leapmotor C10 REEV
- [stated] Vacation property project in Itacaiú, Goiás
- [stated] Has explored real estate investment, relocation research across South America, and cryptocurrency operations

<!-- FILE: /topics/recent-work.md -->
---
name: recent-work
description: Recent work items and one-off tasks not tied to an active project
sources: [backfill]
aliases: []
---
- [stated] Resolved an Asaas billing crisis for BYTX DIGITAL
- [stated] Handled an LGPD/trademark extrajudicial notification for casasderecuperacao.com.br

<!-- FILE: /topics/technical-conventions.md -->
---
name: technical-conventions
description: Standing technical and content conventions applied across Anderson's projects
sources: [backfill]
aliases: []
---
- [stated] Stack: Next.js App Router, Prisma, PostgreSQL, Bun (never npm), TypeScript strict mode, PM2/Nginx on VPS, Cloudflare
- [stated] Payments via Asaas (not Mercado Pago)
- [stated] CNPJ and full company data in all footers
- [stated] Acceptance criteria: Lighthouse mobile Performance >= 95 and SEO = 100
- [stated] AdSense slots via empty env variables for Anderson to insert post-handoff
- [stated] No em dashes (travessoes) anywhere in any generated content/text
- [stated] Prohibited AI-marker vocabulary list enforced on all content
- [stated] Deliverable packages include briefing, page map XLSX, keywords XLSX, AdSense checklist, SKILL-SEO
- [stated] Built a GSC analysis SKILL.md (analise-gsc.skill) for automated client diagnostics; applied it to coegoiania.com.br
- [stated] Developed a launch checklist SKILL.md and the wp-news-frontpage skill for fingerprint-varied WordPress portal homepages

<!-- FILE: /projects/materias-jornalisticas/index.md -->
---
name: "Matérias jornalísticas"
description: Matérias jornalísticas, producing Portuguese-language editorial backlink articles for Brazilian news portals (QMIX Digital).
---

<!-- FILE: /projects/materias-jornalisticas/overview.md -->
---
name: overview
description: QMIX Digital editorial backlink production, purpose, clients, portals, current state, and working preferences
sources: [backfill]
aliases: [QMIX, QMIX Digital, qmix.com.br]
---

- [stated] Anderson Alves is CEO of QMIX Digital, an SEO and link-building agency based in Goiânia
- [stated] Core operation: producing journalistic-style editorial articles in Brazilian Portuguese (occasionally European Portuguese) for publication on Brazilian and sometimes Portuguese news portals, with embedded contextual backlinks to client websites
- [stated] Each article is a standalone deliverable: a validated DOCX file tailored to a specific portal's editorial profile, geographic audience, and content standards

## Recurring clients

- [stated] Casa da Toalha (textiles, Brusque/SC)
- [stated] Travelux and Portal das Malas (luggage)
- [stated] COE and individual orthopedic specialists in Goiânia
- [stated] Dra. Mariana Cabral (dermatology, Goiânia)
- [stated] meuprofeparticular.com.br (private tutoring)
- [stated] SouzaTech Geladeiras (refrigeration repair, Rio de Janeiro)
- [stated] Recibo Fácil (legal document templates)
- [stated] Airport Park (GRU parking)
- [stated] desentupidora.pro (drain services)
- [stated] Ver Placa (vehicle history)
- [stated] topodebolo.net (party decoration digital files)
- [stated] distribuidorasdealimentos.com.br (food distributor directory)
- [stated] QMIX's own properties: qmix.com.br, comprarbacklinks.store

## Portals regularly worked with

- [stated] band.com.br, em.com.br, jornaldebrasilia.com.br, uai.com.br
- [stated] dm.com.br (Diário da Manhã, Goiânia)
- [stated] d24am.com and acritica.com (Manaus)
- [stated] portoenoticias.com.br, abadianoticia.com.br
- [stated] marcasemercados.com.br and sopacultural.com (European Portuguese guest posts)
- [stated] Many regional portals across Brazilian states

## Current state

- [stated] Production is ongoing across multiple client campaigns simultaneously
- [stated] Recent completed batches: Casa da Toalha (toalhas de banho, toalhas de rosto, panos de prato, personalized textiles across ~8 portals); Travelux/Portal das Malas (luggage content for band.com.br and dm.com.br); orthopedic specialists in Goiânia (multi-portal medical tourism and specialist guide series); desentupidora.pro (16-article batch, completed)
- [stated] Anderson provides incremental briefs (portal + anchor + URL), approves or revises, then moves to the next assignment
- [stated] Articles go to clients for approval before publication, so deliverables are drafts at that stage

## On the horizon

- [stated] Continued multi-portal rollout for Casa da Toalha and orthopedic clients
- [stated] European Portuguese guest posts (marcasemercados.com.br, sopacultural.com) remain an active channel
- [stated] Anderson indicated interest in Band Vale and other regional portals not yet in the mapped portal file

## Anderson's working preferences

- [stated] Communicates in short, direct messages; does not read long explanatory responses
- [stated] Lead with the deliverable; keep post-delivery notes to a brief summary of where the link was placed
- [stated] Iterative correction style: targeted revisions rather than full rewrites unless explicitly requested
- [stated] When he says something like "o sistema de lista entra dentro desse conteúdo," confirm the interpretation before acting
- [stated] José Mário de Jesus Cunha (@josemario.treinador), personal trainer online de Goiânia, atleta IFBB Pro; esposa Juliana Borges, nutricionista em Goiânia (nutricionista.digital/goiania/), também cliente

<!-- FILE: /projects/materias-jornalisticas/editorial-rules.md -->
---
name: editorial-rules
description: Standing editorial rules, compliance boundaries, link placement, voice and AI-detection avoidance, variation, and client-specific requirements
sources: [backfill]
aliases: []
---

## Editorial integrity and compliance boundaries

- [stated] Declined: content framing unlicensed IPTV directories, high-risk financial automation products engineered to look like independent journalism, and content produced to manufacture Wikipedia notability
- [stated] Betsson (.bet.br) was accepted after confirming SPA licensing
- [stated] Articles must never read as publieditorial/paid content; when they do, diagnose the specific signals and propose fixes before rewriting
- [stated] Content should cover only what is explicitly requested, no unrequested cautionary material, competitor mentions, or negative angles unless briefed

## Link placement rules

- [stated] Prefer contextual inline anchor in the article body over "Leia também" blocks; inline passes more authority and is editorially cleaner; applies to internal portal links as well
- [stated] Links placed in the middle of the article, never in the opening or closing sections
- [stated] Anchor phrasing: use natural journalistic constructions like "quem procura procedimentos de [âncora]" rather than "quem pesquisa [âncora]" or directive phrases like "clique aqui"
- [stated] No directive anchor phrasing ("clique aqui," "acesse aqui," etc.)
- [stated] Only the anchor word(s) should be hyperlinked, not the surrounding sentence
- [stated] Each article should contain exactly the number of links briefed (typically one, sometimes two or three)
- [stated] When multiple links are present, maintain good spacing between them (minimum ~4 to 6 sections apart)
- [stated] Competitor media outlets should not be cited by name; replace with generic references (e.g., "levantamentos da imprensa regional")

## Client-specific rules, Casa da Toalha

- [stated] Casa da Toalha always appears first in any ranked list
- [stated] Approved quality framing: "a meta declarada da empresa é produzir as melhores toalhas de banho do Brasil", stated in the brand's voice, not the author's
- [stated] Cite only 500 g/m2 (never a 400 to 500 range)
- [stated] Competitor order must be varied across articles so no two pieces share the same sequence

## Client-specific rules, orthopedic clients

- [stated] Competitor doctors placed last in lists
- [stated] When COE appears as entry 2, describe "diversos cirurgiões" without naming the doctor in position 1
- [stated] National list fillers (positions 3 to 10) use real, verifiable doctors with public CRM/RQE but of regional rather than national prominence
- [stated] Each article on a non-Goiânia portal requires a genuine local hook, not generic framing

## Voice and AI-detection avoidance

- [stated] Zero em dashes or en dashes anywhere; restructure sentences rather than replace with another punctuation mark
- [stated] Zero exclamation marks in titles
- [stated] Title character limit: maximum 70 characters, always count before finalizing
- [stated] Forbidden terms list (checked programmatically): "abordagem," "alavanc," "ecossistema," "soluç," "robusto," "proporcion," "potencializ," "de forma," "Cada vez mais," "Vale ressaltar," "É fundamental," "Nesse contexto," "No cenário atual," "transformação digital," "insights," "stakeholders," "Descubra," "Saiba mais," "Clique aqui," and others defined in project files
- [stated] "resolução" can trigger the "soluç" check, substitute with "qualidade de imagem" or equivalent
- [stated] Articles for Portugal require European Portuguese constructions: impersonal/passive voice, no "você"
- [stated] Internal links to the same portal use first-person editorial voice ("Já publicamos aqui um guia..."), not third-party citation framing
- [stated] When embedding an anchor attributed as a specialist citation, use constructions like "De acordo com especialista em [âncora]..." or "afirmou um especialista de uma [âncora]...", not descriptive third-person references

## Variation to avoid Google pattern detection

- [stated] Mandatory variation across articles in the same campaign: alternate narrative angles (local problem, opportunity, success case, sectoral analogy, certification/seals, supply chain, economic reconversion), distinct H2 structures, varied openings (data, scene, contradiction, real case, question)
- [stated] Never replicate the structure of the previous article
- [stated] Avoid repeating the word "Google" in titles
- [stated] Each article needs a unique angle

## Client-specific rules, José Mário (personal trainer online)

- [stated] Em listas de personal trainers, José Mário sempre em primeiro; demais nomes devem ser pessoas reais, não aplicativos
- [stated] Âncoras já usadas: "personal trainer online" para instagram.com/josemario.treinador e "nutricionista em Goiânia" para nutricionista.digital/goiania/ (dm.com.br, lista dos 10 melhores personal trainers online)
- [stated] Pode citar a esposa (Juliana Borges) ou apenas "acompanhamento de uma nutricionista em Goiânia" como gancho da segunda âncora
- [stated] Títulos declarados no currículo dele (campeão brasileiro 2018, overall Muscle Contest Goiânia, overall Arnold South America 2026, All Star) não têm fonte pública; citar sempre como declaração do próprio treinador
- [stated] Textos dos concorrentes em listas devem ter tamanho próximo ao do cliente para não parecer conteúdo pago
- [stated] O perfil do Instagram (@josemario.treinador) é sempre o mesmo link até ele avisar; a âncora do José Mário deve ficar dentro do trecho dele na lista, para quem clicar conhecê-lo
- [stated] Âncoras também usadas: "consultoria de personal trainer online" e "nutricionista de Goiânia" (acritica.com, duas matérias); "consultoria de personal trainer online" e "consultoria de nutricionista de Goiânia" (portaldenoticias.com.br, São Jerônimo/RS, Região Carbonífera); "personal trainer online no Instagram" e "nutricionista esportivo em Goiânia" para nutricionista.digital/goiania/nutricionista-esportivo-goiania (jornaldebeltrao.com.br, Francisco Beltrão/PR, lista com 8); "melhores personal trainers online" e "melhores nutricionistas de Goiânia" (ocorreio.com.br, Cachoeira do Sul/RS)
- [stated] Âncoras sempre em minúsculas, mesmo quando o briefing vier com maiúsculas; erros de digitação na âncora (ex.: "personaais") devem ser corrigidos após confirmação
- [stated] A segunda âncora (nutricionista) também fica dentro do trecho do José Mário na lista, a 3 parágrafos da primeira
- [stated] Alternar a ordem e os nomes dos concorrentes a cada matéria; nomes já usados: Carol Vaz, Leandro Twin, Gustavo Mattos, Chico Salgado, Carol Borba, Paulinha Sabino, Mayara Benicá, Wladimir Junior, Fred Trainer (Goiânia), Victor Moura (Recife)

<!-- FILE: /projects/materias-jornalisticas/workflow-and-tooling.md -->
---
name: workflow-and-tooling
description: Per-article production workflow, DOCX generation and validation setup, MCP publishing connector, and project file locations
sources: [backfill]
aliases: []
---

## Standard production workflow (per article)

- [stated] 1. Read project files from `/mnt/project/` for standing rules, portal profiles, and client records
- [stated] 2. Fetch the destination portal and client URL to map editorial profile and confirm topical relevance
- [stated] 3. Run targeted web searches for verifiable data (named sources: IBGE, Abrasel, Anatel, EPE, Embratur, Fórum Brasileiro de Segurança Pública, sector associations, academic studies, etc.)
- [stated] 4. Select a distinct editorial angle suited to the portal's geography and audience, never reuse the angle from a prior article in the same campaign
- [stated] 5. Draft in Brazilian Portuguese (or European Portuguese for PT portals), ~1,200 to 1,800 words, journalistic tone, H1/H2 structure, Arial font, justified alignment
- [stated] 6. Generate DOCX via Node.js (`docx` library) at `/home/claude/`, run `validate.py` at `/mnt/skills/public/docx/scripts/office/validate.py`, then run inline Python validation: extract URLs from `word/_rels/document.xml.rels` via regex, count words with `re.findall(r'\b[\wÀ-ÿ%]+\b', txt)`, scan for forbidden terms and em/en dashes
- [stated] 7. Copy validated file to `/mnt/user-data/outputs/`
- [stated] 8. Deliver via `present_files` with a brief note on link placement only
- [stated] 9. Flag new portals and clients for manual registration in `portais-mapeados.md` and `clientes-recorrentes.md`

## Working practices

- [stated] Incremental edits are made via Python string replacements in the existing `gen.js` script rather than full rewrites, efficient for targeted changes like title swaps, section insertions, or anchor adjustments
- [stated] DOCX preview errors ("Failed to Load Document / ECONNRESET") are server-side preview failures, not file corruption, redeliver with `present_files` without regenerating

## Tools and resources

- [stated] DOCX generation: Node.js + `docx` npm library; `ExternalHyperlink` wrapping `TextRun` with `style: "Hyperlink"` on the TextRun (not the hyperlink wrapper); font/size set explicitly on each TextRun (Arial, size 24 for 12pt body)
- [stated] Validation: `/mnt/skills/public/docx/scripts/office/validate.py` plus inline Python (`zipfile`, `re`) for word count, hyperlink URL verification, forbidden terms, em/en dash check
- [stated] MCP connector "Publicar em sites de parceiros", tools: `listar_sites`, `listar_categorias`, `subir_imagem`, `criar_post`
- [stated] `url_imagem` accepts direct image URLs; Unsplash CDN with `?fm=webp&q=80&w=1200` parameters works reliably for WebP conversion
- [stated] `criar_post` accepts `imagem_destaque_id` and `categorias` as a numeric array; does not expose custom fields (subtitles, deck lines), those require manual WordPress admin edit
- [stated] Image sourcing: Pexels (direct `images.pexels.com` URL with compression parameters, not gallery page URL) and Unsplash CDN both work for `subir_imagem`
- [stated] Project files at `/mnt/project/` (read-only): `SKILL.md`, `angulos-por-segmento.md`, `portais-mapeados.md`, `clientes-recorrentes.md`, `validacao-e-factual.md`, `validador_materia.py` (humanization score 0 to 100, minimum passing threshold 70)
- [stated] Output directory: `/mnt/user-data/outputs/`

<!-- FILE: /projects/criador-de-titulos-seo/index.md -->
---
name: "Criador de títulos SEO"
description: Criador de títulos SEO, Portuguese SEO blog titles built to a strict 60 to 65 character standard via tiered complements.
---

<!-- FILE: /projects/criador-de-titulos-seo/overview.md -->
---
name: overview
description: Portuguese SEO title generation, purpose, the 60 to 65 character standard, workflow, and current state
sources: [backfill]
aliases: ["qual é o melhor", "SEO titles", "Portuguese blog titles"]
---

## Purpose & context

- [stated] Anderson runs an SEO content operation focused on Portuguese-language blog posts.
- [stated] Two main content verticals: the "qual é o melhor" (which is the best) product/comparison niche, and dream interpretation content with spiritual dimensions.
- [stated] The core objective is producing optimized blog post titles that meet strict SEO character count standards.
- [stated] Success means every title falls within the 60 to 65 character range, no exceptions.

## The character standard

- [stated] The 60 to 65 character range is non-negotiable. Titles outside this range are not acceptable.
- [stated] If no complement from the current table fits, the complement table must be expanded to cover all keyword lengths, the title is never left incomplete or out of range.
- [stated] Complement selection follows a longest-to-shortest algorithm: pick the longest complement that brings the total into the 60 to 65 range, maximizing descriptive value while staying within limits.
- [stated] Short keywords require long complements. When base keywords are under ~25 characters, the complement table must include options long enough (up to ~47 characters) to bridge the gap into the target range.

## Formatting standards

- [stated] Correct capitalization of proper nouns and brands is part of the standard (e.g., Brasil, iPhone, WinRAR, Jesus).
- [stated] Accent corrections are applied (e.g., álcool, ômega, câncer).
- [stated] Punctuation is kept consistent across titles.

## Approach & workflow

- [stated] Anderson submits raw keyword lists in Portuguese; Claude processes them in bulk.
- [stated] A Python-based character-counting methodology is used to pair each keyword with the appropriate complement tier.
- [stated] Complement tables are tiered by character length and selected in descending order to maximize title richness within the character constraint.
- [stated] Anderson reviews output and flags issues directly (e.g., titles not meeting size standards), prompting iterative refinement of the complement table or logic.

## Tools & resources

- [stated] Python-based character counting and complement-matching logic.
- [stated] Tiered Portuguese complement libraries tailored per content vertical, dream interpretation complements differ from product comparison complements.

## Current state

- [stated] Actively processing batches of raw Portuguese keywords and converting them into SEO-optimized titles.
- [stated] Recent work has covered both verticals: product/comparison content and dream interpretation content.
- [stated] Batches have ranged from 27 to 62 keywords per session.

<!-- FILE: /projects/resumos-youtube/index.md -->
---
name: "Resumos de vídeo do YouTube"
description: "Resumos de vídeo do YouTube, web dev setup: Claude Code Superpowers plugin install, VS Code/Next.js stack, watching Cloudflare VNext."
---

<!-- FILE: /projects/resumos-youtube/overview.md -->
---
name: overview
description: Anderson's web development setup, Claude Code Superpowers plugin installation, tooling, and frameworks being tracked
sources: [backfill]
aliases: [superpowers, claude-code-setup]
---

## Purpose & context

- [stated] Anderson is a web developer who builds websites professionally or as a core activity
- [stated] Uses VS Code as the primary development environment
- [stated] Interested in AI-assisted development workflows and modern frontend frameworks, particularly Next.js-adjacent tooling

## Tools & stack

- [stated] Editor: VS Code
- [stated] Framework: Next.js (current)
- [stated] AI tooling: Claude Code with the Superpowers plugin
- [stated] Tracking Cloudflare VNext as a future-facing reference

## Current state

- [stated] Was in the process of installing the Superpowers plugin for Claude Code, opting for global installation (available across all projects)
- [stated] The installation was done through a visual plugin management UI rather than terminal commands

## Key learnings

- [stated] The Superpowers plugin structures AI-assisted development through a defined workflow: brainstorming, implementation planning, execution with subagents, TDD, code review, Git integration
- [stated] The plugin offers three installation scopes: global (user-wide), per-project shared, and per-project local, Anderson prefers global
- [stated] Cloudflare VNext is a Next.js alternative built with AI assistance; it reached roughly 94% Next.js compatibility at reduced code size and faster build times, but has drawn security criticism
- [stated] Advised to monitor VNext's progress without rushing to migrate from current Next.js tooling, worth watching, not yet production-ready for migration

<!-- FILE: /projects/bolsa-investqmix/index.md -->
---
name: "Bolsa"
description: Bolsa, building InvestQMIX, a Brazilian B3 platform for tax optimization, portfolio tracking, and trade simulation.
---

<!-- FILE: /projects/bolsa-investqmix/overview.md -->
---
name: overview
description: InvestQMIX Brazilian stock market platform, purpose, stack, implemented modules, current state, and next steps
sources: [backfill]
aliases: [InvestQMIX, QMIX Digital]
---

## Purpose and context

- [stated] Anderson works in marketing and is building InvestQMIX, a Brazilian stock market platform co-developed with Claude Code (VS Code)
- [stated] The platform focuses on tax optimization, portfolio tracking, and trading simulation for the Brazilian market (B3)
- [stated] Anderson is a self-described layman in finance
- [stated] Standing memory instruction: do not retain stock market holdings, positions, or investment analysis in memory, only QMIX Digital / InvestQMIX platform content should be memorized

## Stack and infrastructure

- [stated] TypeScript, decimal.js, pg-boss (job scheduler), grammY (Telegram bot), PostgreSQL, Docker on a Hostinger VPS
- [stated] Dev environment: Claude Code (VS Code), Docker, Hostinger VPS
- [stated] Data sources: brapi.dev, Yahoo Finance (`.SA` suffix), B3 Cotahist historical files
- [stated] Tax filing: SicalcWeb (sicalc.receita.economia.gov.br) for DARF generation
- [stated] Brokerage / portfolio tracking: C6 Bank (brokerage), Investidor10 (portfolio platform)

## Current state, active and deployed

- [stated] InvestQMIX is an active, deployed system
- [stated] Fiscal/IR module fully implemented and tested (47 tests passing at last check)
- [stated] Fiscal module covers: R$20k monthly gross-sale exemption threshold for swing trades; day trade vs. swing trade segregation (20% vs. 15% IR); loss carryforward rules; withholding tax as abatable credit; DARF due-date calculation using the B3 business-day calendar; fee treatment in cost basis (purchase fees enter average price, sale fees reduce proceeds); asset-class separation (FIIs taxed at 20% with no exemption, ETFs/BDRs excluded from the R$20k threshold); corporate events table (split/grupamento/ajuste) to preserve cost basis integrity
- [stated] Telegram alerts live: daily opportunity alerts (3 conditions, position in profit, margin available, cost viability), month-end summaries (vale a pena / adiar / não compensa), DARF reminders, ex-dividend date conflict detection, `/ajuda` glossary command
- [stated] Telegram outputs use plain language with parenthetical glossary terms for non-specialist readability
- [stated] Paper trading / simulation module is in design/early development phase, intended to enable investment simulation and market study without real money, within InvestQMIX

## Current state, on the horizon

- [stated] Next planned step: paper trading schema design, `paper_orders` / `paper_positions` tables and a Cotahist backtest loop
- [stated] Recommended simulation roadmap sequence: Cotahist historical backtest, live paper trading with brapi.dev, AI agent layer via Anthropic API with pg-boss jobs at key market hours
- [stated] InvestQMIX does not currently handle options (covered calls / venda coberta); flagged as a future gap if Anderson pursues that strategy
- [stated] A tracking spreadsheet for covered call paper trading (openpyxl-based with IR calculations) was offered but not yet confirmed as built

<!-- FILE: /projects/bolsa-investqmix/domain-learnings.md -->
---
name: domain-learnings
description: B3 tax rules, simulation realism constraints, and data-source knowledge underpinning InvestQMIX, read before touching fiscal or simulation logic
sources: [backfill]
aliases: []
---

## Brazilian tax rules (B3)

- [stated] The R$20k monthly exemption applies to gross sales, not profit; it survives MP 1303/2025 (which lapsed October 2025)
- [stated] Loss carryforward only works between taxable operations of the same asset class, ações and FIIs are separate buckets
- [stated] Losses in exempt months cannot be used to offset taxable gains
- [stated] Option premiums (covered calls) are not exempt under the R$20k monthly rule, taxed differently from stock sales

## Data integrity

- [stated] Corporate events (splits, grupamentos) break manual buy/sell cost basis ledgers, requires a dedicated events table

## Simulation realism

- [stated] Realistic B3 simulation must account for B3 fees, slippage, pregão hours, and IR rules
- [stated] Reference videos on trading strategies often contain commercial distortions or omit structural risks
- [stated] Free data sources for simulation: brapi.dev, Yahoo Finance (`.SA` suffix), B3 Cotahist historical files

<!-- FILE: /projects/bolsa-investqmix/ways-of-working.md -->
---
name: ways-of-working
description: How Anderson wants InvestQMIX work approached, communication standard, build sequencing, and source cross-referencing
sources: [backfill]
aliases: []
---

- [stated] Communication preference: direct, data-focused answers, no lengthy explanations, economics lessons, or repeated disclaimers
- [stated] Data first, then parenthetical glossary terms for financial jargon in Telegram-facing outputs
- [stated] Prefers sequenced, incremental builds: validate the concept simply before adding complexity
- [stated] Cross-references external sources (YouTube videos, friend recommendations) against data and asks Claude to identify flaws or omissions in those sources

<!-- FILE: /projects/radar-volt/index.md -->
---
name: "RADAR VOLT"
description: "RADAR VOLT, Radar Volt: Brazilian YouTube channel scripting long-form electric and electrified vehicle coverage."
---

<!-- FILE: /projects/radar-volt/overview.md -->
---
name: overview
description: Radar Volt YouTube channel, purpose, editorial standards, and current coverage areas
sources: [backfill]
aliases: [Radar Volt]
---

## Purpose & context

- [stated] Anderson runs Radar Volt, a Brazilian YouTube channel covering electric and electrified vehicle launches across automotive, agricultural, nautical, and motorsport segments
- [stated] The channel targets a Brazilian audience with long-form, research-backed video scripts
- [stated] Anderson personally owns a Leapmotor C10 REEV and draws on first-hand ownership knowledge where relevant, though this personal detail is kept out of published content

## Editorial standards

- [stated] Every cited figure must include its source and testing cycle (CLTC, WLTP, EPA)
- [stated] Prices from foreign markets are never converted to reais for publication, import duties and freight make raw conversions misleading; exceptions require explicit request, clear labeling, and a standard disclaimer
- [stated] The distinction between "indício" (indirect evidence) and official announcement must always be made explicit on air
- [stated] Scripts are written for reading aloud, not as briefings

## Current state, topics covered in dossiês and roteiros

- [stated] BYD Seal 6 DM-i Touring wagon and the history of station wagons in Brazil
- [stated] Electrified pickup trucks globally (BEVs, PHEVs/EREVs, 48V mild-hybrid diesels), with Chinese brands covered in depth: Changan Hunter EREV, JAC T9, Foton Tunland Yutu, Riddara RD6, GWM Cannon Alpha, BYD Shark
- [stated] Leapmotor C10 REEV architecture, sealed pressurized fuel tank, and updated service intervals
- [stated] Marcopolo Volare Attack 10 hybrid range-extender bus (ethanol, series hybrid, no plug)
- [stated] Ethanol vs. diesel cost-per-kilometer for municipal school bus fleets
- [stated] History of the Proálcool program and parallels with current EV skepticism
- [stated] BYD Flash ultrafast charger arriving in Brazil
- [stated] Geely Galaxy TT efficiency record sedan
- [stated] GAC Aion UT 530 Ningde Edition
- [stated] Chinese electric outboard motors (ePropulsion lead; Livoltek factory in Manaus)
- [stated] Chinese electric tractors (Honghu T70, Zoomlion DX7004, Lovol)
- [stated] Bonnell 805 and 902 electric off-road motorcycles vs. Stark Varg
- [stated] Conceptual video on what a hybrid pickup (BYD Shark with 6 kW V2L) enables that diesel cannot, powering farm equipment, fish tank aerators, poultry ventilation, vaccine refrigerators during outages

## Approach & recurring requests

- [stated] Scripts written for reading aloud, full roteiros, not briefings or bullet-point summaries
- [stated] Wikimedia Commons image links verified by category, with file counts and resolutions noted
- [stated] Editorial sources organized within each thematic block, not only aggregated at the end
- [stated] YouTube comment copy variants for channel promotion
- [stated] SEO-optimized titles beginning with the primary keyword
- [stated] Engagement questions that avoid generic phrasing
- [stated] Explicit architectural/taxonomic labeling (REEV vs. PHEV vs. series hybrid vs. mild hybrid) with clear sourcing, no assumption of powertrain type without confirmation

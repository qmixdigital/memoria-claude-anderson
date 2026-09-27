---
name: qmix-estudo-preco-backlink
description: "Estudo de preço de backlink (447 portais, 18/09/2026) publicado no blog como ativo de citação; números-chave, onde estão as consultas SQL, tabelas no Lexical e schema Dataset"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-18T21:21:07.177Z
---

Publicado em 18/09/2026: https://qmix.com.br/blog/preco-de-backlink (artigo id 133, categoria 3
"Estudos e Dados de Mercado", Apex projeto 1194326). **URL perene, sem ano**: decisão do Anderson no mesmo dia; o slug
inicial `preco-de-backlink-brasil-2026` tem 301 no next.config. A cada atualização anual: mesma URL, ano só no título,
H1 e meta, `dateModified` novo, e refazer o corte (Dataset em datasets.ts também). Objetivo é **citação por IA e por outros blogs**, não tráfego:
no GSC de 90 dias não havia nenhuma impressão para "quanto custa backlink", "quantos backlinks" ou "remover backlinks",
mesmo com /comprar-backlinks em 3º na SERP de "quanto custa um backlink". O AlsoAsked mostra o que o Google sugere no
PAA, não o que as pessoas digitam.

**Números do corte (produtos ativos, apostas=false, preco_original>0, n=447):** mínimo R$ 80, mediana R$ 150, média
R$ 250, máximo R$ 1.800; 239 (53%) entre R$ 100 e 199; 21 acima de R$ 1.000. Por tráfego: <5k R$ 130 (307), 5-20k
R$ 300 (50), 20-100k R$ 350 (45), 100-500k R$ 400 (31), 500k+ R$ 1.200 (14). Por DA: <20 R$ 100, 20-34 R$ 150,
35-49 R$ 200, 50-64 R$ 150, 65-79 R$ 650, 80+ R$ 1.200. Correlação preço×DA 0,36; preço×tráfego 0,64. 219 portais
com promoção sem data de fim (mediana R$ 67, desconto 33%). Pedidos entregues: 72 pedidos, 119 links, preço unitário
mediano pago R$ 120 (médio R$ 225). Indicados (56): mediana R$ 300, tráfego 63k. Estados: RS R$ 800, MG R$ 480,
PR/BA/PA R$ 300, SP R$ 150, nacional R$ 130.

**Onde refazer:** SQL de agregação está nesta sessão (scripts/_x.mjs na VPS é descartável); nicho vem de
`produtos_nicho.parent_id` + `categorias_produtos.slug = value::text`. Recalcular quando o catálogo mudar
e atualizar também a tabela de preço em `/comprar-backlinks` (seção `#precos`) e a FAQ id 3 em `perguntas_respostas`
(depois `npm run freeze:marketplace` + deploy; o deploy.sh NÃO roda o freeze).

**Infra criada junto:** `LexicalRenderer` agora renderiza nó `table` (tablerow/tablecell, headerState 3 no thead,
2 na 1ª coluna) com `data-rotulo` e cards abaixo de 640px (`blog.css .tab-artigo`); conversor HTML→Lexical em
`D:/tmp/preco-de-backlink/html2lexical.py` (p, h2, h3, ul/ol, a, strong, table+caption). Schema `Dataset` por slug em
`src/app/(blog)/blog/datasets.ts` (chave = slug perene). FAQPage do blog é extraído automaticamente do H2 "Perguntas frequentes" + H3s.
Publicação: `scripts/publicar-artigo.mjs scripts/<slug>.json` com imagem em `public/blog-images/<slug>.webp` (1216x640).

**Why:** primeiro dado de mercado próprio da QMIX; a tese "DA não precifica, tráfego sim" é o que diferencia da
Upsites (estudo com 239 publicações, 2º em "preço de backlink").

**How to apply:** ao citar preço de backlink em qualquer página, usar estes números e linkar o estudo; ao criar
outro artigo com tabela, usar o conversor e registrar o Dataset em datasets.ts. Re-medir GSC e citações ~18/11/2026.

**Segundo artigo pelo mesmo pipeline (18/09/2026):** `/blog/query-fan-out` (id 134, categoria 2, Apex 1194440), keyword
"query fan-out". Regras que o Anderson fixou nesse artigo e valem para os próximos: **sem exemplos do vídeo/podcast de
origem** (a IA do Google detecta), **sem casos ou dados da QMIX** (concorrentes copiam), **sem link para o subdomínio de
ferramentas**, cidades de exemplo **São Paulo, Rio de Janeiro e Florianópolis** (nunca Goiânia). Provas viram medições
públicas de SERP (Serper, `D:/tmp/serp-qfo.mjs`). Imagens: ele autorizou Nano Banana Pro (`google:4@2`, US$ 0,138 cada)
para capa + 2 no corpo (`D:/tmp/query-fan-out/gerar.py`). Imagem nova em `public/blog-images/` só é servida **depois de
um deploy** (o `next start` lê a pasta no boot); sem deploy dá 404. O conversor `html2lexical.py` agora aceita `<img>`
→ nó `upload`. Digest seguinte: abrir com este artigo + estudo de preço.

**Terceiro artigo, leigo e de venda (19/09/2026):** `/blog/quem-o-chatgpt-indica` (id 135, categoria 4, Apex 1195525).
Gancho escolhido pelo Anderson: "Fiz uma pergunta ao ChatGPT sobre a sua área. Veja quem ele indicou". Regras dele:
público nacional e multinicho (nada de médico/Goiânia), zero termo técnico (sem GEO/AEO/SEO/entidade), mensagem
única "publicação em grandes portais, do jeito certo, com o tempo vira citação e link na IA", objetivo = pedir
orçamento. Prova = 3 prints reais do simulador (estética SP, desentupidora RJ, contabilidade Floripa) com nomes
borrados (`D:/tmp/chatgpt-indica/sim2.mjs`). Nós Lexical novos no `LexicalRenderer`: `simulador-geo` (renderiza
`<SimuladorIA compacto />`, prop nova: 2 colunas, botão largo, resultados em 1 coluna, exemplos sem Goiânia) e o
`cta` já existente (WhatsApp 551148630492 com mensagem pré-preenchida). Conversor: `<div data-simulador="geo">` e
`<div data-cta="orcamento">`. Validador não se aplica (600 palavras por desenho).

**Quarto artigo, captação de clientes locais (19/09/2026):** `/blog/perfil-da-empresa-no-google` (id 136, categoria 5,
Apex 1195789), keyword "perfil da empresa no Google". Vende o serviço integrado que o Anderson já presta (perfil +
site rápido + artigos + matérias em portais + IA) para dono de negócio local, nacional, multinicho. Origem: transcrição
do podcast com Mike Martin (GBP loop: perfil completo espelhando o site, posts, fotos, avaliações respondidas ×
constância; perfil individual por profissional; avaliação respondida entra no AI Overview em 24-48h). Dois CTAs:
WhatsApp (1º link) e `/contato` (final); o conversor aceita `data-titulo/data-texto/data-botao/data-msg` nos
`data-cta`. Ideia guardada para clientes: perfil individual por médico do COE.

**Quinto artigo (20/09/2026):** `/blog/listas-de-melhores` (id 137, categoria 2, Apex 1196763), keyword "listas de
melhores". Origem: podcast Edward Sturm com Kristiyan (Above Apex) sobre link building para SaaS; só a tese das
listas/roundups como atalho para a IA virou artigo (o resto o blog já cobria: HARO, LinkedIn, SaaS, troca). SERP da
keyword é de filmes/GPTW (sem intenção comercial): artigo serve ao cluster GEO e à citação, não a volume. Capa do
Pexels (7267573) pelo `banco_img.py` (as chaves entram pelo ambiente; funcionou sem cofre). Apex: endpoint certo é
`https://rapidurlindexer.com/wp-json/api/v1/projects` (o `/api/v1/` dá 404). Segundo artigo possível do mesmo
podcast, ainda não feito: "análise de lacuna de links" (sites que linkam para 2+ concorrentes).

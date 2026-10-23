# Prompt que gerou o relatório "Raio-X Seguro Auto e Saúde" (22/10/2026)

Fonte: https://amp.blog.br/d/1PwrrqZYodZBpVazAxpk8PRHz49ONQkLCcCGIa6tS/
Dados extraídos em dados.json (JSON embutido na página, id="dados"); renderização em render.js.

## Endpoints DataForSEO usados (por etapa)
1. Palavras-chave: DataForSEO Labs `keyword_suggestions` (live), limit 700, order_by keyword_info.search_volume,desc. Campos: keyword, search_volume, cpc, competition, keyword_difficulty, search_intent_info.main_intent, monthly_searches (12 meses). location_code 2076, language_code "pt".
2. Volume em IA: `AI Keyword Data / keywords_search_volume` (live), 300 palavras de maior volume por tema, num pedido só.
3. Resumo de IA do Google (base pronta): `LLM Mentions` -> `top_domains` (platform google, 10 itens) e `search` (platform google, 30 linhas, order ai_search_volume desc), target [{"keyword": "<tema>", "search_scope": ["question"]}].
4. Google real: `SERP Google Organic` live advanced com `load_async_ai_overview: true` (top 10 orgânico + fontes do AI Overview) para 6 buscas por tema; `SERP Google AI Mode` para 2 buscas por tema.
5. Referência EUA: `LLM Mentions` search + top_domains, platform chat_gpt, location_code 2840, language_code en.
6. Perguntas às IAs: LLM Scraper (ChatGPT, Gemini via app) e LLM Responses (Claude, Perplexity via API), web search ligada, país Brasil; modelos listados pelo endpoint `models` de cada uma, preferindo os mais baratos. 22 perguntas x 4 IAs = 88 respostas.

Saldo: GET /v3/appendix/user_data (grátis). Custo total: US$ 2,03 em 118 pedidos.

## Prompt completo
Quero um "Raio-X de mercado" sobre [TEMA 1] e [TEMA 2] no [PAÍS: Brasil], em [IDIOMA: português], mostrando o que as pessoas buscam no Google e quem as inteligências artificiais citam quando alguém pergunta sobre esses temas. Use SOMENTE a DataForSEO conectada (ferramenta de requisições e ferramenta de documentação). Teto de gasto: US$ 3.

REGRAS
1. Antes de começar, consulte meu saldo (GET /v3/appendix/user_data, grátis) e me diga o saldo.
2. Antes de usar cada endpoint pela primeira vez, leia a documentação dele com a ferramenta de documentação, para acertar os parâmetros e o preço. Não invente parâmetro.
3. Antes de cada etapa paga, me diga o custo estimado e quanto já foi gasto. Se a soma for passar do teto, pare e me pergunte.
4. Use local e idioma do país escolhido (Brasil = location_code 2076, language_code "pt"). A única exceção é a etapa 5, que só existe nos EUA em inglês.
5. Volumes e preços vêm da DataForSEO: não misture com outra fonte. O CPC vem em dólar.
6. As respostas de IA mudam a cada pergunta: trate como uma fotografia do dia.
7. Se um endpoint falhar, diga qual e siga com os outros.

ETAPAS DA COLETA
1. Palavras-chave. Para cada tema, use DataForSEO Labs "keyword_suggestions" (live), limite de 700, ordenado por volume (keyword_info.search_volume,desc). Guarde: palavra, volume mensal, CPC, concorrência, dificuldade (keyword_difficulty), intenção (search_intent_info.main_intent) e os 12 meses.
2. Volume em IA. Pegue as 300 palavras de maior volume de cada tema e consulte "AI Keyword Data / keywords_search_volume" (live) num pedido só. É um índice: use para comparar temas, não como contagem exata.
3. Resumo de IA do Google (base pronta). Use "LLM Mentions": "top_domains" (platform "google", 10 itens) e "search" (platform "google", 30 linhas, ordenado por ai_search_volume desc), com target [{"keyword": "<tema>", "search_scope": ["question"]}].
4. Google de verdade. Escolha as 6 buscas principais de cada tema (a principal, "mais barato", "melhor", "quanto custa", "online", e a pergunta mais buscada). Para cada uma, pegue a página do Google ("SERP Google Organic", live advanced, com o resumo de IA carregado: load_async_ai_overview true) e guarde o top 10 orgânico e as fontes do resumo de IA. Para 2 buscas de cada tema, pegue também o Modo IA ("SERP Google AI Mode").
5. Referência em inglês. Em "LLM Mentions", use "search" e "top_domains" com platform "chat_gpt", location_code 2840, language_code "en", com o tema traduzido para o inglês.
6. Perguntas às IAs. Escreva 10 a 12 perguntas por tema, como um cliente real perguntaria no meu país. Faça cada pergunta a 4 IAs (ChatGPT via LLM Scraper ou LLM Responses; Gemini; Claude; Perplexity), com busca na web ligada e país do usuário definido. Use os modelos que o endpoint "models" listar, preferindo os mais baratos. Guarde: texto, marcas citadas, sites usados como fonte.

ANÁLISE
- Palavras: total, buscas por mês somadas, CPC médio ponderado pelo volume, divisão por intenção, as 15 maiores, as perguntas, as oportunidades (volume >= 1.000 e dificuldade <= 20) e onde o clique é mais caro.
- IA: soma do índice de volume em IA comparada ao volume do Google das mesmas palavras.
- Marcas: conte por nome no texto de cada resposta e monte tabela marca x IA.
- Fontes: conte em quantas respostas cada site aparece como fonte, somando as 4 IAs.
- Google: para cada busca, quantas fontes do resumo de IA também estão no top 10 orgânico.

O RELATÓRIO: página HTML, tema claro e escuro, em português, seções: topo (título, data, nº de consultas, custo), quadros com números principais, 1 Demanda (abas por tema), 2 Busca em IA, 3 Quem o Google cita no resumo de IA, 4 O que as 4 IAs respondem, 5 Google por dentro, 6 Referência em inglês, 7 Como usar (5 a 7 lições tiradas dos dados), rodapé com método e custos.

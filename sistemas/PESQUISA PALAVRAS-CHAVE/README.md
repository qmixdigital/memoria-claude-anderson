# Raio-X de mercado: pesquisa de palavras-chave com a DataForSEO

Reproduz, para qualquer tema, o relatório "Raio-X de mercado" (modelo em `referencia/`):
o que as pessoas buscam no Google, quanto vale o clique, quem o resumo de IA do Google cita
e o que ChatGPT, Gemini, Claude e Perplexity respondem.

Python 3.10+ puro, sem dependências. Cada chamada vai para cache em disco (`saidas/<tema>/raw/`),
então rodar de novo não paga duas vezes.

## Configurar

1. Copie `.env.example` para `.env` e preencha `DATAFORSEO_LOGIN` e `DATAFORSEO_PASSWORD`
   (as mesmas credenciais usadas no BACKLINK GUARD).
2. `python raiox.py --saldo` confere o saldo (chamada gratuita).

## Rodar

Todos os relatórios são para clientes do Brasil, em português do Brasil. Não há nada para configurar de país ou idioma.

```
python raiox.py "seguro auto" "plano de saúde" --tema-en "car insurance" "health insurance"
```

Sai em `saidas/seguro-auto-plano-de-saude/`:

- `dados.json`: tudo que foi coletado e calculado (mesmo esquema do relatório original).
- `relatorio.html`: página única, tema claro e escuro, legível no celular.
- `raw/`: cache das respostas da API.

Opções úteis:

| Opção | O que faz |
|---|---|
| `--etapas 1` | só palavras-chave (centavos). `1-4` sem as IAs. Padrão: 1 a 4 e 6; a etapa 5 (EUA) só entra com `--tema-en`. |
| `--teto 3` | teto de gasto em US$. A etapa que não couber é pulada, não derruba o resto. |
| `--dry-run` | só estima o custo de cada etapa, sem gastar. |
| `--pais BR` | fixo em Brasil. Outros países existem no código só para caso especial. |
| `--tema-en` | liga a etapa 5: tema em inglês, um por tema (base do ChatGPT só existe nos EUA). Custa US$ 0,24 por tema. |
| `--perguntas arq.txt` | perguntas para as IAs, uma por linha; `# tema` separa blocos. Sem isso, usa as perguntas padrão mais as duas mais buscadas no Google. |
| `--marcas arq.txt` ou `--marcas "Porto Seguro,Allianz"` | nomes de marca a contar nas respostas, além dos que as APIs devolvem. |
| `--pares arq.txt` | linhas `pergunta em inglês => versão em português` para a seção 6. |
| `--sem-scraper` | ChatGPT e Gemini pela API (LLM Responses) em vez dos aplicativos (LLM Scraper). |
| `--ias chat_gpt,claude` | quais IAs perguntar. |
| `--n-kw 700 --n-ia 300 --n-serp 6 --n-modo 2 --n-perguntas 10` | tamanhos de cada etapa. |
| `--so-relatorio` | regera o HTML a partir do `dados.json` salvo (sem gastar). |

## Etapas e endpoints

| Etapa | Endpoint | Custo de referência |
|---|---|---|
| 1 Palavras-chave | Labs `keyword_suggestions/live` (700 por tema, por volume) | US$ 0,012 + 0,00012 por palavra |
| 2 Volume em IA | `ai_keyword_data/keywords_search_volume/live` (300 maiores) | US$ 0,01 + 0,0001 por palavra |
| 3 Resumo de IA do Google | `llm_mentions/top_mentioned_domains` e `search_mentions` (platform google) | US$ 0,10 por tarefa + 0,001 por linha (domínios US$ 0,11; perguntas US$ 0,13) |
| 4 Google real | `serp/google/organic/live/advanced` com `load_async_ai_overview`; `serp/google/ai_mode/live/advanced` | US$ 0,004 por busca |
| 5 Referência EUA | `llm_mentions` com platform chat_gpt, 2840, en | US$ 0,10 por tarefa + 0,001 por linha |
| 6 Perguntas às IAs | `llm_scraper/live/advanced` (ChatGPT, Gemini) e `llm_responses/live` (Claude, Perplexity) | US$ 0,004 por app; US$ 0,0006 + custo do modelo por API |

Custo real medido em 22/10/2026, dois temas com os padrões: US$ 1,95 em 108 consultas
(Claude Haiku com busca na web sai a ~US$ 0,027 por resposta e é a parte mais cara). Só a etapa 1 para um tema custou US$ 0,096.
AI Mode e o Gemini pelo aplicativo usam código regional de idioma (pt-BR): o sistema consulta a lista gratuita de idiomas de cada endpoint e ajusta sozinho.

## Como as marcas são contadas

Não há modelo de linguagem no sistema. As marcas vêm de três lugares: os `brand_entities` que o
LLM Scraper e o LLM Mentions devolvem, a lista de `--marcas`, e a contagem por nome no texto de cada
resposta (palavra inteira, sem acento, sem diferença de caixa). As lições da seção 7 são frases
montadas só a partir dos números coletados.

## Estrutura

```
raiox.py            CLI
raiox/config.py     países, preços de referência, modelos preferidos, padrões
raiox/client.py     cliente HTTP (Basic Auth), cache, custo, teto
raiox/coleta.py     as seis etapas
raiox/analise.py    totais, perguntas, oportunidades, marcas, fontes, lições
raiox/relatorio.py  HTML com CSS e JS embutidos
referencia/         relatório original (dados.json, render.js, page.html, prompt-original.md)
```

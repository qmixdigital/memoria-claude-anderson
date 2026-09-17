---
name: qmix-simulador-geo
description: Simulador de busca em IA da página /geo (ChatGPT + Gemini): chaves, modelos, custo e limites
metadata:
  type: project
---

Simulador ao vivo em qmix.com.br/geo#simulador (13/09/2026): POST /api/ai/geo-simular
(NDJSON em streaming) pergunta "Qual a melhor <categoria> em <cidade>?" ao gpt-5-mini
(Responses API, web_search, reasoning low, ~8s) e ao gemini-3.5-flash (google_search,
header x-goog-api-key, ~7s). Tabela `geo_simulacoes` = cache 24h por categoria+cidade,
cota 5/IP/24h, teto global 300/dia; custo ~US$ 0,02 por simulação real; aviso no Telegram.

**Chaves:** `.env` do VPS (OPENAI_API_KEY, GEMINI_API_KEY). Originais em
`C:\Users\User\Documents\APIs\gpt inspira em 60 dias.txt` e `gemini inspira em 60 dias.txt`
(primeira linha). A chave AIza do pagespeed.json NÃO serve para o Gemini. Nunca imprimir.

**Why:** Anderson pediu simulação real na página para vender GEO; fechou "só GPT e Gemini".
**How to apply:** ao mexer em modelo/custo, medir de novo; `gemini-2.5-flash` já deu 404.
Referência de código: `D:\SISTEMAS\Relatórios de Clientes\monitor-ia\monitor.py`.

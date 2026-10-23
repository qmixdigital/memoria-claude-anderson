---
name: sistema-pesquisa-palavras-chave
description: "Estado do sistema Raio-X (d:\\SISTEMAS\\PESQUISA PALAVRAS-CHAVE): CLI Python puro sobre a API DataForSEO, 6 etapas, construído em 22/10/2026; falta só o .env com a credencial"
metadata:
  node_type: memory
  type: project
  originSessionId: 7d8088a9-e2ed-40fd-8718-21fec8dd45de
  modified: 2026-10-22T18:24:51.352Z
---

Sistema `raiox.py` em `d:\SISTEMAS\PESQUISA PALAVRAS-CHAVE` (Python 3.13, sem dependências, urllib).
Reproduz o relatório de [[relatorio-raio-x-dataforseo]] para qualquer tema e país: etapas 1 a 6 ligáveis por `--etapas`,
cache em `saidas/<tema>/raw/`, teto de gasto, `--dry-run`, `--so-relatorio`, relatório HTML claro/escuro.
Credencial DataForSEO: login `marketing@qmix.com.br`, senha documentada no README do BACKLINK GUARD
(`d:\SISTEMAS\BACKLINK GUARD\README.md`, seção de credenciais) e no `source/.env` daquele projeto.
Validado com a API real em 22/10/2026 (`.env` criado pelo Anderson; saldo ~US$ 26). Relatório de referência gerado em `saidas/seguro-auto-plano-de-saude/`.
Particularidades da API que custaram dinheiro para descobrir: AI Mode e Gemini LLM Scraper exigem `pt-BR` (lista em `/languages` de cada endpoint); `top_mentioned_domains` usa `limit` (sem ele devolve 100 linhas e custa US$ 0,20), itens vêm em `domain` + `total.mentions`; no LLM Scraper o nome da marca está em `brand_entities[].markdown` e `title` é descrição; `brand_entities` do `search_mentions` só traz descrição; Gemini app dá timeout 50401 às vezes (retry resolve).
**How to apply:** rodar `python raiox.py "tema" --etapas 1` para pesquisa barata; o completo com `--tema-en`. Cache em `saidas/<tema>/raw/` evita pagar de novo.

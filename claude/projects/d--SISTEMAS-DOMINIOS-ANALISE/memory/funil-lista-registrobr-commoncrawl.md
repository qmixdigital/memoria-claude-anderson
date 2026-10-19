---
name: funil-lista-registrobr-commoncrawl
description: Funil validado para achar dominios do Registro.br (liberacao e competicao) com backlinks gov/edu; onde esta a pasta do mes com tudo e como repetir
metadata:
  type: project
---

Tudo da analise de outubro/2026 esta em `D:\SISTEMAS\DOMINIOS ANALISE\2026-10\`. Comecar sempre por `00-LEIA-ME-MEMORIA-2026-10.md`
(funil, numeros, custos, armadilhas e o passo a passo para repetir). Documento mestre: `TODOS-OS-DOMINIOS-2026-10.csv`
(157.550 liberados + 152 em competicao, com destino de cada um). Relatorio: `05-relatorio/relatorio-dominios-2026-10.html`.
Para o proximo mes: criar `2026-11` copiando `04-scripts` e seguir a secao 8 do documento. O relatorio tem nota de compra 0-10 (formula em `04-scripts/classificar.mjs`), aba Minha lista com prioridade/lance/anotacao, exportar CSV e backup JSON (restaurar no relatorio do mes seguinte), e paginas exatas de origem via `paginas-origem.mjs` (Moz `links`, ~100 linhas por dominio).

Funil: 157.550 -> 146.165 (filtros de nome/sufixo) -> 6.616 (aparecem no ranking de dominios do Common Crawl) -> 3.888 (DA>=5, spam<60, RD>=3, coleta de links gov/edu) -> 236 (lista curta). Controle de 1.000 dominios de fora do ranking: 0 com DA>=20 e 0 com gov/edu.

**Why:** Open PageRank mudou para Keywords Everywhere (30 mil/mes, chave antiga invalida), Wayback bloqueia acima de ~1 req/s, e curl -C - corrompe o download do Common Crawl (usar Range em partes). A indexacao usa Serper.dev (saldo ~40 mil), nao a SerpApi (5 mil/mes).

**How to apply:** pedir autorizacao ao Anderson antes da coleta de links (custou ~74 mil linhas Moz, nao centenas). Ele quer gov, edu, associacoes, cooperativas, portais fortes e Wikipedia; aceita DA>=5; marcar "Competicao" no relatorio; coluna Sinal e Indexacao lado a lado; Registro.br ele confere manualmente pelo link, nao automatizar; fonte de gov cujo link sumiu (Moz date_disappeared) nao conta. Ver [[analise-lista-dominios-moz]].

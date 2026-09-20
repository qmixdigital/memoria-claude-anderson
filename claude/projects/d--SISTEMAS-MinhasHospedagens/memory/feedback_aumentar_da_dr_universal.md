---
name: aumentar-da-dr-universal
description: "A skill aumentar-da-dr e universal (qualquer site atendido, cliente ou diretorio) e so roda quando o Anderson pedir metrica de um site nomeado; nunca \"para testar\""
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-19T10:39:26.382Z
---

Em 19/09/2026 a skill `aumentar-da-dr` foi rodada por uma sessao "para testar a instalacao" no personalverificado: importou a planilha para o ledger, gerou fila de outubro e fez 7 insercoes reais (segundo link em 7 dominios). O Anderson reprovou: a skill nao e de um site, e universal para todo site atendido, e nao se aciona sem pedido.

**Why:** rodar sem pedido gasta dominio referente (estoque finito) e deixa registro de um site que ninguem pediu; o texto da skill com exemplo de um site especifico vicia as proximas execucoes.

**How to apply:** ledger.csv e metricas.csv foram zerados (backup em `D:\PORTAIS\BACKLINKS\personalverificado\ledger_teste_20260919.csv.bak`), a FILA-2026-10 apagada, e o SKILL.md reescrito a partir do original do Anderson (`C:\Users\User\Desktop\SKILL.md`) sem nenhum nome de site; coluna do ledger agora e `site`, e `inserir_link.py` aceita `--site`. So acionar quando ele pedir "subir DA/DR/AS" de um site nomeado. Guest post de ranking continua so na planilha `.xlsx` ([[registro-backlinks-por-dominio]]).

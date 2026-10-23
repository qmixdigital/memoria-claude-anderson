---
name: relatorios-sempre-brasil
description: "Todos os relatórios de palavras-chave do Anderson são para clientes do Brasil, em português do Brasil; o sistema Raio-X fica otimizado só para BR"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7d8088a9-e2ed-40fd-8718-21fec8dd45de
  modified: 2026-10-22T20:08:22.505Z
---

Todos os relatórios de pesquisa de palavras-chave são para clientes brasileiros: país Brasil (location_code 2076), português do Brasil (pt / pt-BR conforme o endpoint).

**Why:** o Anderson pediu em 22/10/2026 para fixar isso e não gastar tempo nem chamadas com outros países. A etapa 5 (referência dos EUA em inglês) só interessa em caso especial.

**How to apply:** no [[sistema-pesquisa-palavras-chave]], não perguntar país nem idioma; rodar com os padrões (BR). Só ligar a etapa 5 se ele passar `--tema-en` explicitamente. Códigos regionais de idioma já ficam fixos em `IDIOMAS_FIXOS` do config, sem consulta à lista de idiomas.

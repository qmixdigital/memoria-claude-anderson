---
name: feedback-links-internos-planilha-jean
description: "Link interno de matéria em portal parceiro só pode apontar para matéria NOSSA no mesmo portal, tirada da planilha do Jean, de preferência as mais recentes"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 87bf0b54-5114-498b-8472-92aefb2139f1
  modified: 2026-09-24T20:56:18.056Z
---

Link interno em matéria para portal parceiro (DM e outros do Jean) tem que apontar para matéria **nossa** publicada naquele portal, nunca para matéria qualquer do portal (ordem do Anderson, 24/09/2026, ao ver links para "Lula anuncia canetas no SUS" e "Juliana Borges no Araguaia", que não eram nossos).

**Why:** o link interno serve para dar autoridade às nossas matérias já pagas; se todas as matérias novas linkarem as mais recentes, nenhuma fica sem link interno.

**How to apply:** antes de escrever, listar as linhas do portal na aba "Pedidos Fevereiro" da planilha do Jean (`scripts/planilha_jean.py`; ler as linhas com `valores(s, "'Pedidos Fevereiro'!A1:F400")` e filtrar pelo domínio; coluna E é a URL publicada). Escolher as que encaixam no tema, **priorizando as últimas publicadas**, conferir que dão 200 e usar corte do H1 como âncora. Não perguntar ao Anderson se ele não mandou: buscar na planilha. Relacionado: [[qmix-regra-primeiro-link]].

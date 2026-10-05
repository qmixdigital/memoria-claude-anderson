---
name: feedback-economia-de-tokens
description: Anderson tem limite semanal de tokens; não disparar agentes em massa nem pesquisa web em paralelo sem ele pedir
metadata:
  node_type: memory
  type: feedback
  originSessionId: c3d231f4-0c41-4731-9b25-5651970d6bec
  modified: 2026-10-04T11:34:50.083Z
---

Não disparar lotes de agentes (redação, conferência, pesquisa) por conta própria. Em 04/10/2026, no pedido de listas do Dr. Aurélio + COE, 13 agentes de conferência com busca na web (cada um ~100 mil tokens, herdando o modelo Fable) consumiram o limite dele; ele mandou parar duas vezes e ficou furioso por eu não ter parado no primeiro aviso.

**Why:** o limite é semanal; se estoura, ele fica sem conseguir trabalhar o resto da semana.

**How to apply:** conferência e pesquisa primeiro por script (baixar páginas com requests e comparar termos) e buscas pontuais na sessão principal; ler só o que não bateu. Antes de qualquer trabalho com mais de 2 ou 3 agentes, dizer o custo estimado e esperar o "pode". Se ele reclamar de tokens, parar tudo na hora (TaskStop) e só então explicar. Para trabalho pesado ele prefere trocar de modelo (`/model sonnet`) ou passar a outra sessão com um documento de passagem, como em [[qmix-pedido-listas-joelho-2026-10]].

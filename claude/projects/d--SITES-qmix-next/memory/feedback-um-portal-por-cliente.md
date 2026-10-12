---
name: feedback-um-portal-por-cliente
description: Nunca mandar duas matérias do mesmo cliente para o mesmo portal; em campanha compartilhada, cruzar as listas de portais antes de criar as matérias (erro de 09/10/2026 no jornaldebeltrao)
metadata:
  type: feedback
---

Um portal recebe UMA matéria por cliente por campanha. Antes de criar matérias de campanhas compartilhadas (ex.: Dr. Ulbiramar + COE Ortopedia e Dr. Ulbiramar + COE Acupuntura), cruzar a lista de portais de cada uma com `materias` (portal + cliente) e com `backlinks_clientes` do cliente; se o portal já tem matéria do cliente em produção ou publicada, trocar o portal.

**Why:** em 04/10/2026 criei duas listas de joelho com o Dr. Ulbiramar em 1º para o jornaldebeltrao.com.br (uma para o COE Ortopedia, outra para o COE Acupuntura); as duas foram agendadas para 09/10 e publicadas no mesmo dia. O Anderson: "você repetiu um link num portal de notícia duas vezes para o mesmo cliente desnecessariamente". Dois links no mesmo domínio valem menos que dois portais, e o cliente pagou duas vezes. Publicado não se desfaz.

**How to apply:** ao montar campanha, listar `select portal, cliente from materias where status <> 'revogado'` e conferir repetição por cliente antes de rodar o criar-materia; na agenda (fatura_itens.envio_previsto), nunca dois itens do mesmo portal para o mesmo cliente. Ver [[qmix-pedido-listas-joelho-2026-10]] e [[feedback-sem-troca-apos-publicado]].

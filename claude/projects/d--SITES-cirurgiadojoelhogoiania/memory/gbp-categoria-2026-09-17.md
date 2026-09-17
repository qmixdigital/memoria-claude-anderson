---
name: gbp-categoria-2026-09-17
description: Em 17/09/2026 a categoria principal do Google Business Profile do Dr. Ulbiramar mudou de "Medico" para "Cirurgiao ortopedico"; medir impressoes da home no celular antes/depois
metadata:
  type: project
---

Em **17/09/2026** o Anderson trocou no Google Business Profile do Dr. Ulbiramar:
- principal: "Medico" -> **"Cirurgiao ortopedico"**
- adicionais: so "Medico" e "Medico esportivo" (sairam Cirurgiao, Cirurgiao ortopedico pediatrico,
  Medico para o tratamento de dores, Clinica ortopedica)

Contexto: a home esta em posicao ~1 para "ortopedista especialista em joelho goiania" no Search
Console mas com CTR de 0-3% e posicao 22 no desktop; o clique no celular vai para o local pack.
No mesmo dia a home ganhou title/H1 com "especialista" + "Goiania" e uma secao nova de conteudo.

**Baseline (Search Console, home, consultas com "joelho", 18/06 a 15/09/2026):**
celular 2.145 impressoes / 25 cliques / pos 4,8; desktop 1.084 / 8 / pos 22,2.
Consultas-alvo 4 semanas (18/08-15/09): 187 impressoes, 5 cliques, pos 1,2.

**How to apply:** a partir de meados de outubro, rodar a mesma consulta (script em
`d:\GitHub\joelho-gh\_migracao`, funcao q() do Search Console) e comparar impressoes e CTR
no celular com o baseline. O GBP nao tem API nas contas de servico da pasta; e manual.

---
name: reference_revisita_gsc_passo7
description: "Passo 7 (revisita) da skill google-console-analise, criado em 18/09/2026 a partir do podcast de James Dooley sobre query augmentation; scripts gsc_api.py e revisita.py"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-18T20:01:58.532Z
---

Em 18/09/2026 a skill `google-console-analise` ganhou acesso por API (`scripts/gsc_api.py`,
usa as 3 service accounts e acha sozinha a propriedade) e o **Passo 7: revisita**
(`scripts/revisita.py DOMINIO [--url URL] [--dias 90] [--md saida.md]`), que cruza
`query + page` do GSC com o texto da página e classifica cada consulta em COBRE, GRAFIA,
REFORÇAR, EXPANDIR, CRIAR? e CTR.

Origem e notas completas: `D:\PORTAIS\BACKLINKS\QUERY-AUGMENTATION-notas-20260918.md`.

**Quando rodar:** 30 e 60 dias depois de cada lote de guest post (propriedade do portal e do
cliente) e mensal nas páginas comerciais do cliente. Site novo com menos de 30 dias devolve
1 a 2 impressões por consulta; não concluir nada.

**Primeiro teste (18/09):** facoqr.com.br, 90 dias: home com 44 consultas, 3 cobertas na forma
exata; "qr code gratuito" (13 imp) e "qr code facil" (6) ausentes do texto; /qr-code-wifi
recebe "qr code wifi" (12 imp) e a página só escreve "Wi-Fi". Guest posts da rodada 1 (17 dias)
ainda sem dado útil. Saída em `D:\PORTAIS\BACKLINKS\facoqr-REVISITA-20260918.md`.

**Regra de decisão H2 x página nova:** mesma SERP para as duas consultas = H2 na página;
SERP diferente = página própria com link interno. A ordem dos H2 segue a ordem dos atributos
nos títulos da SERP.

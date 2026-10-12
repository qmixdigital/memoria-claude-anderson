---
name: analise-lista-dominios-moz
description: Como analisar lista avulsa de dominios expirados na Moz (script standalone, custo de cota, criterio de ranking gov/edu) e onde ficam os resultados
metadata:
  type: project
---

Em 09/10/2026 analisei 200 dominios expirados (.com.br) do Anderson na API da Moz com o script
independente `D:\SISTEMAS\DOMINIOS ANALISE\scripts\analisar-lista-moz.mjs` (roda na VPS
hostinger-vps-srv1166087 a partir de /tmp, le o .env de /var/www/qmix-next, nao toca no banco) e
ranqueei com `scripts/ranquear.py`. Resultado em `resultados/ranking-200-dominios-2026-10-09.csv`.
Guia completo: secao 8 de `COMO-CONFERIR-DOMINIOS-NA-MOZ.md`.

**Why:** os scripts da plataforma (verificar-moz.mjs, coletar-linking.mjs) so aceitam dominios ja
cadastrados em dominios_rb; lista solta precisa do script standalone. Custo: 1 linha por dominio na
fase 1 e ate 20 linhas por dominio na fase 2 (200 dominios = ~3.900 linhas de 120.000/mes).

**How to apply:** o que o Anderson quer saber e quem tem backlink de .gov.br/.edu.br/.jus.br e de
sites fortes de verdade. Fontes com DA 60+ enganam: a maioria e diretorio de spam (99sitedirectory,
seohelperdirectory, kingranks, articlement) ou encurtador. Regra que funcionou: descartar qualquer
origem que aponte para 3+ dominios da mesma lista, contar universidades federais em .br direto
(ufsm.br, embrapa.br, fapesp.br) como edu. Para lote de milhares, pedir autorizacao antes (regra dele
de 14/09/2026). Ver [[moz-api-qmix]].

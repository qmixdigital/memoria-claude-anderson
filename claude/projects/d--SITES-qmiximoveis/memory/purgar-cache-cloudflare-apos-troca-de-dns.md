---
name: purgar-cache-cloudflare-apos-troca-de-dns
description: "Depois de virar DNS de site antigo para novo na Cloudflare, purgar o cache da zona é parte da troca, não reação a sintoma."
metadata: 
  node_type: memory
  type: project
  originSessionId: 5e6eff87-4b52-445e-b9e9-51cd22065df2
  modified: 2026-07-30T09:14:37.231Z
---

Ao migrar um domínio do site antigo para o novo com a zona na Cloudflare
(registro proxied/laranja), **esvaziar o cache da zona imediatamente após virar
o registro A**. Sem isso, a borda continua entregando respostas da origem antiga
por tempo indeterminado, e o site responde misturado.

**Why:** no cutover de `qmiximoveis.com.br` (30/07/2026), minutos depois da
troca o apex devolvia `301` de `/apartamentos-goiania/setor-bueno` para
`/imoveis/` — caminho que só existia no WordPress antigo. Parecia propagação de
DNS, mas com registro proxied não há propagação a esperar: o IP público é
anycast da Cloudflare e não muda. Era resposta velha guardada na borda, com
`cf-cache-status: HIT` e `Age: 180`. Um detalhe que engana: **o 301 ficou
guardado mesmo tendo saído da origem com `Cache-Control: no-store`**, então
cabeçalho de cache na origem não dispensa o purge.

**How to apply:** pedir a mesma URL de dois jeitos — crua e com `?v=1`. Se a
versão com query vem certa e a crua vem errada, é **cache** e o purge resolve.
Se as duas vêm erradas, é **roteamento**: conferir o registro A, o laranja e as
regras da zona, porque purgar não resolve nada. Purge é operação de conteúdo e
não toca em SSL, WAF nem Transform Rule, então convive com
[[nao-mexer-na-config-de-seguranca-da-cloudflare]].

Relacionado: [[cloudflare-sobrescreve-headers-de-seguranca]].

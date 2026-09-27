---
name: trafego-concentrado-no-blog
description: "No ombrogoiania o blog responde por ~23 mil dos 23,4 mil cliques anuais; a home tem 316 e as 21 paginas de servico somam ~4"
metadata: 
  node_type: memory
  type: project
  originSessionId: ada82c56-8b44-4e1c-855b-85dd32df4222
  modified: 2026-09-22T12:19:23.940Z
---

Search Console, 365 dias até 19/09/2026 (conta `seoqmix`, propriedade
`sc-domain:ombrogoiania.com.br`): 23.391 cliques e 2,8 milhões de impressões.
A divisão é extrema:

- **blog**: praticamente tudo. O artigo `dor-no-ombro-esquerdo-que-irradia-para-o-braco`
  sozinho faz 2.369 cliques, mais que todo o resto do site somado.
- **home**: 316 cliques, 31 mil impressões.
- **as 21 páginas de serviço**: ~4 cliques no ano inteiro, mesmo as publicadas
  em janeiro. Elas não têm autoridade nenhuma.

Duas consequências práticas:

1. **Quem passa autoridade é o blog.** Link de página de serviço para página de
   serviço não move nada. O que move é link contextual dos artigos de maior
   tráfego para a página de serviço, que foi o que se fez em 22/09/2026 (212
   artigos).
2. **O nome do convênio está nas consultas que mais convertem na home.**
   "ortopedista especialista em ombro goiânia ipasgo" dá 28 cliques e
   "...unimed goiânia" 14; Ipasgo e Unimed somam 62 dos 316 cliques da home.
   Conteúdo e âncora que citam o convênio têm demanda medida, não suposição.

**Oportunidade parada** (muita impressão, posição 5 a 20): "dor no ombro
esquerdo" (82 mil impressões, pos 6,9), "tendinopatia do supraespinhal" (47
mil, pos 8,0, só 51 cliques), "mobilidade de ombro" (43 mil, pos 5,2),
"olecrano" (35 mil, pos 6,4, 6 cliques), "cervicobraquialgia" (27 mil, pos
8,5), "cotovelo" (27 mil, pos 9,0).

**CTR de 0,1% no top 3** em consulta de definição: "acromio" tem 64.413
impressões na posição 2,8 e 65 cliques; "musculos do ombro" 23.922 impressões
na posição 2,3 e 57 cliques. Isso é AI Overview e painel do Google comendo o
clique, não title ruim. É o cenário que o bloco "Resposta rápida" e o
`speakable` atacam; medir de novo 30 a 60 dias depois de 22/09/2026.

**Why:** sem esse número a tendência é tratar home e páginas de serviço como se
já tivessem força, e gastar esforço onde não há tração.

**How to apply:** antes de propor qualquer coisa neste site, puxar o GSC (ver
[[gsc-chaves-em-disco]]) e decidir pelo dado. Reexportar os cliques por artigo
para `blog/dados/gsc-cliques.json`, que é o que distribui as âncoras da home.

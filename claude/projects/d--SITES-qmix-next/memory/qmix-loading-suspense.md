---
name: qmix-loading-suspense
description: loading.tsx no nível do grupo (frontend) fazia toda página indexável servir um shell de Suspense; boundaries agora só nas rotas dinâmicas
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-09-08T21:45:27.621Z
---

Não recriar `src/app/(frontend)/loading.tsx` (nem em `[slug]`, `blog/[slug]`,
`pacotes-de-backlinks/[slug]`). Em 2026-09-08 esses arquivos foram removidos e o
spinner ficou só nas rotas logadas/dinâmicas (lista-de-backlinks, lista-de-pacotes,
minha-conta, meus-pedidos, checkout, carrinho, favoritos, busca, pagamento,
pedido-confirmado, enviar-dados).

**Why:** um `loading.tsx` no nível do grupo envolve TODA rota abaixo dele num
Suspense. O HTML servido saía com `<main>` contendo só um spinner e
`<template id="B:1">`, e o conteúdo real chegava num chunk depois do `</footer>`.
Efeito: o rodapé e a navegação vinham antes do H1 na ordem do documento, e o LCP
esperava o segundo chunk. O Google renderiza e indexa assim mesmo, então o
problema não aparece em relatório de cobertura, só no LCP e na ordem do HTML.

**How to apply:** para indicador de carregamento em página estática/ISR, usar
barra de progresso global no cliente (`useLinkStatus`), nunca `loading.tsx`.
Conferir com `curl <url> | grep 'template id="B:'` — em página indexável tem que
dar zero, e o `<h1>` tem que estar dentro de `<main>`.

Relacionado: [[qmix-deploy-atomico]], [[qmix-portais-nao-expostos]]

---
name: cls-de-fonte-medir-no-alvo
description: "CLS causado por troca de fonte precisa ser medido no PageSpeed, nunca no Chrome do desktop, porque a maquina de teste tem fontes que o celular nao tem"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3de5b85d-fd38-4889-9a60-0c132c894750
  modified: 2026-08-23T19:51:34.192Z
---

Reserva de fonte com métrica ajustada (`size-adjust`, `ascent-override`) depende
de `local('Georgia')`, `local('Arial')`, `local('Segoe UI')` — e **nenhuma dessas
existe no Android**. Medir CLS no Chrome do Windows dá 0 porque a máquina tem
essas fontes; o celular do usuário cai numa genérica sem ajuste e desloca o texto.

**Por quê:** aconteceu em tratamentodor.com.br. Playwright no Windows deu CLS
0,0000 em três rodadas; o PageSpeed deu 0,157, reprovando Core Web Vitals. Acrescentar
`local('Noto Serif')` e `local('Roboto')` com métricas reais não resolveu, porque o
Lighthouse roda Chrome headless em Linux e também não tem essas fontes. Nenhuma
estratégia baseada em `local()` fecha o caso geral.

**Como aplicar:** na fonte de display (títulos), usar `font-display: optional` com
`rel=preload` e arquivo no mesmo domínio. Sem troca, não há deslocamento, em qualquer
aparelho. O custo é zero se a fonte for pré-carregada e local: verificado renderizando
até em 3G (0,7 Mbps / 300 ms). Texto corrido pode seguir em `swap`. E validar sempre
pelo PageSpeed com `&key=`, não pelo navegador da máquina. Ver [[chave-pagespeed-ja-existe]].

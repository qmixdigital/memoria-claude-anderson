---
name: rolar-devagar-para-medir-revelacao
description: medir bloco invisível rolando rápido acusa falso positivo; o IntersectionObserver não acompanha
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3de5b85d-fd38-4889-9a60-0c132c894750
  modified: 2026-08-26T23:12:56.465Z
---

Ao verificar se algum `.dpp__ent` ficou invisível, rolar a página de 600 em 600px
com 60 ms de intervalo acusa blocos invisíveis que **não existem**: o
IntersectionObserver não consegue processar os callbacks nesse ritmo. Com passo de
400px, 80 ms entre eles e 800 ms de espera no fim, o mesmo teste dá zero.

**Why:** o falso positivo aparece justamente nos blocos do rodapé da página, que é
onde um bug real também apareceria. Sem desconfiar do método, o passo seguinte é
"consertar" um comportamento que está correto e possivelmente quebrar outra coisa.

**How to apply:** antes de tratar medição de animação como defeito, repetir com
ritmo mais lento e conferir `scrollY` final contra `document.documentElement.scrollHeight`.
Mesma família de erro de [[hover-de-card-medir-por-pixel]] e
[[cls-de-fonte-medir-no-alvo]]: o método mentiu, não o site.

Vale o par disso: screenshot do Playwright pode pegar a versão em cache de borda.
Uma captura saiu sem a imagem destacada que o `curl` mostrava presente. Toda URL de
verificação leva `?nc=`.

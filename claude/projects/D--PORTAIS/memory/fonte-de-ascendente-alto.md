---
name: fonte-de-ascendente-alto
description: Darker Grotesque com line-height 1.07 faz o título de duas linhas transbordar a caixa e a assinatura sair por cima
metadata:
  type: project
---

O `line-height` que serve para uma família não serve para outra. A **Darker
Grotesque** tem ascendente alto: com `1.07`, herdado da AR, o `h1` de duas linhas
transborda a própria caixa e a linha de assinatura, que vem logo abaixo e não tem
margem própria, fica **por cima do título**.

Medida que resolveu na AS: `line-height:1.16` com `margin-bottom:15px` no `h1` do
artigo, e `1.12` com `margin-bottom:2px` no nome da editoria.

**Why:** a assinatura vem de `H.metaRow` do motor, com classe hasheada, e a
arquitetura não controla a margem dela. O respiro tem que sair do `h1`.

**How to apply:** ao trocar a fonte de título de uma arquitetura copiada, olhar a
captura do artigo com título de **duas linhas**, não de uma. Vale também para
Anton, Bebas e qualquer condensada alta.

Ver [[fonte-de-um-peso-so]].

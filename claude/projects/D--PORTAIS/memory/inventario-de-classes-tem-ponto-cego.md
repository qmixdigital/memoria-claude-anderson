---
name: inventario-de-classes-tem-ponto-cego
description: o classes_por_portal.py só mede classe gerada pelo motor; a classe escrita dentro do artigo nunca apareceu
metadata:
  type: project
---

O `classes_por_portal.py` ignora, de propósito, classe que não vem do motor.
Com isso ele vinha respondendo "só o `.adsbygoogle` repete" enquanto **classe
escrita dentro do conteúdo do artigo** nunca entrava na conta.

O que estava escondido ali (medido no HTML servido, 28/08/2026):

| classe | portais |
|---|---|
| `internos-qmix` | 93 |
| `qmix-veja`, `cct-veja`, `malha` | 30 |
| `expansao-qmix`, `expansao2-qmix`, `leia-tambem-qmix` | 48 |
| `tabwrap`, `pe-leia-meio`, `nm`, `go`, `schema-section` | 39 a 40 cada |

As com `qmix` no nome **escrevem o nome da agência no HTML de portal de
cliente**, que é justamente o que [[nunca-citar-a-agencia-nos-portais]] proíbe.
Vieram de scripts de crosslinking antigos e não tinham CSS nenhum.

**Why:** medir a fonte errada dá um número bonito e falso. O que o analista vê
é o HTML servido, não o JSON de origem nem o subconjunto que o motor gera.

**How to apply:** medir sempre no `public/**/index.html`, com o `cls_serv_json.py`,
e comparar as **três máquinas juntas** — dentro de uma máquina só não prova nada.
O conserto é pôr o nome no `_CLS_LIT` do `render.js`: o `_renomClasses` troca no
atributo `class=` e no seletor do `<style>` na mesma passada. Conferir antes que
nenhum JavaScript leia a classe.

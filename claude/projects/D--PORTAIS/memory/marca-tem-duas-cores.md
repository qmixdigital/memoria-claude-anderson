---
name: marca-tem-duas-cores
description: Verde de marca vivo nao carrega texto sobre papel; precisa de um segundo verde escuro so para leitura
metadata:
  type: reference
---

A logomarca do AdOnline e **lima pura `#06F100`**. Sobre papel claro ela tem
**1,48:1** de contraste: nao pode carregar texto, link nem risco fino. Usar a cor
da marca em tudo e o erro obvio ao virar um portal de escuro para claro, e nada
na tela acusa.

O sistema que resolve tem **duas cores da mesma familia**:

| cor | onde | contraste |
|---|---|---|
| lima `#06F100` | quadrado da marca, marcador de secao, marca-texto de destaque | 11,9:1 com preto por cima |
| verde profundo `#0B6B1F` | link, chapeu, risco, capitular, botao | 6,4:1 sobre papel |

Regra pratica: a cor viva so entra **onde ha massa e o preto por cima**. Tudo que
e traco fino ou texto usa a versao escura.

Conferir com a conta, e nao no olho:

```python
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[(x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4) for x in c]
    return .2126*c[0]+.7152*c[1]+.0722*c[2]
def cr(a,b):
    l1,l2=sorted([lum(a),lum(b)],reverse=True); return (l1+.05)/(l2+.05)
```

Ver [[arch-local-e-fonte-unica]] e [[classes-css-nao-podem-repetir]].

---
name: contraste-do-tema-abaixo-da-regua
description: 31 dos 89 portais tinham algum par de cor abaixo de 4,5:1, quase sempre o muted e o primary, que é a cor do link do corpo
metadata:
  type: project
---

Medido em 23/08/2026, depois de o Anderson apontar legibilidade no rodapé: **31
dos 89 portais** tinham pelo menos um par de cor do tema abaixo de 4,5:1.

| par | onde aparece | quantos |
|---|---|---|
| `muted`/`paper` | data, chapéu, crédito: texto **pequeno** | 25 |
| `primary`/`paper` | **o link do corpo**, que é o backlink do cliente | 8 |
| `onPrimary`/`primary` | texto do botão e da faixa cheia | 7 |

**Why:** essas cores foram escolhidas "a olho" para parecerem discretas, e
discreto vira ilegível. O `primary` é o pior caso: ele pinta o link do corpo, e o
link do corpo é o produto desta rede.

**How to apply:** `ajusta_contraste.py` empurra **só a luminosidade**, um passo de
cada vez, preservando matiz e saturação, até cruzar 4,6:1. Assim a cor da marca
continua reconhecível: o carmim do diariopernambucano foi de `#DA3444` para
`#D82B3C`.

⚠️ **`onPrimary` se resolve escolhendo**, não empurrando: branco ou quase preto, o
que der mais contraste sobre a primária. Só se nenhum dos dois passar é que a
primária anda.

⚠️ **A ordem importa:** a primária primeiro, porque mexer nela muda o par
seguinte. Depois de ajustar a primária, dois portais deixaram de reprovar em
`onPrimary` sem que ela fosse tocada.

`contraste_tema.py` mede os sete pares e roda em qualquer máquina.
Ver [[rodape-com-var-ink-em-paleta-escura]].

---
name: rodape-com-var-ink-em-paleta-escura
description: 12 arquiteturas pintavam o rodapé com var(--ink) e escreviam com var(--sob); em paleta escura isso é fundo claro com texto claro
metadata:
  type: project
---

Doze arquiteturas da opengravity tinham
`${s('xxfoot')}{background:var(--ink);color:var(--sob)}`.

**Why:** em paleta **clara** o `--ink` é quase preto e o `--sob` (`onPrimary`) é
branco, então o rodapé escuro com texto branco sai certo **por coincidência**. Em
paleta **escura** os dois se invertem: `--ink` é a cor do texto, quase branca, e
`--sob` é a cor legível sobre a primária — num portal de acento âmbar, grafite.
O rodapé virou uma faixa quase branca com o logotipo branco e os links brancos
por cima. Ilegível.

O Anderson viu na captura antes de qualquer auditoria: nenhum script pegava,
porque o HTML e o CSS estavam "certos".

**How to apply:** o rodapé usa os campos que existem para isso no tema de todos
os 89 portais:

```js
${s('xxfoot')}{background:${t.footerBg || 'var(--ink)'};color:${t.footerTx || 'var(--sob)'}}
```

⚠️ **Nem toda arquitetura tem rodapé escuro.** A U pinta com `--surface` e
escreve com `--muted`, de propósito. Auditor que mede sempre `footerBg` acusa
falso positivo nela.

As outras duas máquinas já usavam `var(--footer-bg)` e `var(--footer-tx)` e não
precisaram de nada. Ver [[marca-tem-duas-cores]] e
[[variaveis-css-no-main-nao-alcancam-o-cabecalho]].

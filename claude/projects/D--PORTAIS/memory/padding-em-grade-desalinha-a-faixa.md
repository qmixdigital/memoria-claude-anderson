---
name: padding-em-grade-desalinha-a-faixa
description: Fio vertical feito com border-left mais padding deixa a coluna do meio mais estreita, e a imagem em aspect-ratio sai mais baixa
metadata:
  node_type: memory
  type: project
---

Para desenhar o fio entre as colunas de uma faixa, o caminho óbvio é
`border-left` com padding lateral, e zerar o padding nas pontas para a faixa
encostar no contêiner:

```css
.fluxo > *              { padding: 0 30px; border-left: 1px solid var(--linha) }
.fluxo > *:first-child  { padding-left: 0; border-left: 0 }
.fluxo > *:last-child   { padding-right: 0 }
```

Parece certo e está errado: a coluna do meio perde **60px** de conteúdo e as das
pontas perdem **30**. Com a imagem em `aspect-ratio`, a do meio sai mais baixa
que as vizinhas, e o chapéu, o título, o resumo e a data daquela coluna sobem
todos junto. A faixa fica visivelmente torta, e a queixa que chega é
"desorganizado", não "coluna estreita".

O certo é o vão ser `gap`, que o grid distribui igual, e o fio virar
pseudo-elemento no **meio** do gap:

```css
.fluxo            { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0 56px }
.fluxo > *        { position:relative }
.fluxo > * + *::before { content:""; position:absolute; left:-28px; top:0; bottom:0;
                         width:1px; background:var(--linha) }
```

Em duas colunas, apagar o fio de quem abre linha: `> *:nth-child(odd)::before
{display:none}`. Em coluna única, apagar todos e separar por `border-top`.

⚠️ **A variante de duas matérias tem especificidade maior.** A regra
`.fluxo.duo{grid-template-columns:repeat(2,...)}` vale (0,2,0) e **não é
desfeita** por `.fluxo{...:minmax(0,1fr)}` dentro da media query, que vale
(0,1,0). No celular a faixa de duas matérias ficava em duas colunas de 190px.
Precisa ser desfeita com a mesma especificidade, dentro da media query.

**Como conferir sem depender de olho:** `mede_grade.py` no scratchpad lê pelo
CDP a largura de cada cartão, o tamanho de cada imagem e o topo do texto de cada
coluna. Um conjunto com mais de um valor por faixa é desalinhamento. Ver
[[conferir-por-captura-usar-cache-busting]] e [[cartao-sem-foto-e-defeito]].

---
name: linha-fina-repete-paragrafo-do-corpo
description: Metade do acervo da rede tem dek copiado de um parágrafo do corpo; apagar o campo não serve, porque o cartão usa o mesmo campo
metadata:
  type: project
---

A importação gravou o `dek` copiando um parágrafo do corpo. Na página do artigo o
leitor lê a mesma frase duas vezes seguidas, uma como linha fina e outra logo
abaixo. Medido em 23/08/2026: **7.851 artigos na opengravity, 6.556 na hostinger
e 1.643 na clinicas-vps**, e nem sempre o parágrafo 1 — no diariopernambucano
eram 143 do parágrafo 2, 90 do 1, 61 do 3 e 50 do 4.

**Why:** ⚠️ **não dá para apagar o campo no dado.** As 18 arquiteturas que usam
`a.dek` o usam **também no cartão** da home e da listagem, e o próprio motor
avisa que "cartão sem resumo fica só com o título, e desalinha da fileira
vizinha". Apagar deixaria a rede inteira com cartão pelado.

**How to apply:** a decisão mora no render, e vale para as 38 arquiteturas de uma
vez. O artigo recebe uma **cópia** do objeto com a linha fina vazia; o cartão
continua recebendo o original:

```js
function _semDekRepetido(art) {
  return _dekRepetido(art) ? Object.assign({}, art, { dek: '' }) : art;
}
// em _raw_articleHtml:
getArch(ctx.fp.arch).article(ctx, _semDekRepetido(art), menu, related, buildP(ctx, art))
```

A comparação é por texto achatado, sem tag, sem acento e sem pontuação: a cópia
veio do corpo com marcação no meio, então comparar o texto cru não casa. 90
caracteres bastam, e abaixo de 40 nem se testa.

**A meta description não é afetada**: ela sai de `excerpt`, que é campo separado.
Ver [[linha-fina-nao-pode-repetir-a-abertura]] e [[regua-de-meta-description-escapada]].

Aplicado nas três máquinas em 23/08/2026, com reconstrução completa.

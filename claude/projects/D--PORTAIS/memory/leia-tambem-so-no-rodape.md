---
name: leia-tambem-so-no-rodape
description: "Ordem de 14/09/2026: o motor não injeta mais 'Leia também' no meio do corpo; só o bloco do rodapé, com no máximo 2 links. O bloco do meio entrava antes do link do cliente nos guest posts"
metadata:
  type: feedback
---

Em 14/09/2026 o Anderson viu no diariopernambucano um `<aside class="pe-leia-meio">`
com três links internos antes do 3º `<h2>`, ou seja, **antes do link do
cliente** num guest post. Ordem: "Deve ser injetado somente no final. Não
precisa de mais do que dois internos."

**Why:** o link pago tem que ser o primeiro link editorial do corpo; qualquer
bloco de navegação antes dele dilui o que o cliente comprou. E dois internos
bastam.

**How to apply:** em `articleHtml` do `render.js` (as 3 máquinas) ficou
`const doMeio = []; const doRodape = rel.slice(0, 2);` com backup
`.bak-2026-09-14-leiameio`. `_leiaTambemNoMeio` continua no arquivo, sem uso.
O bloco era montado no render, então pagina antiga só perde o aside com
rebuild: os 105 portais foram reconstruídos em 14/09 (`/var/log/rebuild-leiameio.log`).
O fallback do `autoLinkContent` ("Veja também: ... e ...") anexa no FIM do
conteúdo e pode ficar. Ao portar ou reinstalar o motor, conferir que o patch
não voltou. Ver [[leia-tambem-concentra-ancora]] e [[arch-local-e-fonte-unica]].

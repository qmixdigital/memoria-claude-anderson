---
name: atualizar-arch-ja-instalada
description: O deploy_a*.py só sabe inserir arquitetura nova; para corrigir uma que já está no ar existe o atualiza_arch.py
metadata:
  type: project
---

`deploy_a<letra>.py` **insere** um bloco novo antes de `const ARCHS` e acrescenta
a linha da tabela. Ele aborta se a letra já existir, então não serve para
corrigir uma arquitetura que já foi ao ar.

**Why:** sem uma ferramenta para isso, o conserto vira recorte à mão no
`archs.js`, que é exatamente o gesto que já apagou a arquitetura vizinha nesta
rede. Ver [[deploy-de-arch-nao-cortar-vizinha]].

**How to apply:** `python3 /tmp/atualiza_arch.py <LETRA> <prefixo>`, com o
arquivo novo em `/tmp/<LETRA>.js`. As duas pontas do recorte são explícitas:

- início: `/*` imediatamente antes de ` * Arquitetura XX, arquetipo`
- fim: o `/*` da arquitetura **seguinte**, ou `const ARCHS` se for a última

Confere três coisas antes de gravar: a contagem de `function *Css(` não pode
mudar, a linha da tabela tem que continuar apontando para o próprio prefixo
(`css: <pre>Css`), e o arquivo tem que carregar no node depois. Faz backup em
`.bal-<prefixo>-<data>`.

Depois de trocar: `systemctl restart portal-engine` e reconstruir **os portais
que usam aquela letra**, senão o HTML no disco continua o antigo. Ver
[[reiniciar-motor-depois-de-editar]] e [[arch-local-e-fonte-unica]].

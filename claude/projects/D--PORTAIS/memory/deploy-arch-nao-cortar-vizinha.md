---
name: deploy-arch-nao-cortar-vizinha
description: O script de deploy de arquitetura apagava a arquitetura instalada depois dela
metadata:
  type: project
---

Os `deploy-arch-*.js` removiam a versão anterior cortando de
`/* ===== ARCH X` até `const ARCHS = {`. Isso funciona **enquanto aquela for a
última arquitetura**. Assim que existe uma posterior, o corte leva a vizinha
junto e o `archs.js` quebra com `ReferenceError: yCss is not defined`.

Aconteceu em 16/08/2026: o deploy da X apagou a Y.

**Correção aplicada** nos dois scripts: o fim do corte passa a ser a **próxima
arquitetura**, e só cai no `const ARCHS = {` se não houver nenhuma depois:

```js
const prox = a.indexOf('/* ===================== ARCH ', ini + 10);
const mapa = a.indexOf('const ARCHS = {');
const fim = (prox >= 0 && prox < mapa) ? prox : mapa;
```

Ao criar o deploy da próxima letra, copiar já com essa correção.

**Como recuperar quando quebra:** os backups ficam ao lado, como
`archs.js.bak-antes-<LETRA>-<timestamp>`. Testar cada um com `node --check`
**copiando antes para `.js`**, porque o Node recusa a extensão `.bak-*`.

Relacionado: [[arch-local-e-fonte-unica]], [[motor-duas-funcoes-de-hash]]

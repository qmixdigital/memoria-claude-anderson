---
name: cria-arch-sobrescreve-a-vizinha
description: O script que cria arquitetura nova carrega o par de caminhos do anterior e grava por cima da arch pronta
metadata:
  type: project
---

O `cria_<letra>.py` tem duas constantes: `O`, a arquitetura de origem, e `N`, a
que vai ser escrita. Copiado do anterior sem trocar **as duas**, ele leu a AR e
**gravou por cima da AS**, apagando a arquitetura recém-terminada.

O que salvou foi a cópia já instalada no `archs.js` do servidor: o bloco da AS
foi extraído de lá (do cabeçalho `* Arquitetura AS` até `const ARCHS`) e
devolvido ao arquivo local.

**Why:** as substituições internas (`ar` → `as`) foram trocadas, o que dá a
impressão de que o script está adaptado, mas o par O/N passa despercebido porque
mora no topo, longe dos regex.

**How to apply:** depois de rodar, conferir que o arquivo NOVO existe e que o
antigo **não mudou de tamanho**. E lembrar que a arch instalada no servidor é a
cópia de segurança do trabalho local.

Ver [[arch-local-e-fonte-unica]], [[deploy-de-arch-aponta-para-a-vizinha]] e
[[atualizar-arch-ja-instalada]].

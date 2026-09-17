---
name: gerador-grava-por-cima-do-anterior
description: O caminho de SAÍDA do script gerador fica do portal anterior e sobrescreve o arquivo dele
metadata:
  type: feedback
---

Os scripts `faz_*.py` e `cria_*.py` leem o do portal anterior e gravam o novo.
Copiado sem trocar **o caminho de saída**, o gerador reescreve o arquivo do
portal anterior com o conteúdo do novo — e imprime "escrito e válido".

Aconteceu duas vezes no mesmo dia: o `cria_at.py` gravou por cima da **AS.js**
recém-terminada, e o `faz_importa_sab.py` gravou por cima do **importa_pub.py**.

**Why:** as substituições internas de nome são as que chamam atenção, e o par
leitura/escrita mora no topo, longe delas. O `print` final não distingue.

**How to apply:** depois de rodar um gerador, conferir que o arquivo NOVO existe
**e que o antigo não mudou de data/tamanho**. Para arquitetura, a cópia instalada
no `archs.js` do servidor é a salvação: dá para extrair o bloco de volta.

Ver [[cria-arch-sobrescreve-a-vizinha]] e [[script-copiado-carrega-o-portal-anterior]].

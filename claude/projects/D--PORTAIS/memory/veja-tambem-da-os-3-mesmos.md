---
name: veja-tambem-da-os-3-mesmos
description: O bloco de relacionados do motor é uma fatia da editoria, então toda a editoria aponta para os 3 mesmos artigos; agora aceita lista curada
metadata:
  type: project
---

`rebuildIndexes` montava o "Veja também" assim:

    arts.filter(x => x.category.slug === acs).slice(0, 3)

`arts` está ordenado por data, então **todos os artigos de uma editoria recebem
os TRÊS MESMOS destinos**. No seuguiadesaude, os 176 artigos de Medicamentos
apontavam para os mesmos 3, e os outros 173 não recebiam nada. O bloco ocupava
espaço na página, concentrava âncora e não ligava o acervo a lugar nenhum.

O motor passou a aceitar **`related`** no JSON do artigo, uma lista de slugs.
Quando existe, é ela que vale; quando não existe, o comportamento é o de antes,
então os outros 33 portais da máquina não mudaram. São **dois pontos de
chamada**, o do rebuild completo e o do publish de um artigo só: corrigir um e
esquecer o outro faz o artigo publicado pela plataforma sair diferente dele
mesmo depois do rebuild seguinte.

**How to apply:** calcular `related` por TF-IDF com **teto de entrada por
destino**. Semelhança pura cria artigos-ímã que entram na lista de todo mundo e
uma cauda que não entra na de ninguém; o teto é o que elimina o órfão. Ver
[[leia-tambem-concentra-ancora]] e [[malha-de-acervo-nao-sai-de-mencao]].

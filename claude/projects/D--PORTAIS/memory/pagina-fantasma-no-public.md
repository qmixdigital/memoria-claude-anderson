---
name: pagina-fantasma-no-public
description: Artigo apagado do data/ deixa a pasta no public/ servindo HTML velho, e nenhuma auditoria vê
metadata:
  type: project
---

O rebuild **não remove pasta que ele não gera mais**. Apagar o artigo do `data/`
não apaga `public/<slug>/`: a página continua no ar com o HTML da última
renderização, que pode ter meses.

Foi assim que apareceram **53 páginas com a trilha "Início ›"** na clinicas-vps,
um defeito de âncora genérica corrigido no motor semanas antes: aquelas páginas
simplesmente não passam mais pelo motor.

**Why:** o sitemap também não as lista, então nem a auditoria de sitemap nem a de
link interno as enxergam. Elas só aparecem varrendo o `public/` e comparando com
o `data/`.

**How to apply:** `pagina_fantasma.py` compara os dois lados. Ficam de fora, por
serem legítimas: home, 404, busca, mapa do site, institucionais, páginas de
autor, `extraPages` e as listagens de editoria.

⚠️ A listagem de editoria vazia é o mesmo defeito com outra cara, e tem script
próprio (`listagem_velha.py`): quando a última matéria de uma editoria sai, a
página `/categoria/<slug>/` fica no ar com os cartões antigos.

Ver [[apagar-artigo-nao-basta-apagar-o-arquivo]], [[editoria-vazia-deixa-listagem-velha]]
e [[breadcrumb-ancora-generica]].

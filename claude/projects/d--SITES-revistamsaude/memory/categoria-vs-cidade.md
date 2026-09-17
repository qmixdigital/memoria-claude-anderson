---
name: categoria-vs-cidade
description: "A rota /categoria/[slug] serve dois campos diferentes — mudar `categoria` não tira a matéria da listagem da cidade"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7df468e7-687e-4601-a16f-031faa972e2e
  modified: 2026-08-11T19:29:09.167Z
---

Em `src/app/(frontend)/categoria/[slug]/page.tsx` a mesma rota atende **dois campos distintos** da coleção `materias`:

- slug em `['goiania','anapolis','rio-verde']` → filtra por **`cidade`** (select obrigatório, só essas 3 opções)
- qualquer outro slug → busca na coleção `categorias` e filtra por **`categoria`** (relationship, single)

**Consequência prática:** as ~487 matérias com `categoria = "Goiânia"` têm essa categoria **redundante** com o campo `cidade`. Reclassificar `categoria` de "Goiânia" para "Dicas"/"Saúde"/"Blog e Notícias" **não remove** a matéria de `/categoria/goiania` — ela continua entrando pelo `cidade`. O único efeito visível é o badge do card e a entrada na listagem temática. Verificado empiricamente: total de goiania seguiu 581 depois de mover 21 matérias.

Reclassificar matéria que está em "Saúde"/"Dicas" **é** destrutivo (sai da listagem de origem), porque aí a categoria não é redundante.

**Onde o Anderson tropeça:** ele procura "categoria" no campo **Cidade** da sidebar do admin (que só tem as 3 cidades) e conclui que não existe categoria não-geográfica. As categorias temáticas ficam no campo **Categoria**, logo abaixo. Ver [[publicar-materia-via-sql]].

---
name: qmix-multicategoria
description: "Marketplace qmix-next agora suporta MÚLTIPLAS categorias (nicho) por portal, não só uma"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-09-02T17:00:58.433Z
---

Desde 2026-09-02 o catálogo qmix-next suporta **múltiplas categorias por produto** (antes era 1 por produto).

- Dados: `produtos_nicho` já aceitava várias linhas por `parent_id`; agora usamos isso de fato. A **primeira** (menor `order`) é a "primária" e vira o badge de exibição; todas contam pra busca.
- **API** `src/app/api/produtos/route.ts`: retorna `nicho` (primária, p/ badge) **e** `nichos: string[]` (todas). Antes o `nichoMap` sobrescrevia e guardava só a última.
- **Filtro** `MarketplaceFilters.tsx`: `ProdutoView.nichos?: string[]`; o filtro de categoria usa `nichos.includes(cat)` (retrocompatível: cai pra `[nicho]` se `nichos` ausente). Busca por uma categoria mostra o portal se ele cobrir aquele tema.
- **Tag em massa dos generalistas (152):** rastreei menu/seções/headings de cada um e atribuí as categorias que cobre (fortes: 2+ menções, cap 3) + `generalista` como base. Média final ~3,5 cat/site nos generalistas.
- **LIMITAÇÃO conhecida:** o editor de produto no admin (`ProdutoForm`/`[id]/page.tsx`) ainda salva **uma** categoria (select único) — se editar um produto por lá, colapsa pras uma. Falta transformar em multi-select. As 11 categorias válidas: noticias, tecnologia, saude, esportes, financas, negocios, energia, educacao, entretenimento, lifestyle, generalista.
- Contexto de curadoria geo/nicho: a maioria dos "nacional" é nacional de verdade (temáticos/generalistas), poucos são de cidade. Ver [[portais-url-raiz]].

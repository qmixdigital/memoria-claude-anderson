---
name: feedback-nao-engolir-erro-db
description: Nunca usar catch que devolve lista vazia ou numero fixo em consulta de banco nos dois diretorios; vira 404 e sitemap truncado gravados no build
metadata:
  type: feedback
---

Nos dois sites Next.js, `try { ...query... } catch { return [] }` e
`catch { return 480 }` causaram estrago silencioso, descoberto em 07/09/2026:

- `src/lib/caps.ts` (site de SP): 295 paginas de cidade renderizam em paralelo
  no build e cada uma disparava a mesma varredura. O pool do postgres saturava,
  a query falhava, o catch devolvia `[]`, a pagina chamava `notFound()` e o
  **404 ficava gravado no build**. 54 de 295 paginas nasceram mortas com os
  dados existindo no banco.
- `src/app/sitemap.ts` (site de SP): sem `export const dynamic = "force-dynamic"`
  o sitemap era prerenderizado no build; com os catches por bloco, foi ao ar com
  **22 URLs em vez de 1.753**. Cidades, fichas, blog e CAPS sumiram do indice
  sem nenhum erro visivel.
- `src/app/(public)/page.tsx`: `return result?.count || 480` colocava o numero
  480, inventado no codigo, no H1 da home enquanto o `<title>` mostrava 990.

**Why:** falha transitoria de banco vira conteudo errado permanente, e o build
nao acusa nada. Numero inventado e pior que numero ausente.

**How to apply:** em consulta que alimenta pagina indexavel, tentar de novo
(3 a 5 vezes com backoff) e **propagar o erro**. Falhar alto e melhor que
publicar pagina morta. Quando varias paginas fazem a mesma consulta no build,
compartilhar UMA promessa em escopo de modulo com TTL que cubra o build inteiro
(600s), porque o `cache()` do React so deduplica dentro de uma requisicao.
Sitemap sempre com `force-dynamic`. Ver [[project_diretorio_clinicas]].

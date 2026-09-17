---
name: publicar-materia-via-sql
description: "Como criar matéria + imagem de destaque na VPS — a API local do Payload não carrega, use pg + sharp"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7df468e7-687e-4601-a16f-031faa972e2e
  modified: 2026-08-11T19:29:25.574Z
---

**A API local do Payload não roda em script nesta VPS.** Tentativas que falham (ago/2026, payload 3.78):

- `npx payload run script.ts` com `import config from '@payload-config'` → `ERR_INVALID_MODULE_SPECIFIER` (o `tsImport` do tsx não aplica os `paths` do tsconfig; `TSX_TSCONFIG_PATH` não resolve)
- import relativo `'../src/payload.config.ts'` → falha nos imports extensionless de dentro do config (`./collections/Users`)
- `npx tsx --env-file=.env` → `Cannot destructure loadEnvConfig` no `payload/dist/bin/loadEnv.js`
- REST `/api/users/login` → não sei a senha de nenhum dos 3 admins

**O que funciona:** script `.mjs` com `pg` + `sharp`, rodado de dentro de `/var/www/revistamsaude` via `node --env-file=.env scripts/x.mjs`. O schema é simples — relacionamentos são FK diretas (`categoria_id`, `imagem_destaque_id`), sem tabela `_rels`; só `materias_tags` é tabela à parte (`_order`, `_parent_id`, `id` varchar aleatório, `tag`).

**Imagem de destaque manualmente:** copiar o original para `/var/www/revistamsaude/media/`, gerar as variantes com sharp `fit:'cover', position:'centre'` nos tamanhos de `Media.ts` (thumbnail 480x320, card 960x640, hero 1920x1080), **pulando** os maiores que a origem (é o que o Payload faz — por isso tantas linhas têm `sizes_hero_*` nulo). Preencher `media.url` e `sizes_*_url` como `/api/media/file/<filename>`, `focal_x/y = 50`.

Sempre: transação com BEGIN/ROLLBACK, backup do estado anterior em `/root/`, e assertions (contagem de nós, ausência de mojibake `Ã`, nº de links) antes do UPDATE. Depois, revalidar nas **duas** instâncias — ver [[editar-conteudo-materia]] e [[deploy-workflow]].

O corpo é Lexical JSON e **não pode conter H1** (a página já renderiza `titulo` como `<h1>` e `resumo` como subtítulo). Ver [[categoria-vs-cidade]] para escolher a categoria.

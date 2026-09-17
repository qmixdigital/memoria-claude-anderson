---
name: editar-conteudo-materia
description: Como editar o conteúdo/SEO de uma matéria (Lexical JSON no Postgres) para ajustes de SEO
metadata: 
  node_type: memory
  type: project
  originSessionId: 83b06f82-5a45-4a34-ab7e-948b3a416370
---

O corpo das matérias é **Lexical JSON** na coluna `materias.conteudo` (JSONB) do Postgres local na VPS. Headings/links/listas são nós dessa árvore. SEO fica em `materias.seo_meta_title`, `seo_meta_description`, `resumo`.

**Para editar (ajustar H2/H3, cross-links, links externos, SEO):** rodar um script Node com `pg` **de dentro de `/var/www/revistamsaude`** (senão não acha `node_modules`), com `node --env-file=.env script.mjs`. Sempre **backup do conteudo antes** e **assertions** (abortar se a estrutura não bater) — JSON corrompido quebra o render.

**Formato dos nós (Payload lexical):**
- heading: `{type:'heading',tag:'h2',children:[textNode],direction:'ltr',format:'',indent:0,version:1}`
- link: `{type:'link',version:3,fields:{linkType:'custom',url,newTab},children:[textNode],direction:'ltr',format:'',indent:0}` — externo `newTab:true` (render vira `target=_blank rel=noopener`); interno usa URL relativa `/...`
- list: `{type:'list',listType:'bullet',tag:'ul',start:1,children:[listitem...]}`, listitem `{type:'listitem',value:N,children:[textNode]}`
- text: `{type:'text',text,version:1,format:0,mode:'normal',style:'',detail:0}`

**Para linkar uma frase:** achar o text node, `indexOf(frase)`, split em before/link/after.

**Após UPDATE via SQL (bypassa hooks do Payload):** revalidar. Ou `POST /api/revalidate` com header `x-revalidate-secret: <PAYLOAD_SECRET do .env>` e body `{"collection":"materias","doc":{"slug":"..."}}`, ou esperar o ISR de 60s. Atenção às **2 instâncias PM2**: o public via nginx pode servir cache velho numa request (stale-while-revalidate) — pra confirmar render, testar `127.0.0.1:3004` e `:3008` direto com warm-up. Ver [[isr-revalidate-fichas]] e [[deploy-workflow]].

Regras de SEO/linkagem do projeto: ver CLAUDE.md (âncora com keyword, 1× por destino, variações, nunca "clique aqui").

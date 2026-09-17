---
name: reference-publicar-revistamsaude-medicinageriatrica
description: Como publicar guest post no revistamsaude (Payload) e no medicinageriatrica (Next), incluindo a armadilha do ISR de 1 hora
metadata:
  type: reference
---

Dois destinos de saude da rede que NAO sao portal-engine.

**revistamsaude.com.br** (Payload + Postgres, opengravity, `/var/www/revistamsaude`).
Publicar com `node --env-file=.env scripts/pub_coe.mjs /tmp/spec.json`. O spec e um
JSON com `titulo, slug, resumo, categoria (slug), imagem (caminho de arquivo local
no servidor), alt, seoTitle, seoDesc, tags[], blocos[]`. Os blocos viram richText
Lexical e aceitam `{"t":"p","c":[...]}` (a lista pode misturar string e
`{"texto","url","novaAba"}` para link), `h2`, `h3`, `ul`, `ol`. **Nao existe bloco
de tabela** - converter tabela em `ul`. Categorias: goiania, anapolis, rio-verde,
mais-social, blog-noticias, saude, dicas. A coluna de nome da categoria e `nome`,
nao `titulo`.

Revalidar depois: `POST /api/revalidate` com header `x-revalidate-secret` =
**PAYLOAD_SECRET** (nao REVALIDATE_SECRET) **e corpo JSON**
`{"collection":"materias","doc":{"slug":"..."}}` - sem corpo devolve 400. Rodar nas
DUAS instancias (3004 e 3008); se uma nao pegar, `pm2 reload revistamsaude-b`.

**medicinageriatrica.com.br** (Next + Postgres, srv1166087, `/var/www/medicinageriatrica`).
Receptor `POST http://127.0.0.1:3150/api/qmix/noticias/` com header `X-API-KEY`
lido de `.env.production` (`QMIX_API_KEY`, 64 chars). Corpo: `titulo, conteudo
(HTML), slug, excerpt, featured_image` (data URI base64), `featured_image_alt`,
`categories` por **wp_term_id**: 2 cancer, 3 nutricao, 4 doencas, 6 envelhecimento,
7 dicas, 16 parkinson, 17 alzheimer, 21 exames, 22 medicamentos. Responde
`{"id":...,"slug":...,"com_imagem":true}`.

**Armadilha:** passar acento por heredoc de ssh corrompe o titulo. Publicar sem
acento e corrigir depois com UPDATE no banco (`PGPASSWORD=... psql -U
medicinageriatrica_user -d medicinageriatrica_db`), ou transferir o JSON por base64.

**ISR de 1 hora:** todas as listagens e os quatro sitemaps do medicinageriatrica
tem `export const revalidate = 3600` e o app **nao tem rota de revalidacao**. O
artigo responde 200 na hora, mas so aparece na home, na categoria e no sitemap ate
1 hora depois. Nao adianta `pm2 reload` nem purgar o Cloudflare; nao e defeito.
Relacionado: [[reference_portal_engine_pub_sem_rebuild]].

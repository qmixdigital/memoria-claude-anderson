---
name: reference_cirurgiacoracao_publicar
description: "Publicar no diretório Next cirurgiacoracao: rota wp-json/sistema-qmix, porta só no ecosystem.config.js, aceita image_base64, ignora slug e o artigo NASCE COMO DRAFT"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-25T14:43:15.206Z
---

O receptor do `cirurgiacoracao.com.br` (srv1166087, `/var/www/cirurgiacoracao`)
é diferente do `cirurgiadecancer` em quase tudo. Levantado em 25/08/2026:

- **Rota:** `POST /api/wp-json/sistema-qmix/v1/artigos` (sem barra final),
  header `x-api-key` com `QMIX_API_KEY` do `.env` do app.
- **Porta 3032** (`-web`) e **3033** (`-web-b`). `pm2 describe` **não mostra a
  porta**: o script é `npm start` e o valor está em `env.PORT` do
  `ecosystem.config.js`. Procurar `start -p` ali não encontra nada.
- **Aceita `image_base64`** (data URI) e converte para **AVIF** com sharp,
  gravando em `UPLOADS_DIR` (`/var/www/cirurgiacoracao-shared/public-uploads/blog`),
  servido pelo nginx em `/uploads/blog/`. O `cirurgiadecancer`, ao contrário,
  só aceita URL — ver [[reference_cirurgiadecancer_publicar_direto]].
- **Ignora slug enviado:** ele é gerado de `slugify(title)` com sufixo se
  houver colisão. O nome do arquivo da imagem sai do slug.
- **O artigo nasce como `draft`.** Sem `UPDATE blog_posts SET status='published',
  published_at=now()` ele não aparece no site e nada avisa.
- **`excerpt` e `meta_description` são gerados** dos 155 primeiros caracteres do
  texto limpo, e `meta_title` é o título truncado em 57 + "...". Para SEO
  decente, reescrever os três no banco depois do POST.
- **`autoLinkContent` acrescenta um link para `/estados`** no fim do conteúdo.
  Não atrapalha a regra do link do cliente vir primeiro, mas conta na contagem.

Depois de qualquer alteração: `pm2 reload cirurgiacoracao-web` e
`cirurgiacoracao-web-b`, um de cada vez, e `cf_purge.py cirurgiacoracao.com.br`.

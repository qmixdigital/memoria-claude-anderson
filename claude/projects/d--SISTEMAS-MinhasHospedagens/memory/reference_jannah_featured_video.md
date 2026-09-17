---
name: reference_jannah_featured_video
description: Como setar vídeo de destaque (featured video) em posts do tema Jannah/TieLabs via wp-cli
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

Tema Jannah (TieLabs) suporta vídeo no lugar da imagem destacada **no single post**. `tie_get_postdata()` lê meta direto via `get_post_meta($id,$key,true)`. Para ativar vídeo self-hosted (MP4) num post:

```
wp post meta update <PID> tie_post_head video
wp post meta update <PID> tie_video_self "<URL_DO_MP4>"
wp post meta delete <PID> tie_video_url        # garante que usa o self-hosted
```

Para YouTube/Vimeo: setar `tie_video_url` em vez de `tie_video_self` (o código prefere tie_video_url; cai pra tie_video_self se vazio). `tie_post_head=video` é o gatilho.

**SEMPRE manter a imagem destacada (`_thumbnail_id`)** — vídeo só substitui no single; a imagem segue sendo poster do player, `og:image` (social NÃO renderiza vídeo), thumb de home/arquivo/relacionados.

Fluxo MP4: subir via `base64 -w0 arquivo | ssh host "base64 -d > /tmp/x.mp4"` (stdin, evita ARG_MAX; arquivos de MBs), `chown` pro owner do site, `wp media import --post_id=<PID> --title=...` (SEM --featured_image), pegar guid, setar as metas, purgar Cloudflare. Render confirmado por `<video class="wp-video-shortcode">` no HTML. Blog/servidor/token CF: ver [[reference_blog_cirurgiadojoelho_location_cf]]. Para imagens (não vídeo): [[feedback_imagem_alt_igual_nome_arquivo]].

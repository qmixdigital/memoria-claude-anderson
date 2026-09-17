---
name: favicon-webp-quebrado-blog
description: Uploads do blog foram convertidos em massa para WebP e os PNG originais apagados — quebra site_icon e qualquer URL .png/.jpg antiga
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a670a00-268d-4459-8229-64d391a54505
  modified: 2026-07-30T19:21:37.505Z
---

Em algum momento (abr/2026) os uploads do `blog.coegoiania.com.br` foram convertidos em massa para **WebP e os originais apagados** (5210 `.webp` vs 12 `.png` em `wp-content/uploads`). O plugin que fez isso **não está mais instalado**.

Consequência: metadados de anexos antigos (`_wp_attachment_metadata`) continuam apontando para `.png`/`.jpg` que não existem mais → 404 → o WP faz **301 para a home** (não 404 limpo), o que engana no diagnóstico.

Foi isso que quebrou o **favicon no Google** (jul/2026): as tags `<link rel="icon">` apontavam para `cropped-favicon-*.png` inexistentes. Corrigido regerando os PNG a partir dos WebP via GD e realinhando `_wp_attached_file`/`guid`/`post_mime_type` do anexo 1018.

**Por que importa:** o Google **não aceita WebP como favicon** (só ICO/PNG/GIF/JPEG/SVG) — não adianta repontar o site_icon para o `.webp`.

**Como aplicar:** se aparecer outra imagem quebrada no blog, checar primeiro se existe só a versão `.webp` no disco; a solução é regerar o formato original, não trocar a URL. Relacionado: [[blog-wordpress-hospedagem]]

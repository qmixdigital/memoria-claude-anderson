---
name: bytx-cache-immutable
description: No bytx.com.br (Cloudflare Pages) toda mudança em styles.css ou script.js exige subir o ?v= nas quatro páginas HTML
metadata: 
  node_type: memory
  type: project
  originSessionId: 3dae856f-b343-4742-b80b-4697bbefd514
  modified: 2026-09-13T07:57:04.864Z
---

O `_headers` do bytx.com.br chegou a marcar `/styles.css` e `/script.js` como `max-age=31536000, immutable` com nome de arquivo fixo. Em 06/09/2026 um redesign inteiro foi ao ar com HTML novo e CSS velho ("tudo quebrado"), porque nem a borda da Cloudflare nem o navegador dos visitantes buscavam o arquivo novo. Purge da Cloudflare não resolve o lado do navegador.

**Why:** `immutable` só é seguro quando a URL muda a cada versão. Com nome fixo, ele congela o arquivo por um ano.

**How to apply:** A cada alteração em `styles.css` ou `script.js`, trocar o `?v=AAAAMMDD` nas quatro páginas (`index.html`, `404.html`, `politica-de-privacidade.html`, `termos-de-uso.html`). O `_headers` agora usa `max-age=3600, must-revalidate` nesses dois arquivos como rede de segurança, mas o `?v=` continua sendo o que faz a mudança valer na hora. Ver [[bytx-nao-expor-dominios]].

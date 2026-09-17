---
name: link-seo-precisa-nascer-no-servidor
description: Link que só é montado por componente client em useEffect não passa link equity nem aparece no crawl
metadata:
  type: feedback
---

Link que precisa valer para SEO tem que nascer no HTML servido. Componente
`"use client"` que decide o href dentro de `useEffect` (geo-IP, fetch de API,
preferência do usuário) serve o fallback genérico no HTML e o link real só
existe depois do mount.

**Why:** no geladeirastop.com o `<DirectoryBridge>` personalizava o destino pela
cidade do leitor via `fetch("/api/geo")`. Parecia que os artigos linkavam para as
páginas de cidade, mas o HTML servido trazia sempre `href="/empresas/"`. Medido
por crawl: zero links dos 217 artigos para as 3.553 páginas de cidade, ou seja, o
lado com autoridade não passava nada para o lado que monetiza.

**How to apply:** ao auditar linkagem interna, medir sempre no **HTML renderizado
pelo servidor** (curl na origem), nunca lendo só o JSX ou o corpo do post. Se o
componente personalizado for útil para o usuário, mantenha, mas acrescente um
bloco server-side com os mesmos destinos. Ver também
[[deploy-next-pm2-par-compartilha-next]].

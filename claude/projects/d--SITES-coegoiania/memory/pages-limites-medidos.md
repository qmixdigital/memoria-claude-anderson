---
name: pages-limites-medidos
description: Limites praticos do Cloudflare Pages e do export estatico do Next 16 medidos na migracao do COE (19/09/2026)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4a670a00-268d-4459-8229-64d391a54505
  modified: 2026-09-19T10:25:19.462Z
---

Medido em 19/09/2026 no projeto `coegoiania` (Cloudflare Pages + Next 16 `output: 'export'`):

- **`_redirects` aceita um único splat por regra**: `/blog/categoria/*/page/*` é ignorado em silêncio
  (dá 404). Dois curingas só na Function ou nas Redirect Rules da zona (`wildcard_replace` aceita `${1}` e `${2}`).
- Splat carrega a barra final: `/blog/page/3/` → `/blog/pagina/3/` → 308 → `/blog/pagina/3` (2 saltos).
  Quando o fluxo principal vem da zona, a regra da zona já entrega sem barra em 1 salto.
- Next 16 export gera **~8 arquivos por rota** (HTML + `.txt` de segmentos RSC): 966 páginas = 9.919 arquivos
  e 231 MB em `out/`. Limite do Pages é 20.000 arquivos por deploy; o build no Pages levou 42 s + deploy ~3 min.
- HTML de post fica ~95 KB porque o corpo vai duplicado no payload RSC inline; comprime bem, é inerente ao App Router.
- `app/sitemap.ts` e route handlers (`busca-index.json/route.ts`) precisam de `export const dynamic = 'force-static'`.
- O header fixo do COE tem 78px (desktop), 103px (769-1024px) e 68px (mobile); conteúdo de página nova precisa
  desse `padding-top` ou o topo fica escondido (as páginas de procedimento já vivem com o breadcrumb escondido).

**Como aplicar:** ao mexer em redirects do COE, editar `redirects.json`/gerador e rodar
`python _migracao/gerar-redirects.py`; testar sempre com `curl -s -o /dev/null -w "%{http_code} %{redirect_url}"`
sem seguir redirect. Relacionado: [[migracao-cloudflare-pages]]

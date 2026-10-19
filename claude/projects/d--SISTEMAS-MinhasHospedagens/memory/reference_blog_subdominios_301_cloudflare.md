---
name: blog-subdominios-301-cloudflare
description: "Blogs antigos em subdomínio (blog.X) voltaram como 301 para X/blog/<slug> via Cloudflare (AAAA 100:: proxied + regra); feito em 18/10/2026"
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T18:51:38.500Z
---

Os blogs WordPress antigos dos clientes viraram `/blog/` nos sites novos, mas alguns subdomínios `blog.` ficaram sem DNS e perderam o tráfego indexado. Em 18/10/2026 criei, em cada zona, um registro `AAAA blog → 100::` proxied (host só de redirecionamento) e regras 301 em `http_request_dynamic_redirect`, nesta ordem: URL com data `/AAAA/MM/DD/slug/` → `/blog/slug/` (só drbrunoair); categorias, tag, page e author → `/blog/`; o resto → `concat("https://X/blog", path)`.

Feito para blog.cirurgiadecolunagoiania.com.br (100% das impressões em página viva), blog.drbrunoair.com.br (99%), blog.clinicasrecuperacaosaopaulo.com (99%) e blog.qmix.com.br (78%, com 7 regras de slug específico antes da genérica; os 3 posts maiores, "textos de agradecimento ao cliente pela compra" 52 mil impressões, "afiliado mercado livre" 35 mil e "o que é release" 20 mil, NÃO existem no qmix.com.br novo). Também `goiania.arcondicionadotop.com` → home. Os blogs do joelho e do henrique bufaical já tinham 301.

**How to apply:** antes de criar o 301, testar cada URL do GSC no destino candidato (`gsc_keep.py` + checagem 200). Subdomínio de 2º nível (`www.blog.X`) não é coberto pelo certificado gratuito, então não fazer. IDs criados em `D:/SISTEMAS/cloudflare/blog_301_criados_20261018*.json`.

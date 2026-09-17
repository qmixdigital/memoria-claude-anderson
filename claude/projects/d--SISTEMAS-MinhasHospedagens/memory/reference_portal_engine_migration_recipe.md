---
name: reference_portal_engine_migration_recipe
description: "Flags por-site e passos de SEO ao migrar WP -> portal-engine (preservar URLs, esconder placeholders, editorias)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 611c5219-ea2f-4933-b1d7-762f552ee8c8
---

Ao migrar um site WP da hostverde para o portal-engine ([[reference_portal_engine_html]]), bakear estas configs por-site em `/opt/portal-engine/sites.json` para NÃO quebrar SEO e ficar profissional:

- **`flatUrl: true`** — artigos em `/slug/` (igual permalink WP `%postname%`), não `/categoria/slug/`. Sem isso, TODAS as URLs indexadas no Google dão 404.
- **301 das categorias antigas** no vhost Nginx (`/etc/nginx/conf.d/portal-<slug>.conf`): regra genérica `location ~ ^/categoria/(.+)$ { absolute_redirect off; return 301 /$1; }` + `location =` exatas para slugs de categoria que foram renomeados/aposentados. `absolute_redirect off` preserva https (sem hop extra no Cloudflare). Cloudflare das home destes portais é `DYNAMIC` (não cacheia HTML), origem é 31.97.173.40 — testar com `curl -H "Host: dominio" http://31.97.173.40/`.
- **`tagline`** — texto do topbar (default genérico "Notícias em tempo real"; trocar pelo nicho do site).
- **`latestLabel`** — rótulo do rail de recentes (default "Últimas"; usar "Últimos artigos" em sites que não são portal de notícias).
- **`logoSvg`** — SVG inline do logo (arch D `dHeader` renderiza antes do wordmark quando presente). Evita texto genérico.
- **`homeDeprioritizeCats: ["saude"]`** — categorias catch-all/off-topic descem pro fim da home (hero + nav + seções), mantendo data desc dentro do grupo. Garante hero on-brand.
- **`placeholder: true`** no JSON de artigos sem imagem real — a home esconde estes (filtro em `rebuildIndexes`); detectável por dimensão 1200×675 (gradiente gerado). Reais são ≤1000 de largura.
- **Re-categorização**: como flatUrl torna a URL do artigo independente da categoria, dá pra reorganizar editorias livremente (rodar `classify()` por keyword no título, setar `category`/`categories`/`catLock`), só precisa 301 dos slugs de categoria aposentados. Home mostra até 6 blocos de categoria com ≥2 posts (arch D `dHome`).

**Recepção do Sistema Antônio (CRÍTICO p/ conteúdo continuar chegando):**
- O receptor (`receiver.js`, systemd `portal-engine.service`, 127.0.0.1:8791) identifica o site pela **`X-API-KEY`**, NÃO pela URL. Qualquer rota terminada em `/artigos` é aceita; o vhost já proxia `~ /[a-z0-9_-]+/v1/artigos$` → 8791. O Antônio POSTa na URL WP antiga `https://dominio/wp-json/<ns>/v1/artigos`.
- **`apikey` e `ns` em sites.json DEVEM bater com o que o Antônio já tem cadastrado** — pegar de `D:/SISTEMAS/MinhasHospedagens/antonio-recovery/site_hosting_mapping.txt` (formato `hosting|dominio|ns|apikey`). NÃO usar a key auto-gerada pelo newsite.sh, senão Antônio toma 401. (medicodasmaos: ns `b5b7-api/v1`, key `f88f…15b7808`.)
- **`categoryMap`** aceita valores `{name,slug}` (não só string/numérico) — mapear os NOMES de categoria antigos do WP que o Antônio envia (`Doenças`,`Dicas`,`Artrite`,`Remédios`,`Fraturas`,`Mais Populares`,`Saúde`) para `{name,slug}` das editorias novas, senão `slugify(nome)` cria categoria fragmentada. Setar `defaultCategory` p/ uma editoria real (não "Notícias").
- **GOTCHA**: o `portal-engine.service` carrega render.js/archs.js em memória no boot. Após editar esses arquivos, **`systemctl restart portal-engine.service`** — senão o caminho do Antônio (publishArticle/rebuildIndexes) roda código velho (ex.: gera `/categoria/slug/` em vez de plano). Rebuilds manuais via `node -e require()` usam código novo, mas o serviço não.
- Teste ponta-a-ponta: `POST .../wp-json/<ns>/v1/artigos` com `X-API-KEY` + payload `{title,content,categories:[<nome WP>],image_base64,...}` → 201 `{success,post_id,url(plana)}`.

Piloto validado: medicodasmaos.com.br (70 posts → 5 editorias de medicina das mãos; recepção Antônio OK). Edits do engine (archs.js `dHeader`/`dHome`, render.js `rebuildIndexes`/`publishArticle`/`normCat`/`generateFavicons`) já estão em local D:\SISTEMAS\portal-engine + VPS.

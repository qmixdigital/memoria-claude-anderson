---
name: qmix-news-integration
description: API endpoint and credentials for automated news publishing via QMIX News platform
metadata: 
  node_type: memory
  type: reference
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
---

## QMIX News API

- **Endpoint canônico (Next.js):** `https://distribuidorasdealimentos.com.br/api/wp-json/sistema-qmix/v1/artigos`
- **Endpoint legado (QMIX panel usa esse):** `https://distribuidorasdealimentos.com.br/wp-json/sistema-qmix/v1/artigos` — funciona via rewrite nginx
- **Method:** POST
- **Auth:** Header `X-API-KEY: <<REMOVIDO>>`

### Rewrite ativo no novo VPS (srv1166087)

Direto dentro de `/etc/nginx/conf.d/distribuidoras.conf` (não há include separado como tinha no clinicas-vps):

```nginx
location ^~ /wp-json/ {
    rewrite ^/wp-json/(.*)$ /api/wp-json/$1 last;
}
```

### Histórico — incidente 22/06/2026

QMIX panel marcava notícias como "Usado" mas elas não chegavam no banco desde 29/05/2026 (~24 dias). Causa: o painel chamava `/wp-json/...` (URL WordPress legada) e o Next.js só expunha `/api/wp-json/...` → 404 silencioso, QMIX marcava como Usado mesmo assim.

### Diagnóstico

```bash
curl -X POST https://distribuidorasdealimentos.com.br/wp-json/sistema-qmix/v1/artigos \
  -H "X-API-KEY: nope" -d '{}'   # deve retornar 401, não 404
```

Se 404, o rewrite sumiu — verificar `/etc/nginx/conf.d/distribuidoras.conf` na seção `location ^~ /wp-json/`.

### Categorias seedadas

- Mercado (slug: mercado)
- Legislação (slug: legislacao)
- Logística (slug: logistica)
- Agronegócio (slug: agronegocio)
- Tecnologia (slug: tecnologia)
- Negócios (slug: negocios)

### Rotas públicas

- `/noticias` — listagem
- `/noticias/[slug]` — artigo individual (NewsArticle schema)
- `/noticias/categoria/[slug]` — filtrado por categoria

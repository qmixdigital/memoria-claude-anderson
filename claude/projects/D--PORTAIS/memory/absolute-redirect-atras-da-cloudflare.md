---
name: absolute-redirect-atras-da-cloudflare
description: 301 do nginx sai como http:// atrás da Cloudflare e custa um salto extra; `absolute_redirect off` resolve
metadata:
  node_type: memory
  type: project
---

Atrás da Cloudflare o nginx enxerga o esquema da conexão **origem**, que é
`http`. Um `return 301 /caminho/` então sai como:

```
Location: http://dominio.com.br/caminho/
```

O visitante veio por HTTPS, recebe um destino em HTTP, a Cloudflare o
redireciona de novo para HTTPS, e cada 301 do vhost vira **dois**. Numa
conversão isso pega justamente o que mais importa: o 301 de `/author/`, o de
`/wp-content/uploads/` e o da editoria órfã, que carregam sinal de SEO.

O conserto é uma linha no `server`:

```nginx
absolute_redirect off;
```

O nginx passa a devolver `Location: /caminho/`, relativo, e o navegador resolve
no esquema corrente. Conferir pelo cabeçalho cru, porque o `%{redirect_url}` do
curl **sempre** mostra a URL resolvida e esconde a diferença:

```bash
curl -s -o /dev/null -D - https://dominio/author/x/ | grep -i "^location"
```

Ver [[virada-dns-cloudflare-strict]].

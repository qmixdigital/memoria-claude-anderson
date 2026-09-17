---
name: nginx-error-page-410-hestiacp
description: "Na VPS hostinger-vps-srv1166087 o nginx.conf global tem error_page 410 e 404, e isso faz return 410 virar redirecionamento interno que pode ser capturado por regex de location"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 63176e52-9a9d-4e57-aac7-20bb14f54992
  modified: 2026-08-11T14:21:33.736Z
---

O `/etc/nginx/nginx.conf` da VPS `hostinger-vps-srv1166087` (HestiaCP) tem, em nível `http`, e portanto herdado por **todo** server block de **todos** os sites:

```
error_page 403 /error/404.html;
error_page 404 /error/404.html;
error_page 410 /error/410.html;
error_page 500 501 502 503 504 505 /error/50x.html;
```

**Consequência:** um `return 410` (ou 404) dentro de um `location` não responde direto. O nginx faz um **redirecionamento interno** para a URI `/error/410.html`, e essa URI **passa pela seleção de location outra vez**. Se qualquer `location ~*` do vhost casar com `.html`, ela captura a URI interna e a resposta do visitante passa a ser o que aquela regra disser.

No bitcao.com.br isso quebrou as regras de 410 do saneamento de hack: uma regra nova `location ~* \.html/?$ { return 301 .../pet-shop/; }` passou a interceptar `/error/410.html`, e as URLs de spam do hack começaram a devolver **301 para conteúdo do site** em vez de 410. Exatamente o oposto do objetivo, e silencioso: `nginx -t` passa, o log de acesso registra 301 e nada indica a causa.

**Como resolver** (aplicado no bitcao.conf): mandar o 410 para um *named location*, que não participa da seleção por regex.

```nginx
error_page 410 = @gone;
location @gone {
    default_type text/html;
    return 410 "<!doctype html>...410 Gone...";
}
```

O `=` faz o status vir do handler e o corpo explícito encerra o processamento sem disparar `error_page` de novo (`recursive_error_pages` é `off` por padrão).

**Regra prática:** em qualquer vhost desta VPS, ao escrever `location ~*` que casa com extensão de arquivo (`.html`, `.htm`, `.php`), verificar se não captura `/error/*`. Testar com curl **sem** `-L`, olhando o status imediato. Ver [[verificar-redirect-com-curl-sem-follow]].

Relacionado: [[deploy-bitcao-rm-assincrono]]

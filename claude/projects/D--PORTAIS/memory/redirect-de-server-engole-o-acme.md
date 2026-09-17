---
name: redirect-de-server-engole-o-acme
description: `if` em contexto de server roda antes da location e mata o desafio do certbot
metadata:
  type: feedback
---

Um `if ($host = apex) { return 301 https://www.dominio/... }` escrito em contexto
de `server` **roda na fase de rewrite, antes de o nginx escolher a `location`**.
O `location ^~ /.well-known/acme-challenge/` nunca chega a ser considerado, e a
emissão do certificado falha para o nome do apex dizendo que o desafio não foi
encontrado.

**Why:** o `^~` faz parecer que aquele prefixo ganha de tudo, e ele ganha de
outras `location`, não de um `return` no corpo do `server`. Como o portal
responde normalmente em todo o resto, o defeito só aparece na hora de emitir.

**How to apply:** o idioma padrão do nginx, marcando a intenção numa variável:

```nginx
set $vai_www 0;
if ($host = dominio.com.br) { set $vai_www 1; }
if ($request_uri ~ ^/\.well-known/) { set $vai_www 0; }
if ($vai_www = 1) { return 301 https://www.dominio.com.br$request_uri; }
```

Aconteceu no matogrossosaude.com.br, o único portal da rede canônico no `www` —
ver [[deploy-de-arch-aponta-para-a-vizinha]] para outros casos em que o print
não mostra o problema.

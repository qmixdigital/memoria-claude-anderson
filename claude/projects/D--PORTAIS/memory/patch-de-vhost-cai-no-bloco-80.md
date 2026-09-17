---
name: patch-de-vhost-cai-no-bloco-80
description: Regra inserida no primeiro `location /` do vhost entra no bloco de porta 80, onde ninguém passa; nginx -t aprova e nada muda
metadata:
  type: project
---

O vhost de portal tem **três blocos `server`**: porta 80 (só redireciona para
HTTPS), 443 do host canônico, e 443 do `www`. Um script que insere regra "antes do
primeiro `location / {`" acerta o bloco de **porta 80**.

O `nginx -t` aprova, o `systemctl reload` roda, o arquivo fica com a regra à
vista, e o comportamento não muda em nada. Aconteceu nos 34 portais da
clinicas-vps de uma vez, com o 301 de `/category/<editoria>/`.

**Why:** conferir lendo o arquivo confirma o defeito, porque a regra está lá
mesmo. Só o pedido de verdade mostra que ela não vale.

**How to apply:** recortar o bloco que casa `listen ...:443` **e** o
`server_name` canônico, contando chaves, e inserir só dentro dele. Depois,
provar com `curl -L` que a URL chega em 200. Ver
[[cat301-do-arquivo-de-categoria]] e [[conferir-por-captura-usar-cache-busting]].

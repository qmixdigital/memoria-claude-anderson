---
name: wp-json-com-til-engole-o-receptor
description: location ^~ /wp-json/ no nginx desliga a regex e a rota do Antônio vira 410; a plataforma para de entregar sem erro nenhum
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T18:46:58.890Z
---

O vhost de portal convertido tem duas regras competindo pelo mesmo caminho:

```nginx
location ~ /[a-z0-9_-]+/v1/artigos$ { proxy_pass http://127.0.0.1:8791; }   # receptor
location ^~ /wp-json/               { return 410; }                          # limpeza do WP
```

A plataforma do Antônio entrega em `/wp-json/<ns>/v1/artigos`. Com `^~` o nginx
**desliga a avaliação de regex** para aquele prefixo, então a primeira regra
nunca é alcançada e a entrega vira **410**. Sem `^~`, prefixo simples perde para
regex e tudo funciona: só o resto de `/wp-json/` cai no 410.

**Por que engana:** o site inteiro funciona, nenhuma página quebra, e a
plataforma marca a entrega como concluída. O portal apenas para de receber
conteúdo novo. Aconteceu no adonline e no viajenodetalhe, os dois convertidos em
20 e 21/08/2026; os outros 12 portais da opengravity não têm essa regra.

**Como provar em 5 segundos**, na origem, com o `Host` na mão para pular a
Cloudflare, que continua servindo o 410 do cache mesmo depois de corrigido:

```bash
curl -s -X POST -H 'Host: DOMINIO' -H 'X-API-KEY: <chave>' \
  -H 'Content-Type: application/json' -d '{}' http://IP/wp-json/<ns>/v1/artigos
```

`400 {"message":"title e content obrigatorios"}` significa chave aceita e rota
casada. `410` significa que a regra do `^~` está engolindo.

Ver [[campos-do-padrao-da-instancia]] e [[conversao-total]].

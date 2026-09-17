---
name: virada-dns-cloudflare-strict
description: Virar o DNS de um portal com a zona em Full (strict) e origem auto-assinada derruba o site com 526; a ordem que evita isso
metadata:
  type: project
---

As zonas da rede ficam em **Full (strict)**. Se o vhost novo só tem certificado
auto-assinado, virar o registro A derruba o site com **526** na hora. E a certbot
dos servidores tem só o plugin `webroot` (HTTP-01), que exige que o domínio já
aponte para a origem.

Ordem que resolve sem derrubar nada:

1. SSL da zona de `strict` para `full`
2. virar o registro A, proxied
3. `certbot certonly --webroot -w /var/www/acme -d dominio -d www.dominio`
4. `ssl_certificate` do vhost para `/etc/letsencrypt/live/<dominio>/`, reload
5. SSL de volta para `strict`, purga geral

**Why:** o impasse é real (strict recusa o auto-assinado, HTTP-01 exige o DNS já
virado) e sem essa ordem o site sai do ar no meio da migração.

**How to apply:** o caminho do desafio ACME tem que estar no vhost desde a
criação. Antes de voltar para `strict`, conferir o certificado servido com
`openssl s_client -connect <IP>:443 -servername <dominio>`. Usado assim no euvo
em 20/08/2026. Ver [[cloudflare-zone-id-por-dominio]] e
[[cloudflare-purge-token-de-conta]].

**O intervalo entre o passo 2 e o 5 devolve laço de redirecionamento**, e isso é
esperado: com a zona em `flexible` a borda fala HTTP com a origem, cai no bloco
da porta 80 que redireciona para HTTPS, e o navegador volta pelo mesmo caminho.
`curl` mostra `Location` idêntico à URL pedida.

**O `Server: cloudflare` na resposta engana.** A Cloudflare reescreve esse
cabeçalho em toda resposta proxiada, então um 301 do seu próprio nginx aparece
como se fosse dela, e a caça vai parar em page rules e redirect rules que não
existem. Antes de procurar regra na Cloudflare, conferir se algum bloco do vhost
produz aquele mesmo 301.

Sai sozinho quando o `strict` propaga, em cerca de um minuto. **Não mexer em
regra nenhuma nesse intervalo**: em 21/08/2026, no viajenodetalhe, quase reverti
um vhost que estava correto. Testar em laço até dar 200, com `?v=` diferente a
cada tentativa, em vez de concluir na primeira.

**O `www` precisa de bloco próprio na porta 443.** Com o proxy ligado, a
Cloudflare bate no origin com `Host: www.dominio`, e não com o apex. Se o bloco
de 443 declara só o apex no `server_name`, o `www` cai no `default_server` da
máquina e entrega o site errado, ou um 404 sem explicação. O bloco é curto e usa
o mesmo certificado, que já cobre os dois nomes:

```nginx
server {
    listen <IP>:443 ssl; http2 on;
    server_name www.dominio.com.br;
    ssl_certificate     /etc/letsencrypt/live/dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dominio.com.br/privkey.pem;
    return 301 https://dominio.com.br$request_uri;
}
```

**Montar a etapa 2 reaproveitando o miolo da etapa 1, nunca redigitando.** O
bloco carrega os milhares de slugs em 410, os 301 do WordPress e a rota do
Antônio. Gerar o arquivo novo por script que lê o antigo, corta as linhas de
`listen` e `server_name` e reembrulha, com `assert` conferindo que o `include` do
`gone.conf` e a rota `/v1/artigos$` sobreviveram. E mandar o script por `scp`:
por heredoc a contrabarra some e todo regex do vhost sai mutilado, sem o nginx
reclamar. Ver [[heredoc-come-contrabarra]].

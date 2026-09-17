---
name: 403-de-xmlrpc-vem-do-waf
description: "`xmlrpc.php` e `wp-login.php` respondem 403 pela Cloudflare, não pelo vhost: o 410 está correto e é medido no origin"
metadata:
  node_type: memory
  type: reference
---

Ao conferir os 410 de um portal convertido, `xmlrpc.php` e `wp-login.php`
aparecem como **403**, e não 410, o que parece regra quebrada no vhost.

Não é. O 410 do vhost funciona: medido **direto no origin**, com
`--resolve <dominio>:443:<IP>`, sai 410. O 403 vem do **WAF da Cloudflare**, que
bloqueia esses caminhos antes de chegarem ao servidor.

Vale para toda a rede e não é defeito: melhor ainda, a requisição nem chega no
origin.

**How to apply:** sempre que um código de status não bater com a regra do vhost,
medir nos dois lados antes de mexer:

```bash
curl -s -o /dev/null -w "%{http_code}\n" --resolve DOM:443:IP https://DOM/xmlrpc.php   # origin
curl -s -o /dev/null -w "%{http_code}\n" https://DOM/xmlrpc.php                        # borda
```

É o mesmo cuidado de [[virada-dns-cloudflare-strict]], onde o `Server: cloudflare`
faz um 301 do próprio nginx parecer regra da Cloudflare.

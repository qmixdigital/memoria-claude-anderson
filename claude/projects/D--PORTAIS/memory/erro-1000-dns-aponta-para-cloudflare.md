---
name: erro-1000-dns-aponta-para-cloudflare
description: Registro A apontando para IP da própria Cloudflare derruba o domínio com 403 para todo mundo
metadata:
  type: project
---

O `incast.com.br` estava **fora do ar** e ninguém sabia: os quatro registros A e
os quatro AAAA do apex e do www apontavam para **IPs da própria Cloudflare**
(`104.21.16.153`, `172.67.213.169`). Ela recusa isso com o **erro 1000, "DNS
points to prohibited IP"**, e o domínio respondia **403 para qualquer
visitante**.

**Why:** acontece quando alguém copia o IP que o `dig` devolve — que é o da
Cloudflare, e não o da origem — de volta para o registro A.

**How to apply:** ao abrir uma zona antes de virar, olhar o `content` dos A. IP
em `104.16-31.x`, `172.64-71.x` ou `2606:4700::` é da Cloudflare e nunca pode
estar num registro A da própria zona.

⚠️ **Cada nome pode ter mais de um A.** O `virada_<portal>.py` atualiza só o
primeiro: com dois, o segundo fica no IP errado e o resolvedor devolve os dois,
mandando metade das visitas para o erro. O `virada_incast.py` apaga **todos** os
A, AAAA e CNAME do apex e do www antes de criar um único A.

⚠️ **O 403 sobrevive à virada, por cache.** Com o A já correto o apex continuou
em 403 enquanto o `www` respondia 200: a página de erro estava em cache e a purga
total não bastou. O que resolveu foi ligar o **development mode**, confirmar o
200 e desligar.

Ver [[virada-dns-cloudflare-strict]] e [[zona-cloudflare-fora-das-contas]].

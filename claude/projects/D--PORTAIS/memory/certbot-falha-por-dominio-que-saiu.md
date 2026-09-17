---
name: certbot-falha-por-dominio-que-saiu
description: Certificado de domínio que não mora mais na máquina derruba o certbot inteiro, e o erro esconde os que renovam
metadata:
  type: project
---

Na opengravity o `certbot.service` falhava havia semanas: **77 erros em 30
dias**. A causa eram três certificados de domínios que **não têm mais vhost na
máquina** (`cirurgiadojoelhogoiania.com`, `portugaldigital.com.br`,
`qmix.com.br`): o desafio ACME dá 404 porque ninguém serve
`/.well-known/acme-challenge/` para eles.

O certbot renova os 29 bons, falha nos 3 órfãos e **sai com exit 1**. Como o
serviço termina em erro, o alerta some no meio do ruído — e um certificado real
chegou a 5 dias do vencimento sem ninguém ver.

**How to apply:** conferir se algum vhost aponta para o certificado
(`grep -rl "letsencrypt/live/<dominio>/" /etc/nginx/`) e, se não houver,
`certbot delete --cert-name <dominio>`. Depois, `systemctl start certbot.service`
tem que terminar com `Result=success`.

⚠️ **Só a opengravity usa Let's Encrypt.** As outras duas máquinas servem
**certificado de origem da Cloudflare**, válido até 2036, e não têm o `certbot`
instalado — script de diagnóstico que o chama sem `try` morre nelas.

Ver [[virada-dns-cloudflare-strict]].

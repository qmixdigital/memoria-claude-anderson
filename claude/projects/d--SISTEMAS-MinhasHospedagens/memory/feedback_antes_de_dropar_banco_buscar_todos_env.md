---
name: antes-de-dropar-banco-buscar-todos-env
description: "Erro de 18/10/2026: apaguei o MySQL peritodicas_v2 porque o grep não olhou /home/qmix/web/*/shared/.env; peritodicas ficou 3h45 com erro de banco"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T17:50:01.104Z
---

Em 18/10/2026, na limpeza da opengravity, apaguei o banco MySQL `peritodicas_v2` achando que era resto. O app do peritodicas (Next, em `/home/qmix/web/peritodicas.com/nextapp`) lê esse banco pelo `.env` em `/home/qmix/web/peritodicas.com/shared/.env`, lugar que meu `grep` não cobria (eu só olhei `/var/www/*/.env*` e os `wp-config.php`). O site passou cerca de 3h45 com `Unknown database` nas partes dinâmicas até eu notar nos logs e restaurar do dump que tinha feito antes (31.150 peritos, 346 artigos e 61 leads voltaram). O operador então disse: **site de perito não é para fazer alterações**.

**Why:** o peritodicas tem leads e peritos reais e o operador quer o site intocado.
**How to apply:** (1) NÃO mexer no peritodicas (banco `peritodicas_v2`, WordPress `qmix_26167`, pastas em `/home/qmix/web/peritodicas.com`) sem pedido explícito. (2) Antes de qualquer DROP de banco, procurar o nome em TODOS os `.env`, `.env.*`, `*.php`, `ecosystem.config.*` e `*.json` de `/home /srv /var/www /opt /root /etc`, e conferir o `pm2 jlist` (cada app tem o seu `cwd`). (3) Fazer o dump ANTES e guardar, como aconteceu aqui: foi o que permitiu desfazer. (4) Depois de remover algo, olhar `pm2 logs` das apps vizinhas por 5 minutos. Ver [[opengravity-limpeza-20261018]].

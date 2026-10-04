---
name: reference_dominios_sites
description: "Domínios públicos reais dos 4 sites SMM (portuga = portugaldigital.com.br, não portuga.com.br)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-08-21T12:00:28.790Z
---

Domínios públicos reais dos 4 sites SMM (para curl/verificação ao vivo):

- **enjai** → `enjai.social` (desde 2026-10-03; `enjai.com.br` só redireciona 301, ver [[project_migracao_dominio_enjai_social]])
- **truenet** → `www.truenet.com.br`
- **skipark** → `www.skipark.com.br`
- **portuga** → `www.portugaldigital.com.br` ⚠️ (NÃO é `portuga.com.br` — bater no domínio errado retorna 000/timeout e parece que o site caiu, mas é só domínio inexistente)

O nome interno do projeto/pasta/processo é "portuga" (`/var/www/portuga`, pm2 `portuga`/`portuga-b` portas 3022/3023, nginx server_name `portugaldigital.com.br`), mas o domínio de verdade é portugaldigital.com.br.

Ver [[project_migracao_enjai_srv1166087]] e [[reference_servidor_opengravity]].

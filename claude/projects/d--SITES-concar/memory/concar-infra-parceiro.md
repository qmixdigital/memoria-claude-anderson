---
name: concar-infra-parceiro
description: "Infra/deploy do Concar — VPS de parceiro, deploy manual no Coolify"
metadata: 
  node_type: memory
  type: project
  originSessionId: 24ee2264-5b12-4716-bf06-61ee77213ed9
---

A produção do **Concar** roda em Coolify numa **VPS de um parceiro** (o usuário não contratou a infra). Provedor **a confirmar**: hostname `*.hstgr.cloud` e IP `2.24.220.46` sugerem **Hostinger**; docs antigas diziam "Hetzner" (provavelmente errado). Acesso: `ssh concar-lucas`, painel Coolify `http://2.24.220.46:8000`.

**Deploy é MANUAL** — o Coolify **não tem webhook do GitHub**, então `git push origin main` NÃO deploya sozinho. É preciso triggar no painel ou via API. Procedimento em `docs/07`. `docker-entrypoint.sh` roda `prisma db push` (sem migrations → mudanças de schema devem ser **aditivas**) + seed idempotente.

Ver [[concar-seo-geo-padrao]].

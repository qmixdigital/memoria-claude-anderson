---
name: opengravity-limpeza-20261018
description: "Estado da opengravity após a limpeza e conversão para estático de 18/10/2026: o que saiu, o que sobrou pendente e armadilhas"
metadata:
  node_type: memory
  type: project
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T17:40:56.542Z
---

Em 18/10/2026 a opengravity foi de 86% para 55% de disco e de 18 para 9 apps PM2. Saíram: skipark, geladeirastop (migrado para a srv1166087), tendenciasmarketing (estático no Pages, projeto na conta23), notebookx e arcondicionadotop (estáticos no Pages, DNS CNAME), e ebookcult-dir (estático servido pelo gateway og-ingresso). Runbooks e scripts em `D:/SISTEMAS/MinhasHospedagens/Opengravity/limpeza-2026-10/` e `.../estatico-diretorios/`; dumps e códigos em `D:/SISTEMAS/MinhasHospedagens/backups/`.

Restam, só com ordem do operador: decidir em jan/2027 se o diretório de livrarias do ebookcult fica (`gsc_keep.py`); tratar as 8 reivindicações pendentes do notebookx (dump `claim_requests`). Resolvido no mesmo dia: DNS órfãos apagados (dev.notebookx, staging-arcondicionado) e consultarimovel atrás do Cloudflare (proxy ligado + WAF `managed_challenge` nas fichas sem referer; origem foi de ~860 para ~25 req/min). Os bancos MySQL de blogs antigos de clientes (cirurgiadojoelho, henrique bufaical, bruno air, coluna, clínicas SP) e do qmix.com.br antigo foram apagados a pedido do operador em 18/10 (via `v-delete-database`; cópia em `mysql-orfaos-20261018.tar`, local). NÃO foram tocados: `qmix_26167`, `qmix_39219`, `qmix_81941`, `peritodicas_v2` (peritodicas) e `qmix_67882` (blog do Tredicci).

**Why:** a opengravity tem 2 vCPU/8 GB e carregava 18 apps, dois deles diretórios com 150 a 445 mil fichas e zero tráfego.
**How to apply:** antes de propor remover um banco "sem referência", identificar o que ele era (siteurl/blogname) — nove deles eram blogs de clientes, não lixo. Webhook do Asaas é da conta inteira, então `payment_events` de um app mistura todos os produtos [[asaas-webhook-conta-inteira]]. O ebookcult segue o desenho descrito em [[ebookcult-diretorio-estatico-gateway]]. O Cloudflare barra com 1015 quem testa centenas de URLs de uma vez: usar ~2 a 8 req/s. Nunca `pkill -f nome` num comando ssh que contém o nome (mata a própria sessão): usar `pkill -f "[n]ome"`.

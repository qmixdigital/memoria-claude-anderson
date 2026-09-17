---
name: gsc-coe-acesso
description: Como consultar o Search Console da COE (coegoiania.com.br) e de outros clientes de ortopedia pela conta de serviço do app de indexação na VPS; achados de 11/09/2026
metadata:
  type: reference
---

A conta de serviço da revista (`revistamsaude-stats@...`) só enxerga a própria revista. Para clientes, usar as contas de serviço do app de indexação na VPS opengravity, em `/var/www/qmix-indexation-api/`:
- `gsc-service-account.json` (enjai-ga4-reader@enjai-493011): **owner em sc-domain:coegoiania.com.br**, drtiagobernardes.com.br; 96 propriedades.
- `gsc-service-account-2.json` (backlinkguard): drhenriquebufaical, drbrunoair, drthiagotredicci, ortopediacoluna, institutoortopedico, ortopedistadeombro; 91 propriedades.
- `gsc-service-account-3.json` (seoqmix): coegoiania (full user); 21 propriedades.

Rodar um `.mjs` de dentro de `/var/www/revistamsaude` (tem `googleapis`) passando `credentials: JSON.parse(fs.readFileSync(...))` ao `GoogleAuth`. Script usado: scratchpad `gsc-coe.mjs` (16 meses query+página, paginado a 25 mil).

**Achados de 11/09/2026 (COE):** 884 mil cliques e 124 milhões de impressões em 16 meses; 420 mil cliques nos últimos 3 meses. O blog domina buscas de sintoma ("dor na perna esquerda" 162 mil impr/3m na posição 2). O domínio principal teve **invasão com spam indonésio de cassino** (consultas "slot gacor", "togel" em /equipe/, /tipos-de-fisioterapia/ etc.), com milhões de impressões em 2025 e zero nos últimos 3 meses: já limpo, mas o cliente deve conferir remoções no GSC. Lista de oportunidades para a revista em `coe-oportunidades.json` / `coe-rows.json` do scratchpad (perde ao fim da sessão; regerar com o script).

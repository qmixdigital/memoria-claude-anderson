---
name: project-notadecorte-estatico-payload
description: "notadecorte.ia.br é estático SEM React (13.082 páginas, diretório completo de 5.718 instituições) gerado do app Academus local (banco SISU 2020 a 2026); simulador em JS com /dados/sisu/*.json; pipeline no LEIA-ME; sem GA4/AdSense; nova edição do SISU vem das planilhas do Portal Sisu + reconciliar campus."
metadata:
  node_type: memory
  type: project
  originSessionId: b4a2f233-d815-4b12-972d-2cb3a5fe7b22
  modified: 2026-10-20T00:11:13.553Z
---

Em 19/10/2026 o site notadecorte.ia.br (ex-Academus) foi regenerado inteiro, duas vezes no mesmo dia: primeiro só as 203 páginas editoriais/SISU, depois (a pedido do operador) com o diretório completo: 5.718 fichas de instituição, 6.088 páginas curso×estado/cidade de faculdades, 1.073 de cursos técnicos, total 13.082 páginas (limite do Pages é 20.000 arquivos). As 29.677 instituições sem oferta ficaram `oculto=true` no banco, então os contadores da home (5.718 instituições, 79.650 cursos) são reais. App Next original (D:/SITES/academus/app, fonte ajustada) rodando local com Postgres temporário (dump D:/SISTEMAS/MinhasHospedagens/backups/academus-com-sisu2026-20261019.dump), congelado com mirror_next.py (~40 min com 4 workers), runtime do Next removido, simulador reescrito em JS cliente (`site/sim.js` + `site/dados/sisu/*.json`). SISU 2026 importado das planilhas oficiais do Portal Sisu (xlsx → `scripts/xlsx2grades.py` → `import-sisu.mjs`), validado contra a API de 2025. Pipeline e comandos em D:/SITES/notadecorte.ia.br/LEIA-ME.md; scripts em `scripts/`.

**Why:** a cópia estática anterior mantinha o payload RSC e o React re-renderizava links mortos; o simulador era server-side; os dados paravam em 2025; o diretório anunciado na home não existia. Tirar o React resolveu o mismatch; ocultar instituições sem oferta deixou os números honestos e o site dentro do limite do Pages.

**How to apply:** (1) edição nova do SISU: planilhas em https://sisu.mec.gov.br/static/pdf/json_arquivos.json, converter, importar e DEPOIS reconciliar `campus_nome` do ano novo com o anterior por (ies_slug, cidade_slug, turno, grau, curso_slug) quando único (em 2026 foram 512 de 754 ofertas de saúde), depois `export_sisu.py` e re-crawl. (2) A API sisu-api.sisu.mec.gov.br só serve a edição corrente. (3) Build do app com ISR grava 404 nas páginas de curso: manter force-dynamic. (4) `scan.py` conta `data-href` como link morto (falso positivo); `seo_audit.py` é a referência. (5) Sem GA4/AdSense por decisão do operador. (6) Operações pesadas em 13 mil arquivos (find/du/grep -r) estouram o timeout de 5 min desta ferramenta: rodar em background com log. Relacionado: [[academus-para-notadecorte]], [[conversao-estatico-clinicas-vps]].

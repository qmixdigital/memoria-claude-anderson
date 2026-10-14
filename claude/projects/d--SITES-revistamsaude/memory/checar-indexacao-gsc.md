---
name: checar-indexacao-gsc
description: Para saber se uma matéria da revista está indexada, usar a Inspeção de URL do Search Console pela conta da revista na VPS, não a SerpApi (check_index.py oscila e gasta crédito do Apex à toa)
metadata:
  type: feedback
---

Em 13/10/2026 o `check_index.py` (SerpApi, busca `site:URL`) deu "não indexado" para URLs que o Search Console confirmou como "Submitted and indexed", e deu resultados diferentes para as mesmas URLs em duas rodadas seguidas ("Google hasn't returned any results for this query"). Em 03/10 isso levou a enviar 3 URLs ao Apex (3 créditos cada) que provavelmente já estavam indexadas.

**Why:** a SerpApi devolve vazio de forma intermitente, e vazio é lido como "não indexado". As matérias da revista costumam ser indexadas em poucas horas depois do IndexNow e do sitemap.

**How to apply:** antes de gastar Apex, rodar a Inspeção de URL (API `searchconsole.urlInspection.index.inspect`, com `GSC_SITE_URL` e `node --env-file=.env` dentro de `/var/www/revistamsaude`; script de exemplo `gsc-insp2.mjs`, passando os slugs por `SLUGS`). `verdict PASS` e `Submitted and indexed` = indexada. Só mandar ao Apex o que a inspeção mostrar como "URL is unknown to Google" ou "Discovered/Crawled - currently not indexed". Ver [[indexnow-bing]].
